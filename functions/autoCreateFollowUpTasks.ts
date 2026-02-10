import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function can be called by automation or manually
    const { application_id, student_id, trigger_type } = await req.json();

    if (!application_id) {
      return Response.json({ error: 'Application ID required' }, { status: 400 });
    }

    // Get application details
    const application = await base44.asServiceRole.entities.Application.filter({ id: application_id });
    if (!application || application.length === 0) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    const app = application[0];
    const createdTasks = [];

    // Get student profile
    const studentProfile = await base44.asServiceRole.entities.StudentProfile.filter({ 
      id: app.student_id 
    });
    const student = studentProfile[0];

    // Task creation based on status and deadlines
    const now = new Date();

    // Status-based task creation
    if (app.status === 'conditional_offer' && app.offer_deadline) {
      const deadline = new Date(app.offer_deadline);
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
        const task = await base44.asServiceRole.entities.Task.create({
          title: 'Urgent: Offer Deadline Approaching',
          description: `Conditional offer deadline is in ${daysUntilDeadline} days. Follow up with student to accept offer and meet conditions.`,
          type: 'follow_up',
          student_id: app.student_id,
          application_id: app.id,
          assigned_to: student?.counselor_id,
          status: 'pending',
          priority: 'urgent',
          due_date: new Date(deadline.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        createdTasks.push(task);
      }
    }

    if (app.status === 'documents_pending') {
      const task = await base44.asServiceRole.entities.Task.create({
        title: 'Follow-up: Pending Documents',
        description: 'Check with student on document submission status and assist if needed.',
        type: 'document_review',
        student_id: app.student_id,
        application_id: app.id,
        assigned_to: student?.counselor_id,
        status: 'pending',
        priority: 'high',
        due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      createdTasks.push(task);
    }

    if (app.status === 'unconditional_offer' && !app.visa_status) {
      const task = await base44.asServiceRole.entities.Task.create({
        title: 'Guide Student: Visa Application',
        description: 'Congratulate student on offer and guide them through visa application process.',
        type: 'visa_check',
        student_id: app.student_id,
        application_id: app.id,
        assigned_to: student?.counselor_id,
        status: 'pending',
        priority: 'high',
        due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      createdTasks.push(task);
    }

    // Inactivity-based tasks
    if (trigger_type === 'inactivity') {
      const lastUpdate = new Date(app.updated_date);
      const daysSinceUpdate = Math.ceil((now - lastUpdate) / (1000 * 60 * 60 * 24));

      if (daysSinceUpdate > 7) {
        const task = await base44.asServiceRole.entities.Task.create({
          title: 'Check-in: Application Inactive',
          description: `No updates for ${daysSinceUpdate} days. Check in with student on application progress.`,
          type: 'follow_up',
          student_id: app.student_id,
          application_id: app.id,
          assigned_to: student?.counselor_id,
          status: 'pending',
          priority: 'medium',
          due_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        createdTasks.push(task);
      }
    }

    return Response.json({
      success: true,
      tasks_created: createdTasks.length,
      tasks: createdTasks,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});