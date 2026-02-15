import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id } = await req.json();

    // Fetch student data
    const student = await base44.entities.StudentProfile.get(student_id);
    
    // Fetch applications
    const applications = await base44.entities.Application.filter({ 
      student_id 
    });

    // Fetch recent communications
    const communications = await base44.entities.CommunicationLog.filter({ 
      student_id 
    }, '-created_date', 10);

    // Determine application stage and engagement level
    const applicationStage = applications[0]?.status || 'new_lead';
    const lastContact = communications[0]?.created_date;
    const daysSinceContact = lastContact 
      ? Math.floor((Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const engagementLevel = daysSinceContact < 7 ? 'high' : 
                           daysSinceContact < 30 ? 'medium' : 'low';

    // Generate personalized follow-up with AI
    const prompt = `Generate a personalized follow-up message for a student with the following profile:

Student Name: ${student.first_name} ${student.last_name}
Application Stage: ${applicationStage}
Preferred Country: ${student.preferred_countries?.join(', ') || 'Not specified'}
Degree Level: ${student.preferred_degree_level || 'Not specified'}
Days Since Last Contact: ${daysSinceContact}
Engagement Level: ${engagementLevel}

Recent Communication Topics: ${communications.slice(0, 3).map(c => c.subject).join(', ') || 'No recent communications'}

Create 3 different follow-up message options:
1. Email message (formal, detailed)
2. SMS message (brief, action-oriented)
3. WhatsApp message (conversational, friendly)

Each message should:
- Reference their specific situation and application stage
- Provide value (new info, deadline reminders, or helpful resources)
- Include a clear call-to-action
- Be personalized and engaging
- Match the tone appropriate for each channel

Return as JSON with this structure:
{
  "email": {"subject": "...", "body": "..."},
  "sms": {"body": "..."},
  "whatsapp": {"body": "..."},
  "reasoning": "Brief explanation of the approach"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
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
          sms: {
            type: "object",
            properties: {
              body: { type: "string" }
            }
          },
          whatsapp: {
            type: "object",
            properties: {
              body: { type: "string" }
            }
          },
          reasoning: { type: "string" }
        }
      }
    });

    return Response.json({
      student_id,
      application_stage: applicationStage,
      engagement_level: engagementLevel,
      days_since_contact: daysSinceContact,
      messages: response,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating follow-up:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});