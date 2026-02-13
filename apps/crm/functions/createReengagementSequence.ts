import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, inactive_days } = await req.json();

    // Fetch student data
    const student = await base44.entities.StudentProfile.get(student_id);
    const applications = await base44.entities.Application.filter({ student_id });
    const communications = await base44.entities.CommunicationLog.filter({ 
      student_id 
    }, '-created_date', 5);

    // Generate re-engagement sequence
    const prompt = `Create an automated re-engagement sequence for an inactive student lead:

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Days Inactive: ${inactive_days}
- Last Communication Topic: ${communications[0]?.subject || 'Initial inquiry'}

Application Progress:
- Applications Started: ${applications.length}
- Current Stage: ${applications[0]?.status || 'No application yet'}

Create a 5-step automated re-engagement sequence with escalating urgency:

Step 1 (Day 1): Gentle reminder - value-based
Step 2 (Day 3): Resource sharing - educational content
Step 3 (Day 7): Urgency element - deadline/opportunity
Step 4 (Day 10): Alternative offer - different approach
Step 5 (Day 14): Final touchpoint - last chance

For each step, provide:
- Channel recommendation (email/sms/whatsapp)
- Message content
- Call-to-action
- Success metric to track

Return as JSON array.`;

    const sequence = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "number" },
                day: { type: "number" },
                channel: { type: "string" },
                subject: { type: "string" },
                message: { type: "string" },
                call_to_action: { type: "string" },
                success_metric: { type: "string" }
              }
            }
          },
          strategy_notes: { type: "string" },
          expected_outcomes: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Store the sequence
    await base44.entities.LeadNurtureCampaign.create({
      inquiry_id: student_id,
      campaign_type: 're_engagement_sequence',
      status: 'active',
      sequence_step: 1,
      messages_sent: 0,
      next_action_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    return Response.json({
      student_id,
      sequence_created: true,
      sequence_details: sequence,
      start_date: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating re-engagement sequence:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});