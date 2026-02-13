import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id } = await req.json();

    // Fetch all relevant data
    const student = await base44.entities.StudentProfile.get(student_id);
    const applications = await base44.entities.Application.filter({ student_id });
    const communications = await base44.entities.CommunicationLog.filter({ student_id });
    const events = await base44.entities.EventRegistration.filter({ student_id });
    const onboarding = await base44.entities.OnboardingSession.filter({ student_id });

    // Calculate factors
    const profileCompleteness = student.profile_completeness || 0;
    
    const engagementLevel = communications.length > 0 
      ? Math.min(100, (communications.length * 10)) 
      : 0;
    
    const eventParticipation = events.filter(e => e.attended).length * 20;
    
    const responsiveness = communications.filter(c => c.responded_at).length > 0
      ? (communications.filter(c => c.responded_at).length / communications.length) * 100
      : 0;
    
    const onboardingScore = onboarding[0]?.completion_percentage || 0;
    
    const financialReadiness = student.funding_status ? 75 : 25;

    // AI analysis for scoring
    const prompt = `Analyze this student lead and provide a comprehensive lead score:

Student: ${student.first_name} ${student.last_name}
Profile Completeness: ${profileCompleteness}%
Engagement Level: ${engagementLevel}
Event Participation: ${events.length} events (${events.filter(e => e.attended).length} attended)
Communication Responsiveness: ${responsiveness}%
Onboarding Progress: ${onboardingScore}%
Financial Status: ${student.funding_status || 'Not specified'}
Applications: ${applications.length}

Provide:
1. Overall lead score (0-100)
2. Score category (hot/warm/cold/unqualified)
3. Conversion probability (0-100)
4. Top 3 recommended actions to improve conversion
5. Reasoning for the score

Return as JSON.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          category: { 
            type: "string",
            enum: ["hot", "warm", "cold", "unqualified"]
          },
          conversion_probability: { type: "number" },
          recommended_actions: {
            type: "array",
            items: { type: "string" }
          },
          reasoning: { type: "string" }
        }
      }
    });

    // Store lead score
    const leadScore = await base44.entities.LeadScore.create({
      student_id,
      score: analysis.overall_score,
      score_category: analysis.category,
      factors: {
        profile_completeness: profileCompleteness,
        engagement_level: engagementLevel,
        event_participation: eventParticipation,
        communication_responsiveness: responsiveness,
        onboarding_completion: onboardingScore,
        financial_readiness: financialReadiness
      },
      conversion_probability: analysis.conversion_probability,
      recommended_actions: analysis.recommended_actions,
      last_calculated: new Date().toISOString()
    });

    return Response.json({
      lead_score: leadScore,
      analysis,
      calculated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating lead score:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});