import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { student_id } = await req.json();

    // Fetch student data
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    
    // Fetch communication history
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter(
      { student_id },
      '-created_date',
      50
    );

    // Fetch applications
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id });

    // Fetch tasks
    const tasks = await base44.asServiceRole.entities.Task.filter({ student_id });

    // Calculate engagement metrics
    const recentCommunications = communications.slice(0, 10);
    const lastContactDate = communications[0]?.created_date;
    const daysSinceLastContact = lastContactDate ? 
      Math.floor((Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    const inboundCount = communications.filter(c => c.direction === 'inbound').length;
    const outboundCount = communications.filter(c => c.direction === 'outbound').length;
    const responseRate = outboundCount > 0 ? inboundCount / outboundCount : 0;
    
    const engagementLevel = responseRate > 0.7 ? 'high' : responseRate > 0.3 ? 'medium' : 'low';

    // Analyze communication patterns for best contact time
    const hourCounts = {};
    communications.forEach(c => {
      if (c.direction === 'inbound' && c.created_date) {
        const hour = new Date(c.created_date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    const bestHour = Object.keys(hourCounts).sort((a, b) => hourCounts[b] - hourCounts[a])[0];
    const bestContactTime = bestHour ? 
      `${bestHour}:00 - ${parseInt(bestHour) + 1}:00` : 
      '10:00 - 12:00 (default)';

    // Get recent topics and sentiment
    const recentTopics = communications
      .slice(0, 10)
      .flatMap(c => c.key_topics || [])
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);

    const recentSentiments = communications
      .slice(0, 5)
      .map(c => c.sentiment)
      .filter(s => s);

    const prompt = `
You are an expert communication strategist for an education consultancy. Generate highly personalized outreach messages for a student.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Current Status: ${student.status}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Career Goals: ${student.career_goals || 'Not specified'}
- Budget: ${student.budget_max ? `$${student.budget_max}` : 'Not specified'}
- Profile Completeness: ${student.profile_completeness || 0}%

Engagement Metrics:
- Days since last contact: ${daysSinceLastContact}
- Engagement level: ${engagementLevel}
- Response rate: ${(responseRate * 100).toFixed(0)}%
- Total communications: ${communications.length}
- Recent inbound messages: ${inboundCount}

Recent Communication Context:
${recentCommunications.slice(0, 5).map(c => 
  `- [${c.channel}] ${c.subject || 'General'}: ${c.content?.substring(0, 100)}... (${c.sentiment || 'neutral'})`
).join('\n')}

Key Topics Discussed: ${recentTopics.join(', ') || 'None'}
Recent Sentiment Trend: ${recentSentiments.join(', ') || 'neutral'}

Applications:
- Total: ${applications.length}
- Submitted: ${applications.filter(a => a.status === 'submitted_to_university').length}
- Pending: ${applications.filter(a => a.status === 'draft' || a.status === 'documents_pending').length}

Pending Tasks: ${tasks.filter(t => t.status === 'pending').length}

Generate highly personalized outreach messages that:
1. Reference specific details from their profile and recent communications
2. Address their current journey stage and needs
3. Acknowledge any concerns from previous conversations
4. Provide actionable next steps and value
5. Match the appropriate tone based on engagement level and sentiment
6. Include clear calls-to-action

Create messages for:
- Email (subject + body, 200-300 words, warm and professional)
- SMS (concise, friendly, under 160 characters)
- Call script (opening, 3-4 talking points, 3-4 questions)

Consider urgency based on:
- Days since last contact
- Application deadlines
- Pending tasks
- Profile completeness
    `;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          email: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          },
          sms: { type: "string" },
          call_script: {
            type: "object",
            properties: {
              opening: { type: "string" },
              talking_points: {
                type: "array",
                items: { type: "string" }
              },
              questions: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          urgency_level: { 
            type: "string",
            enum: ["high", "medium", "low"]
          },
          best_time_to_contact: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: {
        ...aiResponse,
        best_time_to_contact: bestContactTime
      },
      context: {
        engagement_level: engagementLevel,
        days_since_contact: daysSinceLastContact,
        response_rate: (responseRate * 100).toFixed(0) + '%'
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});