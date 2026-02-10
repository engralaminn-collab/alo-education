import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, counselor_id, module_id, scenario_type } = await req.json();

    if (action === 'generate_training_modules') {
      // Generate personalized training path
      const modulesPrompt = `
Generate a comprehensive onboarding training program for a new education counselor.

Create interactive modules covering:
1. CRM System Overview and Navigation
2. Student Counseling Best Practices
3. Application Process Management
4. Communication Strategies
5. Lead Conversion Techniques
6. Scholarship and Financial Aid Guidance
7. International Education Requirements
8. Performance Metrics and KPIs

Each module should include:
- Learning objectives
- Key concepts
- Interactive exercises
- Assessment criteria
- Estimated completion time
`;

      const modules = await base44.integrations.Core.InvokeLLM({
        prompt: modulesPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            training_modules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  module_id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  learning_objectives: { type: "array", items: { type: "string" } },
                  key_concepts: { type: "array", items: { type: "string" } },
                  duration_minutes: { type: "number" },
                  difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                  prerequisites: { type: "array", items: { type: "string" } },
                  interactive_elements: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      return Response.json({
        success: true,
        training_modules: modules.training_modules
      });
    }

    if (action === 'generate_scenario') {
      // Generate role-playing scenario
      const scenarioPrompt = `
Generate a realistic role-playing scenario for counselor training.

Scenario Type: ${scenario_type || 'difficult_conversation'}

Create a detailed scenario with:
1. Student background and situation
2. Specific challenges or concerns
3. Expected counselor responses
4. Key talking points
5. Common mistakes to avoid
6. Success criteria
7. Follow-up actions

Make it realistic and educational.
`;

      const scenario = await base44.integrations.Core.InvokeLLM({
        prompt: scenarioPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            scenario_title: { type: "string" },
            scenario_type: { type: "string" },
            difficulty_level: { type: "string", enum: ["easy", "moderate", "challenging", "expert"] },
            student_profile: {
              type: "object",
              properties: {
                name: { type: "string" },
                background: { type: "string" },
                concerns: { type: "array", items: { type: "string" } },
                personality_traits: { type: "array", items: { type: "string" } }
              }
            },
            situation_description: { type: "string" },
            key_challenges: { type: "array", items: { type: "string" } },
            recommended_approaches: { type: "array", items: { type: "string" } },
            talking_points: { type: "array", items: { type: "string" } },
            common_mistakes: { type: "array", items: { type: "string" } },
            success_criteria: { type: "array", items: { type: "string" } },
            feedback_guidelines: { type: "string" }
          }
        }
      });

      return Response.json({
        success: true,
        scenario
      });
    }

    if (action === 'evaluate_progress') {
      // Evaluate counselor progress
      const counselor = await base44.asServiceRole.entities.User.get(counselor_id);
      
      // Fetch performance data
      const students = await base44.asServiceRole.entities.StudentProfile.filter({ counselor_id });
      const communications = await base44.asServiceRole.entities.CommunicationLog.filter({ 
        counselor_id 
      }, '-created_date', 100);

      const evaluationPrompt = `
Evaluate this new counselor's onboarding progress and provide personalized feedback.

Counselor: ${counselor.full_name}
Time Since Start: [Calculate based on created_date]
Students Assigned: ${students.length}
Communications Made: ${communications.length}

Performance Metrics:
- Response times
- Student engagement
- Task completion
- Communication quality

Provide:
1. Progress assessment (0-100%)
2. Strengths identified
3. Areas for improvement
4. Personalized recommendations
5. Next learning goals
6. Coaching feedback
`;

      const evaluation = await base44.integrations.Core.InvokeLLM({
        prompt: evaluationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_progress: { type: "number" },
            readiness_level: { type: "string", enum: ["learning", "developing", "proficient", "expert"] },
            strengths: { type: "array", items: { type: "string" } },
            improvement_areas: { type: "array", items: { type: "string" } },
            personalized_recommendations: { type: "array", items: { type: "string" } },
            next_goals: { type: "array", items: { type: "string" } },
            coaching_feedback: { type: "string" },
            estimated_readiness_date: { type: "string" }
          }
        }
      });

      return Response.json({
        success: true,
        evaluation
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});