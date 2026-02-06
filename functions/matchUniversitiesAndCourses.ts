import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentProfileId } = await req.json();

    // Get student profile
    const students = await base44.asServiceRole.entities.StudentProfile.filter({ 
      id: studentProfileId 
    });
    const student = students[0];

    if (!student) {
      return Response.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Get all universities, courses, and partnerships
    const universities = await base44.asServiceRole.entities.University.filter({ 
      status: 'active' 
    });
    const courses = await base44.asServiceRole.entities.Course.filter({ 
      status: 'open' 
    });
    const scholarships = await base44.asServiceRole.entities.Scholarship.list();
    const partnerships = await base44.asServiceRole.entities.UniversityAgreement.filter({ 
      status: 'active' 
    });

    // Build student profile summary
    const profileSummary = {
      education: student.education_history || [],
      english_proficiency: student.english_proficiency || {},
      work_experience_years: student.work_experience_years || 0,
      preferred_countries: student.preferred_countries || [],
      preferred_degree_level: student.preferred_degree_level,
      preferred_fields: student.preferred_fields || [],
      budget_max: student.budget_max,
      target_intake: student.target_intake,
      funding_status: student.funding_status,
      nationality: student.nationality
    };

    // Build database summary for AI
    const universitySummary = universities.slice(0, 50).map(u => {
      const partnership = partnerships.find(p => p.university_id === u.id);
      return {
        id: u.id,
        name: u.university_name,
        country: u.country,
        city: u.city,
        ranking: u.qs_ranking || u.ranking,
        acceptance_rate: u.acceptance_rate,
        student_satisfaction: u.student_satisfaction_score,
        employability: u.graduate_employability_rate,
        international_students_percent: u.international_students_percent,
        has_partnership: !!partnership,
        commission_rate: partnership?.commission_rate
      };
    });

    const courseSummary = courses.slice(0, 100).map(c => ({
      id: c.id,
      title: c.course_title,
      level: c.level,
      subject: c.subject_area,
      university_id: c.university_id,
      country: c.country,
      tuition_min: c.tuition_fee_min,
      tuition_max: c.tuition_fee_max,
      ielts_required: c.ielts_overall,
      duration: c.duration,
      scholarship_available: c.scholarship_available
    }));

    const scholarshipSummary = scholarships.slice(0, 30).map(s => ({
      name: s.name,
      amount: s.amount,
      eligibility: s.eligibility_criteria,
      country: s.country,
      level: s.level
    }));

    // Use AI to analyze and match
    const matchingPrompt = `
You are an expert education counselor. Analyze this student profile and recommend the best university and course matches.

STUDENT PROFILE:
${JSON.stringify(profileSummary, null, 2)}

AVAILABLE UNIVERSITIES (Top 50):
${JSON.stringify(universitySummary, null, 2)}

AVAILABLE COURSES (Top 100):
${JSON.stringify(courseSummary, null, 2)}

AVAILABLE SCHOLARSHIPS:
${JSON.stringify(scholarshipSummary, null, 2)}

TASK:
1. Match student to TOP 8 most suitable university-course combinations
2. Consider: academic level, field of study, budget, country preferences, language scores
3. Prioritize universities with good rankings, high acceptance rates, employability, and active partnerships
4. For each match, identify relevant scholarships and estimate visa success rate
5. Boost match score slightly (+5-10%) if university has active partnership agreement

Return JSON array of matches with:
- university_id: string
- course_id: string
- match_score: number (0-100)
- match_reasons: array of strings (key reasons for the match)
- scholarship_opportunities: array of objects with {name, amount, eligibility}
- estimated_visa_success_rate: number (0-100)
- career_prospects: string (brief description)
- affordability_score: number (0-100)
- key_benefits: array of strings (top 3-5 benefits)

Only recommend courses that align with student's level and field preferences.
`;

    const aiMatches = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: matchingPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                university_id: { type: "string" },
                course_id: { type: "string" },
                match_score: { type: "number" },
                match_reasons: { type: "array", items: { type: "string" } },
                scholarship_opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      amount: { type: "number" },
                      eligibility: { type: "string" }
                    }
                  }
                },
                estimated_visa_success_rate: { type: "number" },
                career_prospects: { type: "string" },
                affordability_score: { type: "number" },
                key_benefits: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Enrich matches with full university and course data
    const enrichedMatches = aiMatches.matches.map(match => {
      const university = universities.find(u => u.id === match.university_id);
      const course = courses.find(c => c.id === match.course_id);

      return {
        ...match,
        university: university ? {
          id: university.id,
          name: university.university_name,
          country: university.country,
          city: university.city,
          logo: university.logo,
          ranking: university.qs_ranking || university.ranking,
          acceptance_rate: university.acceptance_rate,
          employability_rate: university.graduate_employability_rate
        } : null,
        course: course ? {
          id: course.id,
          title: course.course_title,
          level: course.level,
          subject: course.subject_area,
          duration: course.duration,
          tuition_min: course.tuition_fee_min,
          tuition_max: course.tuition_fee_max,
          ielts_required: course.ielts_overall
        } : null
      };
    }).filter(m => m.university && m.course);

    return Response.json({
      success: true,
      matches: enrichedMatches,
      total_matches: enrichedMatches.length,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error matching universities:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});