import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_text, student_id, counselor_id, context } = await req.json();

    // Fetch student context if available
    let student = null;
    let recentComms = [];
    
    if (student_id) {
      student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
      recentComms = await base44.asServiceRole.entities.CommunicationLog.filter(
        { student_id },
        '-created_date',
        10
      );
    }

    // AI sentiment analysis
    const sentimentPrompt = `
You are an expert in analyzing educational counseling communications. Analyze the sentiment and provide insights.

Message to analyze:
"${message_text}"

${student ? `Student Context:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Recent communication sentiment: ${recentComms.slice(0, 3).map(c => c.sentiment).filter(Boolean).join(', ') || 'None'}
` : ''}

${context ? `Additional Context: ${context}` : ''}

Provide:
1. Overall sentiment (positive, neutral, negative)
2. Sentiment score (0-100)
3. Emotional tone indicators
4. Key topics and entities mentioned
5. Urgency level
6. Action items or concerns raised
7. Message improvement suggestions
8. Recommended response tone
`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: sentimentPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
          sentiment_score: { type: "number" },
          emotional_indicators: {
            type: "object",
            properties: {
              excitement: { type: "number" },
              frustration: { type: "number" },
              confusion: { type: "number" },
              satisfaction: { type: "number" }
            }
          },
          key_topics: { type: "array", items: { type: "string" } },
          entities_mentioned: {
            type: "array",
            items: {
              type: "object",
              properties: {
                entity_type: { type: "string", enum: ["university", "course", "country", "deadline", "document", "scholarship"] },
                entity_name: { type: "string" }
              }
            }
          },
          urgency_level: { type: "string", enum: ["low", "medium", "high", "urgent"] },
          concerns_raised: { type: "array", items: { type: "string" } },
          action_items: { type: "array", items: { type: "string" } },
          improvement_suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                suggestion: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          recommended_response_tone: { type: "string" }
        }
      }
    });

    // Auto-enrich student profile if student_id provided
    if (student_id && analysis.key_topics?.length > 0) {
      // Update student interests/preferences based on topics
      const currentInterests = student.preferred_fields || [];
      const newTopics = analysis.key_topics.filter(t => !currentInterests.includes(t));
      
      if (newTopics.length > 0) {
        await base44.asServiceRole.entities.StudentProfile.update(student_id, {
          preferred_fields: [...currentInterests, ...newTopics.slice(0, 3)]
        });
      }
    }

    return Response.json({
      success: true,
      analysis,
      profile_enriched: student_id && analysis.key_topics?.length > 0
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});