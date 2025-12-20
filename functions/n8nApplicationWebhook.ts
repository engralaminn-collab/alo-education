import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Receives application updates from n8n (visa status, offer letters, etc.)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const webhookSecret = Deno.env.get("N8N_WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { application_id, update_type, status, notes } = data;

    // Update application
    const updates = {};
    
    if (update_type === 'offer_received') {
      updates.status = 'conditional_offer';
      updates.offer_date = new Date().toISOString();
      if (!updates.milestones) updates.milestones = {};
      updates.milestones = {
        ...updates.milestones,
        offer_received: {
          completed: true,
          date: new Date().toISOString(),
          notes: notes || 'Offer received via automation'
        }
      };
    }
    
    if (update_type === 'visa_approved') {
      updates.visa_status = 'approved';
      updates.status = 'visa_processing';
      if (!updates.milestones) updates.milestones = {};
      updates.milestones = {
        ...updates.milestones,
        visa_approved: {
          completed: true,
          date: new Date().toISOString(),
          notes: notes || 'Visa approved'
        }
      };
    }

    if (status) {
      updates.status = status;
    }

    if (notes) {
      updates.counselor_notes = notes;
    }

    await base44.asServiceRole.entities.Application.update(application_id, updates);

    // Get application and student details
    const applications = await base44.asServiceRole.entities.Application.filter({ 
      id: application_id 
    });
    const application = applications[0];

    if (application && application.student_id) {
      // Create notification for student
      await base44.asServiceRole.entities.Notification.create({
        user_id: application.student_id,
        type: 'application_stage_change',
        title: `Application Update: ${update_type.replace(/_/g, ' ')}`,
        message: notes || `Your application status has been updated`,
        link_page: 'MyApplications',
        link_id: application_id,
        priority: 'high'
      });
    }

    return Response.json({
      success: true,
      application_id: application_id,
      updated: true
    });

  } catch (error) {
    console.error('Application webhook error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});