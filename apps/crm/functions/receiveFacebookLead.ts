import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const authHeader = req.headers.get('x-webhook-secret');
    
    if (webhookSecret && authHeader !== webhookSecret) {
      return Response.json({ error: 'Invalid webhook secret' }, { status: 403 });
    }

    const payload = await req.json();

    // Create inquiry from Facebook lead
    const inquiry = await base44.asServiceRole.entities.Inquiry.create({
      name: payload.full_name || payload.name || 'Facebook Lead',
      email: payload.email,
      phone: payload.phone,
      message: payload.message || payload.question || 'Facebook inquiry',
      source: 'Social Media',
      status: 'new',
      priority: 'medium',
      country_of_interest: payload.country,
      degree_level: payload.degree_level,
      field_of_study: payload.field_of_interest
    });

    // Auto-qualify and assign
    await base44.asServiceRole.functions.invoke('qualifyLead', {
      inquiry_id: inquiry.id
    });

    return Response.json({
      success: true,
      inquiry_id: inquiry.id,
      message: 'Facebook lead captured'
    });

  } catch (error) {
    console.error('Facebook webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});