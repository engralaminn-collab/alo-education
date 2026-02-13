import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, milestone_type, milestone_details } = await req.json();

    // Fetch student data
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id });
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter(
      { student_id },
      '-created_date',
      20
    );

    // Milestone-specific context
    const milestoneContexts = {
      'offer_received': 'Student has received an offer and needs guidance on next steps',
      'visa_submitted': 'Visa application submitted, awaiting decision',
      'visa_approved': 'Visa approved, prepare for enrollment',
      'enrolled': 'Successfully enrolled, pre-departure guidance needed',
      'application_submitted': 'Application submitted, tracking and updates needed',
      'documents_completed': 'All documents ready, application ready to submit'
    };

    // AI follow-up plan generation
    const planPrompt = `
Generate a comprehensive, personalized follow-up plan for this student milestone.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Career Goals: ${student.career_goals || 'Not specified'}

Milestone: ${milestone_type}
Context: ${milestoneContexts[milestone_type] || milestone_details}

Applications:
${applications.map(app => `- ${app.status} at ${app.university_id}`).join('\n') || 'None'}

Recent Communication Topics:
${communications.slice(0, 5).map(c => c.key_topics?.join(', ')).filter(Boolean).join(' | ') || 'None'}

Generate a structured follow-up plan with:
1. Immediate actions (within 24-48 hours)
2. Short-term follow-ups (within 1 week)
3. Medium-term milestones (within 1 month)
4. Key information to provide
5. Recommended touchpoints and channels
6. Success criteria and checkpoints
`;

    const followUpPlan = await base44.integrations.Core.InvokeLLM({
      prompt: planPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          immediate_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                timeframe: { type: "string" },
                channel: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high", "urgent"] }
              }
            }
          },
          short_term_followups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                followup: { type: "string" },
                days_from_now: { type: "number" },
                channel: { type: "string" },
                talking_points: { type: "array", items: { type: "string" } }
              }
            }
          },
          medium_term_milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                milestone: { type: "string" },
                target_date: { type: "string" },
                requirements: { type: "array", items: { type: "string" } }
              }
            }
          },
          key_information: {
            type: "array",
            items: { type: "string" }
          },
          success_criteria: {
            type: "array",
            items: { type: "string" }
          },
          personalized_notes: { type: "string" }
        }
      }
    });

    // Create automated tasks and reminders
    const createdTasks = [];

    for (const action of followUpPlan.immediate_actions || []) {
      const task = await base44.asServiceRole.entities.Task.create({
        title: `[${milestone_type}] ${action.action}`,
        description: `Follow-up for milestone: ${milestone_type}`,
        student_id: student.id,
        assigned_to: student.counselor_id,
        priority: action.priority,
        due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        task_type: 'milestone_followup',
        created_by_ai: true
      });
      createdTasks.push(task.id);
    }

    for (const followup of followUpPlan.short_term_followups || []) {
      const reminderDate = new Date(Date.now() + followup.days_from_now * 24 * 60 * 60 * 1000);
      await base44.asServiceRole.entities.Reminder?.create({
        student_id: student.id,
        counselor_id: student.counselor_id,
        reminder_type: 'milestone_followup',
        reminder_date: reminderDate.toISOString(),
        message: followup.followup,
        priority: 'medium',
        status: 'pending',
        created_by_ai: true
      });
    }

    return Response.json({
      success: true,
      follow_up_plan: followUpPlan,
      tasks_created: createdTasks.length,
      milestone: milestone_type
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});