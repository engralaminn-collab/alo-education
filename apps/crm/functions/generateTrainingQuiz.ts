import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { module_id, module_title, module_type, key_topics, target_markets } = await req.json();

    const prompt = `
Generate a comprehensive quiz for a partner training module:
Module: ${module_title}
Type: ${module_type}
Key Topics: ${key_topics.join(', ')}
Target Markets: ${target_markets.join(', ')}

Create 10 multiple-choice questions that test:
- Factual knowledge (50%)
- Applied understanding (30%)
- Scenario-based problem solving (20%)

For each question provide:
- question (clear, specific question)
- options (array of 4 options labeled A, B, C, D)
- correct_answer (letter A-D)
- explanation (why this is correct)

Make questions realistic and practical. Return JSON with: questions (array)
`;

    const quiz = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: {
                  type: "array",
                  items: { type: "string" }
                },
                correct_answer: { type: "string" },
                explanation: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      quiz: quiz.questions
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});