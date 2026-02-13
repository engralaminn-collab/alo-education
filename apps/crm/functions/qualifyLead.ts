import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { inquiry_id } = await req.json();

    // Fetch inquiry data
    const inquiry = await base44.asServiceRole.entities.Inquiry.get(inquiry_id);

    // Prepare AI prompt for lead qualification
    const qualificationPrompt = `
You are an expert education consultant AI. Analyze this lead and provide a qualification score (0-100) and status.

Lead Data:
- Name: ${inquiry.name}
- Email: ${inquiry.email}
- Phone: ${inquiry.phone || 'Not provided'}
- Country of Interest: ${inquiry.country_of_interest || 'Not specified'}
- Degree Level: ${inquiry.degree_level || 'Not specified'}
- Field of Study: ${inquiry.field_of_study || 'Not specified'}
- Budget: ${inquiry.budget || 'Not specified'}
- Intake Preference: ${inquiry.intake_preference || 'Not specified'}
- Message: ${inquiry.message || 'None'}
- Source: ${inquiry.source}

Qualification Criteria:
- High value countries (UK, USA, Canada, Australia) = higher score
- Clear degree level and field = higher score
- Budget mentioned = higher score
- Specific intake = higher score
- Detailed message = higher score
- Professional email/contact = higher score

Score Categories:
- 80-100: HOT (ready to apply, clear goals, good budget)
- 50-79: WARM (interested, some clarity, needs nurturing)
- 20-49: COLD (vague interest, needs significant qualification)
- 0-19: UNQUALIFIED (incomplete data, spam-like)

Return JSON with score, status, and 3-5 specific reasons for the qualification.
    `;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: qualificationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          score: {
            type: "number",
            description: "Qualification score 0-100"
          },
          status: {
            type: "string",
            enum: ["hot", "warm", "cold", "unqualified"]
          },
          reasons: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Specific reasons for this qualification"
          }
        }
      }
    });

    // Update inquiry with qualification data
    await base44.asServiceRole.entities.Inquiry.update(inquiry_id, {
      qualification_score: aiAnalysis.score,
      qualification_status: aiAnalysis.status,
      qualification_reasons: aiAnalysis.reasons,
      qualified_at: new Date().toISOString()
    });

    // Auto-assign priority based on status
    let priority = 'medium';
    if (aiAnalysis.status === 'hot') priority = 'urgent';
    else if (aiAnalysis.status === 'warm') priority = 'high';
    else if (aiAnalysis.status === 'cold') priority = 'medium';
    else priority = 'low';

    await base44.asServiceRole.entities.Inquiry.update(inquiry_id, {
      priority
    });

    return Response.json({
      success: true,
      qualification: {
        score: aiAnalysis.score,
        status: aiAnalysis.status,
        reasons: aiAnalysis.reasons
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});