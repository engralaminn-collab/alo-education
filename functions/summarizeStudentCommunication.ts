import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { student_id, interactions } = await req.json();

    const student = await base44.entities.StudentProfile.get(student_id);
    
    const interactionsSummary = interactions.map(i => 
      `${i.interaction_type} - ${i.subject}: ${i.notes || 'No notes'}`
    ).join('\n');

    const prompt = `
Summarize this student's communication history and suggest follow-up actions:

Student: ${student.first_name} ${student.last_name}
Status: ${student.status}

Recent Interactions:
${interactionsSummary}

Provide:
1. Brief summary of communication history
2. Key topics/concerns discussed
3. 3 specific follow-up actions recommended
4. Priority level (high/medium/low) for each action

Format as JSON with: summary, topics, follow_up_actions (array of {action, priority, reason})
`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          topics: { type: "array", items: { type: "string" } },
          follow_up_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ 
      success: true,
      ...aiResponse
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});