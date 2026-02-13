import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, query_type, context } = await req.json();

    // Fetch student data
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id });
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter(
      { student_id },
      '-created_date',
      10
    );

    // Common query types
    const queryTemplates = {
      application_status: 'Student inquiring about application status',
      deadline_reminder: 'Reminder about upcoming application deadline',
      document_request: 'Following up on missing documents',
      visa_guidance: 'Providing visa application guidance',
      scholarship_info: 'Answering scholarship questions',
      course_details: 'Providing course information',
      general_followup: 'General check-in follow-up'
    };

    const queryContext = queryTemplates[query_type] || context;

    // AI outreach generation
    const outreachPrompt = `
Generate a personalized outreach message for this student query.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Career Goals: ${student.career_goals || 'Not specified'}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}

Applications:
${applications.map(a => `- ${a.course_id}: ${a.status}`).join('\n') || 'None yet'}

Recent Communication Topics:
${communications.slice(0, 3).map(c => c.key_topics?.join(', ')).filter(Boolean).join(' | ') || 'None'}

Query Type: ${queryContext}

Generate:
1. Email subject line
2. Email body (warm, professional, personalized)
3. SMS message (brief, actionable)
4. WhatsApp message (friendly, conversational)

Make it personal, actionable, and aligned with their journey stage.
`;

    const outreach = await base44.integrations.Core.InvokeLLM({
      prompt: outreachPrompt,
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
          whatsapp: { type: "string" },
          talking_points: { type: "array", items: { type: "string" } },
          next_steps: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      outreach,
      query_type
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});