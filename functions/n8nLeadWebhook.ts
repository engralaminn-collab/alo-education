import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Receives leads from n8n automation workflows
 * Endpoint: /functions/n8nLeadWebhook
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify webhook secret for security
    const webhookSecret = Deno.env.get("N8N_WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Create inquiry in CRM
    const inquiry = await base44.asServiceRole.entities.Inquiry.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      country_of_interest: data.country_of_interest,
      degree_level: data.degree_level,
      field_of_study: data.field_of_study,
      message: data.message,
      source: data.source || 'website',
      status: 'new',
      notes: `Lead captured via ${data.source || 'n8n automation'}`
    });

    // Auto-assign to counselor based on country or workload
    const counselors = await base44.asServiceRole.entities.Counselor.filter({ 
      status: 'active',
      is_available: true 
    });
    
    if (counselors.length > 0) {
      // Find counselor with lowest current students
      const bestCounselor = counselors.reduce((prev, curr) => 
        (curr.current_students || 0) < (prev.current_students || 0) ? curr : prev
      );
      
      await base44.asServiceRole.entities.Inquiry.update(inquiry.id, {
        assigned_to: bestCounselor.user_id
      });

      // Create notification for counselor
      await base44.asServiceRole.entities.Notification.create({
        user_id: bestCounselor.user_id,
        type: 'new_inquiry',
        title: 'New Lead Assigned',
        message: `New lead: ${data.name} - ${data.country_of_interest}`,
        link_page: 'CRMInquiries',
        link_id: inquiry.id,
        priority: 'medium'
      });
    }

    // Calculate lead score
    let leadScore = 0;
    if (data.country_of_interest === 'United Kingdom') leadScore += 30;
    if (data.country_of_interest === 'United States') leadScore += 25;
    if (data.degree_level === 'master') leadScore += 20;
    if (data.degree_level === 'bachelor') leadScore += 15;
    if (data.phone) leadScore += 10;
    if (data.message) leadScore += 10;

    // Return data for n8n to continue workflow
    return Response.json({
      success: true,
      inquiry_id: inquiry.id,
      lead_score: leadScore,
      assigned_counselor: inquiry.assigned_to,
      priority: leadScore > 50 ? 'high' : leadScore > 30 ? 'medium' : 'low'
    });

  } catch (error) {
    console.error('n8n webhook error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});