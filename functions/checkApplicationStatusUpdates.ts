import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// This function can be called via scheduled automation to periodically check for updates
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Admin only for scheduled checks
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all active applications (not enrolled, rejected, or withdrawn)
    const applications = await base44.asServiceRole.entities.Application.filter({
      status: { 
        $nin: ['enrolled', 'rejected', 'withdrawn', 'draft'] 
      }
    });

    const updates = [];
    const errors = [];

    // Process each application
    for (const app of applications) {
      try {
        // Get student info
        const student = await base44.asServiceRole.entities.StudentProfile.filter({ 
          id: app.student_id 
        }).then(s => s[0]);

        if (!student) continue;

        // Check if status has been stuck for too long (e.g., 30+ days in under_review)
        const daysSinceUpdate = app.updated_date 
          ? (Date.now() - new Date(app.updated_date).getTime()) / (1000 * 60 * 60 * 24)
          : 0;

        if (daysSinceUpdate > 30 && app.status === 'under_review') {
          // Create a reminder notification for counselor to follow up
          await base44.asServiceRole.entities.Notification.create({
            counselor_id: student.counselor_id,
            type: 'application',
            title: `Follow-up needed: ${student.first_name} ${student.last_name}`,
            message: `Application has been "under review" for ${Math.floor(daysSinceUpdate)} days. Consider following up with the university.`,
            priority: 'high',
            link: `/CRMStudentProfile?id=${student.id}`
          });

          updates.push({
            application_id: app.id,
            action: 'follow_up_reminder',
            days_stuck: Math.floor(daysSinceUpdate)
          });
        }

        // Check for approaching deadlines
        if (app.offer_deadline) {
          const daysUntilDeadline = (new Date(app.offer_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          
          if (daysUntilDeadline > 0 && daysUntilDeadline <= 7 && ['conditional_offer', 'unconditional_offer'].includes(app.status)) {
            // Send urgent deadline reminder
            await base44.asServiceRole.entities.Notification.create({
              student_id: student.id,
              type: 'deadline',
              title: `⚠️ Urgent: Offer Deadline Approaching`,
              message: `Your offer deadline is in ${Math.ceil(daysUntilDeadline)} days. Take action now!`,
              priority: 'urgent',
              link: `/StudentPortal?tab=applications`
            });

            updates.push({
              application_id: app.id,
              action: 'deadline_reminder',
              days_remaining: Math.ceil(daysUntilDeadline)
            });
          }
        }

      } catch (err) {
        errors.push({
          application_id: app.id,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      applications_checked: applications.length,
      updates_created: updates.length,
      errors: errors.length,
      updates,
      errors
    });

  } catch (error) {
    console.error('Error checking application updates:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});