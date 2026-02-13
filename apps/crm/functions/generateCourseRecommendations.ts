import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { student_id } = await req.json();

    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const allCourses = await base44.asServiceRole.entities.Course.list();
    const universities = await base44.asServiceRole.entities.University.list();

    // AI-powered recommendation generation
    const recommendationPrompt = `
You are an expert education advisor AI. Analyze this student profile and recommend the best courses and universities.

Student Profile:
- Academic Background: ${JSON.stringify(student.education_history?.slice(-2))}
- English Proficiency: ${student.english_proficiency?.test_type} ${student.english_proficiency?.overall_score}
- Work Experience: ${student.work_experience_years || 0} years
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Preferred Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Career Goals: ${student.career_goals || 'Not specified'}
- Budget Max: ${student.budget_max || 'Not specified'}
- Target Intake: ${student.target_intake || 'Not specified'}

Available Courses Sample: ${JSON.stringify(allCourses.slice(0, 10))}

Analyze and recommend top 10 courses/universities based on:
1. Academic fit (profile matches entry requirements)
2. Budget compatibility
3. Location preference alignment
4. Career goal alignment
5. Intake availability

For each recommendation, provide:
- course_id
- match_score (0-100)
- rationale (array of reasons)
- match_factors breakdown
    `;

    const aiRecommendations = await base44.integrations.Core.InvokeLLM({
      prompt: recommendationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                course_title: { type: "string" },
                university_name: { type: "string" },
                country: { type: "string" },
                match_score: { type: "number" },
                rationale: {
                  type: "array",
                  items: { type: "string" }
                },
                match_factors: {
                  type: "object",
                  properties: {
                    academic_fit: { type: "number" },
                    budget_fit: { type: "number" },
                    location_preference: { type: "number" },
                    career_alignment: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Match AI recommendations to actual courses and save
    const savedRecommendations = [];
    for (let i = 0; i < aiRecommendations.recommendations.length; i++) {
      const rec = aiRecommendations.recommendations[i];
      
      // Find matching course
      const matchingCourse = allCourses.find(c => 
        c.course_title?.toLowerCase().includes(rec.course_title?.toLowerCase()) ||
        rec.course_title?.toLowerCase().includes(c.course_title?.toLowerCase())
      );

      if (matchingCourse) {
        const university = universities.find(u => u.id === matchingCourse.university_id);
        
        const recommendation = await base44.asServiceRole.entities.CourseRecommendation.create({
          student_id,
          course_id: matchingCourse.id,
          university_id: matchingCourse.university_id,
          match_score: rec.match_score,
          ranking: i + 1,
          rationale: rec.rationale,
          match_factors: rec.match_factors,
          status: 'suggested',
          generated_at: new Date().toISOString()
        });
        
        savedRecommendations.push({
          ...recommendation,
          course: matchingCourse,
          university
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