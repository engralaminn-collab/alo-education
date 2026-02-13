import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const students = await base44.asServiceRole.entities.StudentProfile.list();
    const applications = await base44.asServiceRole.entities.Application.list();
    const counselors = await base44.asServiceRole.entities.Counselor.list();

    const suggestedTasks = [];

    for (const student of students) {
      const studentApps = applications.filter(a => a.student_id === student.id);

      // Check for missing documents
      if (student.profile_completeness < 70) {
        suggestedTasks.push({
          student_id: student.id,
          counselor_id: student.counselor_id,
          task_title: `Complete profile for ${student.first_name} ${student.last_name}`,
          task_description: 'Student profile is incomplete. Request missing documents and information.',
          task_type: 'document_request',
          priority: 'high',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ai_generated: true
        });
      }

      // Check for application deadlines
      for (const app of studentApps) {
        if (app.offer_deadline) {
          const daysUntilDeadline = Math.ceil((new Date(app.offer_deadline) - new Date()) / (1000 * 60 * 60 * 24));
          if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
            suggestedTasks.push({
              student_id: student.id,
              counselor_id: student.counselor_id,
              task_title: `Offer deadline approaching for ${student.first_name}`,
              task_description: `Offer deadline is in ${daysUntilDeadline} days. Follow up with student.`,
              task_type: 'application_deadline',
              priority: daysUntilDeadline <= 3 ? 'urgent' : 'high',
              due_date: app.offer_deadline,
              ai_generated: true
            });
          }
        }
      }

      // Follow-up for new leads
      if (student.status === 'new_lead' || student.status === 'contacted') {
        const daysSinceCreated = Math.ceil((new Date() - new Date(student.created_date)) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated >= 2) {
          suggestedTasks.push({
            student_id: student.id,
            counselor_id: student.counselor_id,
            task_title: `Follow up with ${student.first_name} ${student.last_name}`,
            task_description: `Lead created ${daysSinceCreated} days ago. Schedule consultation call.`,
            task_type: 'follow_up',
            priority: 'medium',
            due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            ai_generated: true
          });
        }
      }

      // Visa status reminders
      if (student.visa_status === 'pending' || student.visa_status === 'in_process') {
        suggestedTasks.push({
          student_id: student.id,
          counselor_id: student.counselor_id,
          task_title: `Check visa status for ${student.first_name}`,
          task_description: 'Follow up on visa application progress.',
          task_type: 'visa_reminder',
          priority: 'medium',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ai_generated: true
        });
      }
    }

    // Create suggested tasks
    const createdTasks = [];
    for (const task of suggestedTasks) {
      const existing = await base44.asServiceRole.entities.AutomatedTask.filter({
        student_id: task.student_id,
        task_type: task.task_type,
        status: { $in: ['pending', 'in_progress'] }
      });

      if (existing.length === 0) {
        const created = await base44.asServiceRole.entities.AutomatedTask.create(task);
        createdTasks.push(created);
      }
    }

    return Response.json({ 
      success: true, 
      tasksGenerated: createdTasks.length,
      tasks: createdTasks
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});