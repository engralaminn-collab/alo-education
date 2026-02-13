import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { specialization, target_market } = await req.json();

    const prompt = `
Create a realistic student interaction scenario for partner training:
Specialization: ${specialization}
Target Market: ${target_market}

Generate a challenging but common scenario that tests partner's ability to:
- Understand student needs
- Provide accurate information
- Handle objections
- Build trust
- Close the lead

Provide:
- scenario_title
- student_profile (name, background, goals, concerns)
- conversation_flow (array of 5-6 student messages that escalate in complexity)
- ideal_responses (what partner should say/do at each stage)
- evaluation_criteria (how to score the partner's responses)
- difficulty_level (beginner, intermediate, advanced)

Make it realistic and culturally appropriate. Return JSON.
`;

    const scenario = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          scenario_title: { type: "string" },
          student_profile: {
            type: "object",
            properties: {
              name: { type: "string" },
              background: { type: "string" },
              goals: { type: "string" },
              concerns: { type: "string" }
            }
          },
          conversation_flow: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stage: { type: "string" },
                student_message: { type: "string" },
                ideal_response: { type: "string" }
              }
            }
          },
          evaluation_criteria: {
            type: "array",
            items: { type: "string" }
          },
          difficulty_level: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      scenario
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});