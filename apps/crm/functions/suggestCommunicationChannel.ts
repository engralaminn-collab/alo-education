import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, message_urgency, message_type, context } = await req.json();

    // Fetch student data
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter(
      { student_id },
      '-created_date',
      50
    );

    // Analyze communication preferences from history
    const channelUsage = communications.reduce((acc, comm) => {
      acc[comm.channel] = (acc[comm.channel] || 0) + 1;
      return acc;
    }, {});

    const channelResponseRates = {};
    communications.forEach(comm => {
      if (comm.direction === 'outbound' && comm.responded_at) {
        const responseTime = (new Date(comm.responded_at).getTime() - new Date(comm.created_date).getTime()) / (1000 * 60 * 60);
        if (!channelResponseRates[comm.channel]) {
          channelResponseRates[comm.channel] = { total: 0, responded: 0, avgTime: 0, times: [] };
        }
        channelResponseRates[comm.channel].total++;
        channelResponseRates[comm.channel].responded++;
        channelResponseRates[comm.channel].times.push(responseTime);
      } else if (comm.direction === 'outbound') {
        if (!channelResponseRates[comm.channel]) {
          channelResponseRates[comm.channel] = { total: 0, responded: 0, avgTime: 0, times: [] };
        }
        channelResponseRates[comm.channel].total++;
      }
    });

    Object.keys(channelResponseRates).forEach(channel => {
      const data = channelResponseRates[channel];
      data.responseRate = data.total > 0 ? (data.responded / data.total * 100) : 0;
      data.avgTime = data.times.length > 0 
        ? data.times.reduce((sum, t) => sum + t, 0) / data.times.length 
        : 0;
    });

    // AI channel suggestion
    const suggestionPrompt = `
You are an expert in communication optimization. Suggest the best communication channel for this outreach.

Student Information:
- Name: ${student.first_name} ${student.last_name}
- Email: ${student.email}
- Phone: ${student.phone || 'Not provided'}
- WhatsApp: ${student.whatsapp_number || 'Not provided'}

Communication History Analysis:
${Object.entries(channelUsage).map(([channel, count]) => 
  `- ${channel}: ${count} messages sent`
).join('\n')}

Channel Response Rates:
${Object.entries(channelResponseRates).map(([channel, data]) => 
  `- ${channel}: ${data.responseRate.toFixed(1)}% response rate, avg ${data.avgTime.toFixed(1)}h response time`
).join('\n') || 'No response data available'}

Message Context:
- Urgency: ${message_urgency}
- Type: ${message_type}
- Context: ${context || 'General outreach'}

Recent Communication Sentiment:
${communications.slice(0, 5).map(c => `${c.channel}: ${c.sentiment || 'unknown'}`).join(', ')}

Recommend:
1. Primary channel to use
2. Backup channel
3. Best time to contact
4. Reasoning for recommendation
5. Expected response probability
`;

    const suggestion = await base44.integrations.Core.InvokeLLM({
      prompt: suggestionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_channel: { type: "string", enum: ["email", "sms", "call", "whatsapp", "meeting"] },
          backup_channel: { type: "string", enum: ["email", "sms", "call", "whatsapp", "meeting"] },
          best_time: { type: "string" },
          reasoning: { type: "string" },
          expected_response_probability: { type: "number" },
          message_tone_suggestion: { type: "string" },
          followup_strategy: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      suggestion,
      channel_analytics: {
        usage: channelUsage,
        response_rates: channelResponseRates
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});