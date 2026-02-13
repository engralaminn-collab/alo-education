import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Webhook validation - check secret
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const authHeader = req.headers.get('x-webhook-secret');
    
    if (webhookSecret && authHeader !== webhookSecret) {
      return Response.json({ error: 'Invalid webhook secret' }, { status: 403 });
    }

    const payload = await req.json();

    // Create inquiry from WhatsApp lead
    const inquiry = await base44.asServiceRole.entities.Inquiry.create({
      name: payload.name || 'WhatsApp Lead',
      email: payload.email,
      phone: payload.phone,
      whatsapp_number: payload.whatsapp_number || payload.phone,
      message: payload.message || 'WhatsApp inquiry',
      source: 'WhatsApp',
      status: 'new',
      priority: payload.priority || 'medium',
      country_of_interest: payload.country_of_interest,
      degree_level: payload.degree_level,
      field_of_study: payload.field_of_study
    });

    // Auto-qualify the lead
    await base44.asServiceRole.functions.invoke('qualifyLead', {
      inquiry_id: inquiry.id
    });

    return Response.json({
      success: true,
      inquiry_id: inquiry.id,
      message: 'Lead created and qualified'
    });

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});