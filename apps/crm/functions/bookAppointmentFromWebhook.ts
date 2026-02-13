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

    // Create appointment
    const appointment = await base44.asServiceRole.entities.Appointment.create({
      student_id: payload.student_id,
      counselor_id: payload.counselor_id,
      appointment_type: payload.appointment_type || 'consultation',
      scheduled_date: payload.scheduled_date,
      duration_minutes: payload.duration_minutes || 30,
      meeting_link: payload.meeting_link,
      notes: payload.notes,
      status: 'scheduled',
      reminder_sent: false
    });

    // Send confirmation email
    const student = await base44.asServiceRole.entities.StudentProfile.get(payload.student_id);
    
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: student.email,
      subject: 'Appointment Confirmed - ALO Education',
      body: `Dear ${student.first_name},

Your counseling appointment has been scheduled for ${new Date(payload.scheduled_date).toLocaleString()}.

${payload.meeting_link ? `Meeting Link: ${payload.meeting_link}` : ''}

See you soon!

ALO Education Team`
    });

    return Response.json({
      success: true,
      appointment_id: appointment.id,
      message: 'Appointment booked and confirmed'
    });

  } catch (error) {
    console.error('Book appointment webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});