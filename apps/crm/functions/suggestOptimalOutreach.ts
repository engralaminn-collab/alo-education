import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id } = await req.json();

    // Fetch student and communication history
    const student = await base44.entities.StudentProfile.get(student_id);
    const communications = await base44.entities.CommunicationLog.filter({ 
      student_id 
    }, '-created_date', 20);

    // Analyze communication patterns
    const channelEngagement = {
      email: { sent: 0, opened: 0, replied: 0 },
      sms: { sent: 0, delivered: 0, replied: 0 },
      whatsapp: { sent: 0, delivered: 0, replied: 0 },
      call: { attempted: 0, connected: 0, duration: 0 }
    };

    const timeOfDayEngagement = {};
    const dayOfWeekEngagement = {};

    communications.forEach(comm => {
      const channel = comm.channel;
      if (channelEngagement[channel]) {
        channelEngagement[channel].sent++;
        if (comm.responded_at) {
          channelEngagement[channel].replied++;
        }
      }

      // Track time patterns
      const date = new Date(comm.created_date);
      const hour = date.getHours();
      const day = date.getDay();
      
      if (comm.responded_at) {
        timeOfDayEngagement[hour] = (timeOfDayEngagement[hour] || 0) + 1;
        dayOfWeekEngagement[day] = (dayOfWeekEngagement[day] || 0) + 1;
      }
    });

    // AI analysis for optimal channel and timing
    const prompt = `Analyze this student's communication history and recommend optimal outreach strategy:

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Country: ${student.nationality || 'Unknown'}
- Current Status: ${student.status}

Communication Patterns:
${JSON.stringify(channelEngagement, null, 2)}

Time of Day Response Rates: ${JSON.stringify(timeOfDayEngagement)}
Day of Week Response Rates: ${JSON.stringify(dayOfWeekEngagement)}

Based on this data, provide:
1. Recommended primary channel (email, sms, whatsapp, call)
2. Best time to contact (hour in 24h format)
3. Best day of week (0-6, 0=Sunday)
4. Optimal message frequency (days between contacts)
5. Engagement strategy recommendations

Return as JSON.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_channel: { 
            type: "string",
            enum: ["email", "sms", "whatsapp", "call"]
          },
          best_time_hour: { type: "number" },
          best_day_of_week: { type: "number" },
          optimal_frequency_days: { type: "number" },
          reasoning: { type: "string" },
          engagement_tips: {
            type: "array",
            items: { type: "string" }
          },
          alternative_channels: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      student_id,
      channel_performance: channelEngagement,
      ai_recommendations: aiResponse,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error suggesting optimal outreach:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});