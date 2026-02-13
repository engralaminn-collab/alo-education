import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_type, target_markets, specialization } = await req.json();

    const prompt = `
Generate personalized onboarding steps for a partner with these details:
- Partner Type: ${partner_type || 'General Education Consultant'}
- Target Markets: ${target_markets?.join(', ') || 'Various'}
- Specialization: ${specialization || 'General'}

Create 5-7 specific, actionable setup steps tailored to their profile.
Include tips for maximizing referrals based on their specialization.

Return JSON with: steps (array of {title, description, priority, estimated_time})
`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string" },
                estimated_time: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ 
      success: true,
      setup_steps: aiResponse.steps
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});