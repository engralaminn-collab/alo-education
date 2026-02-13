import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, previous_responses } = await req.json();

    // Fetch student basic info
    const student = await base44.entities.StudentProfile.get(student_id);

    // Generate next adaptive question
    const prompt = `Generate the next personalized onboarding question for a student:

Student: ${student.first_name} ${student.last_name}
Previous Responses: ${JSON.stringify(previous_responses || {})}

Based on their previous answers, generate the next most relevant question to understand:
- Academic interests
- Career goals
- Study preferences
- Financial considerations
- Timeline

Provide:
1. Question text
2. Question type (text, multiple_choice, rating, etc.)
3. Options (if applicable)
4. Why this question is relevant
5. Next question suggestions based on possible answers

Return as JSON.`;

    const nextQuestion = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          question: { type: "string" },
          question_type: { 
            type: "string",
            enum: ["text", "multiple_choice", "rating", "yes_no", "number"]
          },
          options: {
            type: "array",
            items: { type: "string" }
          },
          relevance_reason: { type: "string" },
          follow_up_logic: {
            type: "object"
          }
        }
      }
    });

    return Response.json({
      student_id,
      next_question: nextQuestion,
      step: Object.keys(previous_responses || {}).length + 1
    });

  } catch (error) {
    console.error('Error generating questionnaire:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});