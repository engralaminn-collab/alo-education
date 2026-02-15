import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { student_id } = await req.json();

    // Fetch all communications for student
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter({ 
      student_id 
    }, '-created_date');

    const messages = await base44.asServiceRole.entities.Message.filter({ 
      recipient_id: student_id 
    }, '-created_date');

    // Combine all communication data
    const allComms = [
      ...communications.map(c => ({
        channel: c.channel,
        date: c.created_date,
        content: c.content,
        direction: c.direction
      })),
      ...messages.map(m => ({
        channel: 'message',
        date: m.created_date,
        content: m.content,
        direction: m.sender_type === 'student' ? 'inbound' : 'outbound'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // AI communication analysis
    const analysisPrompt = `
You are an expert communication analyst AI. Analyze this student's communication history.

Student ID: ${student_id}
Total Communications: ${allComms.length}

Recent Communications: ${JSON.stringify(allComms.slice(0, 30))}

Communication Channels Used: ${[...new Set(allComms.map(c => c.channel))].join(', ')}

Analyze and provide:
1. Summary of interaction history
2. Communication patterns (frequency, preferred channels, response times)
3. Sentiment trends (positive, neutral, negative)
4. Key topics discussed
5. Optimal channel for next outreach
6. Best time to contact (based on previous response patterns)
7. Engagement level (high, medium, low)
8. Any concerns or red flags
9. Suggested next communication strategy
    `;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          patterns: {
            type: "object",
            properties: {
              avg_response_time_hours: { type: "number" },
              most_active_channel: { type: "string" },
              communication_frequency: { type: "string" },
              preferred_time: { type: "string" }
            }
          },
          sentiment_trend: {
            type: "string",
            enum: ["improving", "stable", "declining"]
          },
          key_topics: {
            type: "array",
            items: { type: "string" }
          },
          recommended_channel: { type: "string" },
          recommended_timing: { type: "string" },
          engagement_level: {
            type: "string",
            enum: ["high", "medium", "low"]
          },
          concerns: {
            type: "array",
            items: { type: "string" }
          },
          next_strategy: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      student_id,
      total_communications: allComms.length,
      analysis: aiAnalysis,
      recent_communications: allComms.slice(0, 10)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});