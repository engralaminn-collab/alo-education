import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { student_id } = await req.json();

    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const scholarships = await base44.asServiceRole.entities.Scholarship.filter({ is_active: true });

    if (scholarships.length === 0) {
      return Response.json({ success: true, message: 'No scholarships available', recommendations: [] });
    }

    // Calculate student GPA from education history
    const latestEducation = student.education_history?.[student.education_history.length - 1];
    const studentGPA = latestEducation?.result ? parseFloat(latestEducation.result) : 0;

    // AI scholarship matching
    const matchingPrompt = `
You are an expert scholarship advisor AI. Match this student with suitable scholarships.

Student Profile:
- Nationality: ${student.nationality || 'Not specified'}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Fields of Study: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Academic Performance: GPA ${studentGPA}, Latest: ${latestEducation?.result || 'N/A'}
- English Proficiency: ${student.english_proficiency?.test_type} ${student.english_proficiency?.overall_score || 'N/A'}
- Financial Need: ${student.budget_max ? `Budget up to ${student.budget_max}` : 'Not specified'}
- Work Experience: ${student.work_experience_years || 0} years
- Career Goals: ${student.career_goals || 'Not specified'}

Available Scholarships: ${JSON.stringify(scholarships.slice(0, 20))}

For each suitable scholarship, provide:
- scholarship_id
- match_score (0-100)
- eligibility_status (highly_eligible, eligible, partially_eligible)
- match_reasons (why they qualify)
- missing_requirements (what they need)
- application_difficulty (easy, moderate, difficult)

Rank by match_score. Return top 10 matches.
    `;

    const aiMatches = await base44.integrations.Core.InvokeLLM({
      prompt: matchingPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scholarship_name: { type: "string" },
                match_score: { type: "number" },
                eligibility_status: { 
                  type: "string", 
                  enum: ["highly_eligible", "eligible", "partially_eligible", "not_eligible"] 
                },
                match_reasons: {
                  type: "array",
                  items: { type: "string" }
                },
                missing_requirements: {
                  type: "array",
                  items: { type: "string" }
                },
                application_difficulty: {
                  type: "string",
                  enum: ["easy", "moderate", "difficult"]
                }
              }
            }
          }
        }
      }
    });

    // Save recommendations
    const savedRecommendations = [];
    for (const rec of aiMatches.recommendations) {
      const scholarship = scholarships.find(s => 
        s.scholarship_name?.toLowerCase().includes(rec.scholarship_name?.toLowerCase()) ||
        rec.scholarship_name?.toLowerCase().includes(s.scholarship_name?.toLowerCase())
      );

      if (scholarship) {
        const recommendation = await base44.asServiceRole.entities.ScholarshipRecommendation.create({
          student_id,
          scholarship_id: scholarship.id,
          match_score: rec.match_score,
          eligibility_status: rec.eligibility_status,
          match_reasons: rec.match_reasons,
          missing_requirements: rec.missing_requirements || [],
          application_difficulty: rec.application_difficulty,
          status: 'suggested',
          generated_at: new Date().toISOString()
        });

        savedRecommendations.push({
          ...recommendation,
          scholarship
        });
      }
    }

    return Response.json({
      success: true,
      student_name: `${student.first_name} ${student.last_name}`,
      recommendations_count: savedRecommendations.length,
      recommendations: savedRecommendations
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});