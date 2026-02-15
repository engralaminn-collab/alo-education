import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, target_students } = await req.json();

    // Fetch event details
    const event = await base44.entities.Event.get(event_id);

    // Generate personalized invitations using AI
    const prompt = `Generate a compelling event invitation for:

Event: ${event.event_name}
Type: ${event.event_type}
Date: ${new Date(event.event_date).toLocaleString()}
Description: ${event.description || 'Education event'}
Is Online: ${event.is_online ? 'Yes' : 'No'}

Create 3 versions:
1. Email invitation (formal, detailed with CTA)
2. SMS invitation (brief, action-oriented)
3. WhatsApp invitation (conversational, friendly)

Each should include:
- Event highlights
- Clear date/time
- Registration call-to-action
- Benefits of attending

Return as JSON with email (subject + body), sms (body), whatsapp (body).`;

    const invitations = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          email: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          },
          sms: {
            type: "object",
            properties: {
              body: { type: "string" }
            }
          },
          whatsapp: {
            type: "object",
            properties: {
              body: { type: "string" }
            }
          }
        }
      }
    });

    // Update event status
    await base44.entities.Event.update(event_id, {
      invitation_sent: true,
      invitation_sent_at: new Date().toISOString()
    });

    return Response.json({
      event_id,
      invitations,
      target_count: target_students?.length || 0,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating invitation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});