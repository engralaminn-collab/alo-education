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

    // Create student profile
    const student = await base44.asServiceRole.entities.StudentProfile.create({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      date_of_birth: payload.date_of_birth,
      nationality: payload.nationality,
      current_address: payload.address,
      preferred_countries: payload.preferred_countries || [],
      preferred_fields: payload.preferred_fields || [],
      source: payload.source || 'n8n Automation',
      status: 'new_lead',
      budget_max: payload.budget_max,
      target_intake: payload.target_intake
    });

    // Calculate lead score
    await base44.asServiceRole.functions.invoke('calculateLeadScore', {
      student_id: student.id
    });

    return Response.json({
      success: true,
      student_id: student.id,
      message: 'Student profile created'
    });

  } catch (error) {
    console.error('Create student webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});