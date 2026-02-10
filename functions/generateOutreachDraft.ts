import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, query_type, channel, context } = await req.json();

    // Fetch student data
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id });
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter({ 
      student_id 
    }, '-created_date', 10);

    // Common query templates database
    const commonQueries = {
      'document_request': 'Request missing documents',
      'application_update': 'Update on application status',
      'deadline_reminder': 'Reminder about upcoming deadline',
      'offer_congratulations': 'Congratulations on offer received',
      'visa_guidance': 'Visa application guidance',
      'enrollment_steps': 'Next steps for enrollment',
      'scholarship_info': 'Scholarship opportunities',
      'course_selection': 'Help with course selection',
      'general_follow_up': 'General follow-up check-in'
    };

    // AI draft generation
    const draftPrompt = `
You are an expert education counselor. Generate a professional, personalized outreach message.

Student Information:
- Name: ${student.first_name} ${student.last_name}
- Email: ${student.email}
- Status: ${student.status}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}

Applications:
${applications.map(app => `- Status: ${app.status}, University: ${app.university_id}`).join('\n') || 'No applications yet'}

Recent Communication Context:
${communications.slice(0, 3).map(c => `- ${c.channel}: ${c.subject || 'No subject'}`).join('\n') || 'No recent communications'}

Query Type: ${query_type}
Channel: ${channel}
Additional Context: ${context || 'None'}

Generate a ${channel} message that is:
- Professional yet warm and friendly
- Personalized to the student's situation
- Action-oriented with clear next steps
- Appropriate length for ${channel}
- Addresses common concerns proactively

Provide:
1. Subject line (for email)
2. Full message body
3. Call-to-action
4. Suggested follow-up timeline
`;

    const aiDraft = await base44.integrations.Core.InvokeLLM({
      prompt: draftPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" },
          call_to_action: { type: "string" },
          follow_up_days: { type: "number" },
          tone: { type: "string" },
          key_points: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Save as canned response template if applicable
    if (query_type && commonQueries[query_type]) {
      await base44.asServiceRole.entities.CannedResponse?.create({
        title: commonQueries[query_type],
        content: aiDraft.body,
        category: query_type,
        channel: channel,
        created_by: user.id,
        is_ai_generated: true,
        usage_count: 0
      });
    }

    return Response.json({
      success: true,
      draft: aiDraft,
      student_name: `${student.first_name} ${student.last_name}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});