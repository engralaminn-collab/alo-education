import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { counselor_id } = await req.json();
    const targetCounselorId = counselor_id || user.id;

    // Fetch tasks and related data
    const tasks = await base44.asServiceRole.entities.Task.filter({ 
      assigned_to: targetCounselorId,
      status: { $in: ['pending', 'in_progress'] }
    });
    const students = await base44.asServiceRole.entities.StudentProfile.filter({ 
      counselor_id: targetCounselorId 
    });
    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 500);

    // Enrich tasks with context
    const enrichedTasks = tasks.map(task => {
      const student = students.find(s => s.id === task.student_id);
      const studentApps = applications.filter(a => a.student_id === task.student_id);
      
      const nearestDeadline = studentApps
        .filter(a => a.offer_deadline)
        .map(a => new Date(a.offer_deadline).getTime())
        .sort((a, b) => a - b)[0];

      const daysToDeadline = nearestDeadline 
        ? Math.floor((nearestDeadline - Date.now()) / (1000 * 60 * 60 * 24))
        : 999;

      return {
        ...task,
        student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
        student_status: student?.status || 'unknown',
        days_to_deadline: daysToDeadline,
        applications_count: studentApps.length
      };
    });

    // AI prioritization
    const prioritizationPrompt = `
Prioritize these counselor tasks based on urgency, application deadlines, and student needs.

Tasks:
${enrichedTasks.slice(0, 30).map(t => `
- Task: ${t.title}
  Student: ${t.student_name} (${t.student_status})
  Priority: ${t.priority || 'medium'}
  Due: ${t.due_date || 'Not set'}
  Days to Application Deadline: ${t.days_to_deadline === 999 ? 'No deadline' : t.days_to_deadline}
  Type: ${t.task_type || 'general'}
`).join('\n')}

Prioritization Criteria:
1. Application deadlines (most urgent)
2. Task due dates
3. Student at-risk status
4. Task complexity and time required
5. Impact on student success

Provide priority scores (0-100) and reasoning.
`;

    const prioritization = await base44.integrations.Core.InvokeLLM({
      prompt: prioritizationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          prioritized_tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_title: { type: "string" },
                priority_score: { type: "number" },
                urgency_level: { type: "string", enum: ["critical", "high", "medium", "low"] },
                reasoning: { type: "string" },
                recommended_action: { type: "string" },
                estimated_time_minutes: { type: "number" }
              }
            }
          },
          daily_focus: { type: "array", items: { type: "string" } },
          quick_wins: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Match back to actual task IDs
    const tasksPrioritized = prioritization.prioritized_tasks.map(pt => {
      const task = enrichedTasks.find(t => 
        t.title.toLowerCase().includes(pt.task_title.toLowerCase()) ||
        pt.task_title.toLowerCase().includes(t.title.toLowerCase())
      );
      return task ? { ...task, ...pt } : null;
    }).filter(Boolean);

    return Response.json({
      success: true,
      prioritized_tasks: tasksPrioritized,
      daily_focus: prioritization.daily_focus,
      quick_wins: prioritization.quick_wins
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});