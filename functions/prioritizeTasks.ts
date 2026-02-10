import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { counselor_id } = await req.json();

    // Fetch counselor's tasks
    const tasks = await base44.asServiceRole.entities.Task.filter({ 
      assigned_to: counselor_id,
      status: { $in: ['pending', 'in_progress'] }
    });

    if (tasks.length === 0) {
      return Response.json({ success: true, message: 'No tasks to prioritize' });
    }

    // Fetch related data
    const studentIds = [...new Set(tasks.map(t => t.student_id).filter(Boolean))];
    const students = await Promise.all(
      studentIds.map(id => base44.asServiceRole.entities.StudentProfile.get(id).catch(() => null))
    );
    const studentMap = Object.fromEntries(students.filter(Boolean).map(s => [s.id, s]));

    const applicationIds = [...new Set(tasks.map(t => t.application_id).filter(Boolean))];
    const applications = await Promise.all(
      applicationIds.map(id => base44.asServiceRole.entities.Application.get(id).catch(() => null))
    );
    const appMap = Object.fromEntries(applications.filter(Boolean).map(a => [a.id, a]));

    // AI prioritization analysis
    const prioritizationPrompt = `
You are an expert education counselor AI. Analyze these tasks and provide intelligent prioritization.

Tasks: ${JSON.stringify(tasks.map(t => ({
  id: t.id,
  title: t.title,
  type: t.type,
  priority: t.priority,
  due_date: t.due_date,
  student_status: studentMap[t.student_id]?.status,
  application_status: appMap[t.application_id]?.status,
  application_deadline: appMap[t.application_id]?.offer_deadline
})))}

Prioritization Factors:
1. Application deadlines proximity (urgent if < 7 days)
2. Current priority level (urgent > high > medium > low)
3. Task type criticality (visa > offer > document > follow_up)
4. Student status (applied > ready_to_apply > in_progress)
5. Overdue tasks (critical priority)
6. Counselor workload distribution

For each task, provide:
- Calculated urgency score (0-100)
- New priority level
- Reasoning
- Suggested follow-up actions if overdue

Return array of task priorities.
    `;

    const aiPriorities = await base44.integrations.Core.InvokeLLM({
      prompt: prioritizationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          task_priorities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: { type: "string" },
                urgency_score: { type: "number" },
                new_priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                reasoning: { type: "string" },
                follow_up_actions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    // Update task priorities
    const updates = [];
    for (const priority of aiPriorities.task_priorities) {
      const task = tasks.find(t => t.id === priority.task_id);
      if (task && task.priority !== priority.new_priority) {
        await base44.asServiceRole.entities.Task.update(priority.task_id, {
          priority: priority.new_priority,
          notes: `${task.notes || ''}\n\nAI Priority: ${priority.reasoning}`
        });
        updates.push(priority);
      }
    }

    return Response.json({
      success: true,
      tasks_analyzed: tasks.length,
      tasks_updated: updates.length,
      priorities: aiPriorities.task_priorities
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});