import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { outreachId, responseContent } = await req.json();

        if (!outreachId || !responseContent) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get the original outreach
        const outreach = await base44.entities.UniversityOutreach.get(outreachId);
        const student = await base44.entities.StudentProfile.get(outreach.student_id);
        const university = await base44.entities.University.get(outreach.university_id);

        // Analyze response with AI
        const prompt = `You are an expert education counselor analyzing a university response to an outreach email.

ORIGINAL OUTREACH:
- Type: ${outreach.outreach_type}
- Subject: ${outreach.email_subject}
- Body: ${outreach.email_body}

UNIVERSITY RESPONSE:
${responseContent}

STUDENT CONTEXT:
- Name: ${student.first_name} ${student.last_name}
- Target: ${student.preferred_degree_level} in ${student.preferred_fields?.join(', ')}

ANALYZE THE RESPONSE:
1. Sentiment: Is the response positive, negative, neutral, or purely informational?
2. Summary: Provide a concise 1-2 sentence summary
3. Action Required: Does this require follow-up action from the counselor?
4. Action Items: List specific actions needed (if any)
5. Urgency: Is immediate action needed?
6. Next Steps: What should the counselor do next?`;

        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    sentiment: {
                        type: 'string',
                        enum: ['positive', 'negative', 'neutral', 'informational']
                    },
                    summary: { type: 'string' },
                    action_required: { type: 'boolean' },
                    action_items: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                    is_urgent: { type: 'boolean' },
                    urgency_reason: { type: 'string' },
                    next_steps: { type: 'string' }
                }
            }
        });

        // Determine new status based on analysis
        let newStatus = 'responded';
        if (analysis.action_required) {
            newStatus = 'follow_up_needed';
        }

        // Update the outreach record
        await base44.entities.UniversityOutreach.update(outreachId, {
            response_received: true,
            response_date: new Date().toISOString(),
            response_content: responseContent,
            response_sentiment: analysis.sentiment,
            response_summary: analysis.summary,
            action_required: analysis.action_required,
            action_items: analysis.action_items,
            is_urgent: analysis.is_urgent,
            urgency_reason: analysis.urgency_reason,
            status: newStatus
        });

        // Create notification for counselor
        await base44.entities.Notification.create({
            counselor_id: student.counselor_id,
            type: 'message',
            title: `University Response: ${university.university_name}`,
            message: `${analysis.sentiment.toUpperCase()} response received for ${student.first_name} ${student.last_name}. ${analysis.summary}`,
            priority: analysis.is_urgent ? 'urgent' : analysis.action_required ? 'high' : 'medium'
        });

        return Response.json({
            success: true,
            analysis,
            new_status: newStatus
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});