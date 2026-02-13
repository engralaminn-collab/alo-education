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
    const { inquiry_id, student_id, status, notes, assigned_to } = payload;

    if (inquiry_id) {
      // Update inquiry
      await base44.asServiceRole.entities.Inquiry.update(inquiry_id, {
        status,
        notes,
        assigned_to,
        last_contacted_at: new Date().toISOString()
      });

      return Response.json({
        success: true,
        inquiry_id,
        message: 'Inquiry updated'
      });
    }

    if (student_id) {
      // Update student
      await base44.asServiceRole.entities.StudentProfile.update(student_id, {
        status,
        notes,
        counselor_id: assigned_to
      });

      return Response.json({
        success: true,
        student_id,
        message: 'Student updated'
      });
    }

    return Response.json({ error: 'Missing inquiry_id or student_id' }, { status: 400 });

  } catch (error) {
    console.error('Update lead webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});