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
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter({ 
      student_id 
    }, '-created_date', 20);
    
    // Fetch all courses
    const allCourses = await base44.asServiceRole.entities.Course.filter({ status: 'open' });

    // Filter courses by student preferences
    const relevantCourses = allCourses.filter(c => 
      (!student.preferred_countries?.length || student.preferred_countries.includes(c.country)) &&
      (!student.preferred_degree_level || c.level === student.preferred_degree_level)
    );

    // Extract student interests from communications
    const interestKeywords = communications
      .filter(c => c.key_topics?.length > 0)
      .flatMap(c => c.key_topics)
      .slice(0, 10);

    // AI-powered course recommendations
    const recommendationPrompt = `
You are an expert education advisor. Recommend the most suitable courses for this student.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Preferred Degree: ${student.preferred_degree_level || 'Not specified'}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Budget: ${student.budget_max ? `Up to $${student.budget_max}` : 'Not specified'}
- Career Goals: ${student.career_goals || 'Not specified'}
- Academic Background: ${student.academic_background_summary || 'Not specified'}
- Work Experience: ${student.work_experience_years || 0} years
- Interests from conversations: ${interestKeywords.join(', ') || 'None'}

Current Applications: ${applications.length}

Available Courses (${relevantCourses.length} matching preferences):
${relevantCourses.slice(0, 30).map(c => `
- ${c.course_title} at ${c.university_id}
  Level: ${c.level}
  Subject: ${c.subject_area}
  Fee: ${c.tuition_fee_min}-${c.tuition_fee_max} ${c.currency}
  Overview: ${c.overview?.substring(0, 150) || 'No overview'}
`).join('\n')}

Recommend top 10 courses with:
1. Match score (0-100)
2. Reasoning for recommendation
3. Career alignment
4. Financial fit
5. Academic fit
6. Potential concerns
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
                match_score: { type: "number" },
                reasoning: { type: "string" },
                career_alignment: { type: "string" },
                financial_fit: { type: "string" },
                academic_fit: { type: "string" },
                concerns: {
                  type: "array",
                  items: { type: "string" }
                },
                recommended_action: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Match AI recommendations to actual course IDs
    const enrichedRecommendations = aiRecommendations.recommendations.map(rec => {
      const matchedCourse = relevantCourses.find(c => 
        c.course_title.toLowerCase().includes(rec.course_title.toLowerCase()) ||
        rec.course_title.toLowerCase().includes(c.course_title.toLowerCase())
      );

      return {
        ...rec,
        course_id: matchedCourse?.id,
        course_details: matchedCourse
      };
    }).filter(r => r.course_id);

    // Save recommendations
    for (const rec of enrichedRecommendations.slice(0, 10)) {
      await base44.asServiceRole.entities.CourseRecommendation?.create({
        student_id: student.id,
        course_id: rec.course_id,
        match_score: rec.match_score,
        rationale: [rec.reasoning, rec.career_alignment, rec.academic_fit],
        status: 'suggested',
        generated_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      recommendations: enrichedRecommendations,
      total_recommended: enrichedRecommendations.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});