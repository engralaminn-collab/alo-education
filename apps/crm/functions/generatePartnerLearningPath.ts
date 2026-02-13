import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id, user_id, specialization, target_markets } = await req.json();

    const prompt = `
Generate a personalized learning path for a study abroad partner with:
Specialization: ${specialization}
Target Markets: ${target_markets.join(', ')}

Create a comprehensive learning path with 8-10 modules covering:
1. Market-specific knowledge (visa requirements, popular universities, costs)
2. Program expertise (courses, admission requirements)
3. Student interaction scenarios (common questions, objections)
4. Compliance and documentation
5. Advanced sales techniques

For each module, provide:
- module_id (unique identifier)
- module_title (clear, actionable title)
- module_type (course_knowledge, student_interaction, market_insight, or compliance)
- description (2-3 sentences)
- estimated_duration (in minutes)
- key_topics (array of 3-5 topics)

Order modules from beginner to advanced. Return JSON with: modules (array)
`;

    const learningPath = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_id: { type: "string" },
                module_title: { type: "string" },
                module_type: { type: "string" },
                description: { type: "string" },
                estimated_duration: { type: "number" },
                key_topics: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    // Create training record
    const trainingModules = learningPath.modules.map((module, index) => ({
      module_id: module.module_id,
      module_title: module.module_title,
      module_type: module.module_type,
      status: index === 0 ? 'available' : 'locked',
      progress: 0
    }));

    const training = await base44.entities.PartnerTraining.create({
      partner_id,
      user_id,
      specialization,
      target_markets,
      learning_path: trainingModules,
      overall_progress: 0
    });

    return Response.json({
      success: true,
      training_id: training.id,
      learning_path: learningPath.modules
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});