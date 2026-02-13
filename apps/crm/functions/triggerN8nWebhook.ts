import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhook_url, event_type, data } = await req.json();

    // Prepare webhook payload
    const payload = {
      event: event_type,
      timestamp: new Date().toISOString(),
      source: 'ALO Education CRM',
      data
    };

    // Send to n8n webhook
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'alo-education'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    return Response.json({
      success: true,
      message: 'Webhook triggered',
      event_type
    });

  } catch (error) {
    console.error('n8n webhook trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});