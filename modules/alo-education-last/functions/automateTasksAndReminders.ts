import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, run_for_all } = await req.json();

    // Fetch data
    const students = run_for_all 
      ? await base44.asServiceRole.entities.StudentProfile.filter({ status: { $in: ['in_progress', 'applied', 'ready_to_apply'] } })
      : [await base44.asServiceRole.entities.StudentProfile.get(student_id)];

    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 500);
    const communications = await base44.asServiceRole.entities.CommunicationLog.list('-created_date', 500);
    const existingTasks = await base44.asServiceRole.entities.Task.list('-created_date', 500);
    const existingReminders = await base44.asServiceRole.entities.Reminder?.list('-created_date', 200) || [];

    const automatedActions = [];

    for (const student of students) {
      const studentApps = applications.filter(a => a.student_id === student.id);
      const studentComms = communications.filter(c => c.student_id === student.id);
      const studentTasks = existingTasks.filter(t => t.student_id === student.id && t.status !== 'completed');

      // Calculate engagement metrics
      const daysSinceLastContact = studentComms.length > 0 
        ? Math.floor((Date.now() - new Date(studentComms[0].created_date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      const hasUpcomingDeadlines = studentApps.some(app => {
        if (app.offer_deadline) {
          const daysUntilDeadline = Math.floor((new Date(app.offer_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilDeadline <= 14 && daysUntilDeadline > 0;
        }
        return false;
      });

      // AI analysis for follow-up recommendations
      const analysisPrompt = `
Analyze this student's situation and recommend follow-up actions:

Student: ${student.first_name} ${student.last_name}
Status: ${student.status}
Days since last contact: ${daysSinceLastContact}
Active applications: ${studentApps.length}
Upcoming deadlines: ${hasUpcomingDeadlines ? 'Yes' : 'No'}
Pending tasks: ${studentTasks.length}

Application details:
${studentApps.map(app => `- Status: ${app.status}, University: ${app.university_id}`).join('\n')}

Recent communications:
${studentComms.slice(0, 3).map(c => `- ${c.channel}: ${c.content?.substring(0, 100)}`).join('\n')}

Recommend:
1. Should we schedule a follow-up? When?
2. What type of reminder/task is needed?
3. Urgency level
4. Specific action items
`;

      const aiRecommendation = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            should_follow_up: { type: "boolean" },
            follow_up_reason: { type: "string" },
            follow_up_date: { type: "string" },
            urgency: { type: "string", enum: ["low", "medium", "high", "urgent"] },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action_type: { type: "string", enum: ["call", "email", "whatsapp", "meeting", "document_reminder", "deadline_follow_up"] },
                  title: { type: "string" },
                  description: { type: "string" },
                  due_date: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (aiRecommendation.should_follow_up) {
        // Create automated tasks
        for (const action of aiRecommendation.recommended_actions || []) {
          const newTask = await base44.asServiceRole.entities.Task.create({
            title: action.title,
            description: action.description,
            student_id: student.id,
            assigned_to: student.counselor_id,
            priority: aiRecommendation.urgency,
            due_date: action.due_date,
            status: 'pending',
            task_type: action.action_type,
            created_by_ai: true
          });

          automatedActions.push({
            type: 'task_created',
            student_id: student.id,
            task_id: newTask.id,
            action
          });
        }

        // Create reminder if applicable
        if (aiRecommendation.follow_up_date) {
          const reminder = await base44.asServiceRole.entities.Reminder?.create({
            student_id: student.id,
            counselor_id: student.counselor_id,
            reminder_type: 'follow_up',
            reminder_date: aiRecommendation.follow_up_date,
            message: aiRecommendation.follow_up_reason,
            priority: aiRecommendation.urgency,
            status: 'pending',
            created_by_ai: true
          });

          automatedActions.push({
            type: 'reminder_created',
            student_id: student.id,
            reminder_id: reminder?.id,
            reason: aiRecommendation.follow_up_reason
          });
        }
      }
    }

    return Response.json({
      success: true,
      actions_taken: automatedActions.length,
      automated_actions: automatedActions
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});