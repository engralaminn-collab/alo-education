import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Sends data from Base44 to n8n workflows
 * Use this to trigger n8n automations from the app
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow, data } = await req.json();
    
    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!n8nWebhookUrl) {
      return Response.json({ 
        error: 'N8N_WEBHOOK_URL not configured' 
      }, { status: 500 });
    }

    // Map workflow types to n8n webhook URLs
    const workflowUrls = {
      'send_whatsapp': `${n8nWebhookUrl}/whatsapp`,
      'send_email': `${n8nWebhookUrl}/email`,
      'lead_scoring': `${n8nWebhookUrl}/lead-scoring`,
      'document_reminder': `${n8nWebhookUrl}/document-reminder`,
      'visa_update': `${n8nWebhookUrl}/visa-update`,
      'daily_report': `${n8nWebhookUrl}/daily-report`,
      'application_status': `${n8nWebhookUrl}/application-status`,
      'partner_commission': `${n8nWebhookUrl}/partner-commission`
    };

    const webhookUrl = workflowUrls[workflow] || n8nWebhookUrl;

    // Send to n8n
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-source': 'base44-app'
      },
      body: JSON.stringify({
        ...data,
        triggered_by: user.email,
        triggered_at: new Date().toISOString(),
        workflow: workflow
      })
    });

    const result = await response.json();

    return Response.json({
      success: response.ok,
      workflow: workflow,
      result: result
    });

  } catch (error) {
    console.error('Send to n8n error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});