import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id } = await req.json();

    // Fetch event and registrations
    const event = await base44.entities.Event.get(event_id);
    const registrations = await base44.entities.EventRegistration.filter({ 
      event_id,
      attended: true 
    });

    // Generate follow-up sequence
    const prompt = `Create a 3-step post-event nurture sequence for attendees of:

Event: ${event.event_name} (${event.event_type})

Generate a nurture sequence:
Step 1 (Day 1): Thank you + resources
Step 2 (Day 3): Value content + next steps
Step 3 (Day 7): Application opportunity

For each step provide:
- Email subject
- Email body
- SMS alternative
- Call-to-action

Return as JSON array.`;

    const sequence = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                email_subject: { type: "string" },
                email_body: { type: "string" },
                sms_body: { type: "string" },
                call_to_action: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Mark follow-up as sent
    await base44.entities.Event.update(event_id, {
      follow_up_sent: true
    });

    return Response.json({
      event_id,
      attendees_count: registrations.length,
      follow_up_sequence: sequence,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending follow-up:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});