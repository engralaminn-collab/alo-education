import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { campaign_id, type, subject, message, recipients } = await req.json();

    if (!type || !message || !recipients || recipients.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let sentCount = 0;
    const errors = [];

    // Send to each recipient
    for (const recipient of recipients) {
      try {
        // Replace placeholders in message
        let personalizedMessage = message
          .replace(/\{\{first_name\}\}/g, recipient.name?.split(' ')[0] || '')
          .replace(/\{\{last_name\}\}/g, recipient.name?.split(' ')[1] || '')
          .replace(/\{\{name\}\}/g, recipient.name || '');

        if (type === 'email') {
          // Send email
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: recipient.email,
            subject: subject || 'Important Update',
            body: personalizedMessage,
          });
          sentCount++;
        } else if (type === 'sms') {
          // For SMS, you would integrate with an SMS service
          // For now, we'll just log it
          console.log(`SMS to ${recipient.phone}: ${personalizedMessage}`);
          sentCount++;
        }
      } catch (error) {
        errors.push({ recipient: recipient.email || recipient.phone, error: error.message });
      }
    }

    // Update campaign status
    if (campaign_id) {
      await base44.asServiceRole.entities.BulkCampaign.update(campaign_id, {
        status: sentCount === recipients.length ? 'completed' : 'completed',
        sent_count: sentCount,
        sent_date: new Date().toISOString(),
      });
    }

    return Response.json({
      success: true,
      sent_count: sentCount,
      total_recipients: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});