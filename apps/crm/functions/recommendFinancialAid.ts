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
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id });
    
    // Fetch all available scholarships
    const scholarships = await base44.asServiceRole.entities.Scholarship.filter({ is_active: true });

    // AI financial aid recommendation
    const recommendationPrompt = `
You are a financial aid expert. Analyze this student's profile and recommend suitable scholarships and financial aid opportunities.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Nationality: ${student.nationality || 'Not specified'}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Budget: ${student.budget_max ? `$${student.budget_max}` : 'Not specified'}
- Funding Status: ${student.funding_status || 'Not specified'}
- Sponsor: ${student.sponsor || 'Not specified'}
- Academic Background: ${student.academic_background_summary || 'Not specified'}
- Work Experience: ${student.work_experience_years || 0} years
- Career Goals: ${student.career_goals || 'Not specified'}

Available Scholarships:
${scholarships.slice(0, 20).map(s => `
- ${s.scholarship_name} (${s.provider})
  Country: ${s.country}
  Eligible Countries: ${s.eligible_countries?.join(', ') || 'All'}
  Degree Levels: ${s.degree_level?.join(', ') || 'All'}
  Fields: ${s.field_of_study?.join(', ') || 'All'}
  Coverage: ${s.coverage_type}
  Amount: ${s.amount}
  Min GPA: ${s.minimum_gpa || 'Not specified'}
  Deadline: ${s.application_deadline || 'Rolling'}
`).join('\n')}

Provide:
1. Top matching scholarships with eligibility scores
2. Eligibility assessment (fully eligible, partially eligible, needs improvement)
3. Missing requirements or documents
4. Application strategy and timeline
5. Financial planning advice
6. Alternative funding options
7. Tips to improve scholarship eligibility
`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt: recommendationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_scholarships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scholarship_name: { type: "string" },
                eligibility_score: { type: "number" },
                eligibility_status: { 
                  type: "string", 
                  enum: ["fully_eligible", "mostly_eligible", "partially_eligible", "improvement_needed"] 
                },
                match_reasons: { type: "array", items: { type: "string" } },
                missing_requirements: { type: "array", items: { type: "string" } },
                application_priority: { type: "string", enum: ["high", "medium", "low"] },
                deadline_proximity: { type: "string" },
                estimated_award_amount: { type: "string" }
              }
            }
          },
          financial_planning_advice: {
            type: "object",
            properties: {
              total_estimated_costs: { type: "string" },
              scholarship_potential: { type: "string" },
              funding_gap: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } }
            }
          },
          application_strategy: {
            type: "object",
            properties: {
              immediate_actions: { type: "array", items: { type: "string" } },
              timeline_recommendations: { type: "array", items: { type: "string" } },
              success_tips: { type: "array", items: { type: "string" } }
            }
          },
          eligibility_improvement_tips: { type: "array", items: { type: "string" } },
          alternative_funding: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Match to actual scholarship IDs and save recommendations
    const enrichedRecs = recommendations.recommended_scholarships.map(rec => {
      const scholarship = scholarships.find(s => 
        s.scholarship_name.toLowerCase().includes(rec.scholarship_name.toLowerCase()) ||
        rec.scholarship_name.toLowerCase().includes(s.scholarship_name.toLowerCase())
      );
      return { ...rec, scholarship_id: scholarship?.id, scholarship_details: scholarship };
    }).filter(r => r.scholarship_id);

    // Save scholarship recommendations
    for (const rec of enrichedRecs.slice(0, 10)) {
      await base44.asServiceRole.entities.ScholarshipRecommendation?.create({
        student_id: student.id,
        scholarship_id: rec.scholarship_id,
        match_score: rec.eligibility_score,
        eligibility_status: rec.eligibility_status,
        match_reasons: rec.match_reasons,
        missing_requirements: rec.missing_requirements,
        status: 'suggested',
        generated_at: new Date().toISOString()
      });

      // Create reminder for upcoming deadlines
      if (rec.application_priority === 'high') {
        await base44.asServiceRole.entities.Reminder?.create({
          student_id: student.id,
          counselor_id: student.counselor_id,
          reminder_type: 'scholarship_deadline',
          reminder_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          message: `Scholarship Application: ${rec.scholarship_name}`,
          priority: 'high',
          status: 'pending',
          created_by_ai: true
        });
      }
    }

    return Response.json({
      success: true,
      recommendations: enrichedRecs,
      financial_planning: recommendations.financial_planning_advice,
      application_strategy: recommendations.application_strategy,
      improvement_tips: recommendations.eligibility_improvement_tips,
      alternative_funding: recommendations.alternative_funding
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});