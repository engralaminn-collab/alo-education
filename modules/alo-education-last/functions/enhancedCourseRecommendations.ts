import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, include_success_prediction, include_employment_data } = await req.json();

    // Fetch comprehensive student data
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id });
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter({ 
      student_id 
    }, '-created_date', 50);
    const previousRecommendations = await base44.asServiceRole.entities.CourseRecommendation?.filter({
      student_id
    }) || [];
    
    // Get feedback on previous recommendations
    const recommendationFeedback = previousRecommendations
      .filter(r => r.feedback_rating || r.feedback_comments)
      .map(r => ({
        course_id: r.course_id,
        rating: r.feedback_rating,
        comments: r.feedback_comments,
        status: r.status
      }));

    // Fetch courses
    const allCourses = await base44.asServiceRole.entities.Course.filter({ status: 'open' });
    
    const relevantCourses = allCourses.filter(c => 
      (!student.preferred_countries?.length || student.preferred_countries.includes(c.country)) &&
      (!student.preferred_degree_level || c.level === student.preferred_degree_level)
    );

    // Extract deep career interests from communications
    const careerTopics = communications
      .filter(c => c.key_topics?.some(t => 
        t.toLowerCase().includes('career') || 
        t.toLowerCase().includes('job') ||
        t.toLowerCase().includes('work')
      ))
      .flatMap(c => c.key_topics)
      .slice(0, 15);

    // Enhanced AI recommendations
    const recommendationPrompt = `
Generate highly personalized course recommendations with deep analysis.

Student Deep Profile:
- Name: ${student.first_name} ${student.last_name}
- Career Goals: ${student.career_goals || 'Not specified'}
- Work Experience: ${student.work_experience_years || 0} years
- Academic Background: ${student.academic_background_summary || 'Not specified'}
- Budget: ${student.budget_max ? `$${student.budget_max}` : 'Flexible'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Open'}

Career Interests from Conversations:
${careerTopics.join(', ') || 'No specific career topics discussed'}

Past Application Patterns:
${applications.map(a => `${a.status} - ${a.course_id}`).join(', ') || 'No previous applications'}

Previous Recommendation Feedback:
${recommendationFeedback.length > 0 ? 
  recommendationFeedback.map(f => `Rating: ${f.rating}/5 - ${f.comments || 'No comments'} - Status: ${f.status}`).join('\n') :
  'No previous feedback'}

Available Courses (${relevantCourses.length}):
${relevantCourses.slice(0, 20).map(c => `
- ${c.course_title} (${c.level})
  Subject: ${c.subject_area}
  Duration: ${c.duration}
  Fee: ${c.tuition_fee_min}-${c.tuition_fee_max} ${c.currency}
  Categories: ${c.ai_categories?.primary_category || 'Uncategorized'}
  Career Paths: ${c.ai_categories?.career_paths?.slice(0, 3).join(', ') || 'Not specified'}
`).join('\n')}

Provide enhanced recommendations considering:
1. Deep alignment with stated career goals
2. Fit with conversation history and expressed interests
3. Learning from past recommendation feedback
4. Career progression potential
5. ${include_success_prediction ? 'Predicted student success rate in each course' : ''}
6. ${include_employment_data ? 'Expected employment outcomes and salary potential' : ''}

Recommend top 8 courses with comprehensive analysis.
`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
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
                career_alignment_score: { type: "number" },
                reasoning: { type: "string" },
                career_outcomes: {
                  type: "object",
                  properties: {
                    typical_roles: { type: "array", items: { type: "string" } },
                    salary_range: { type: "string" },
                    employment_rate: { type: "number" }
                  }
                },
                predicted_success_rate: { type: "number" },
                learning_curve: { type: "string", enum: ["gentle", "moderate", "steep", "very_steep"] },
                why_recommended: { type: "array", items: { type: "string" } },
                potential_challenges: { type: "array", items: { type: "string" } },
                best_for: { type: "string" }
              }
            }
          },
          recommendation_strategy: { type: "string" },
          personalization_factors: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Match to actual course IDs and save
    const enrichedRecs = recommendations.recommendations.map(rec => {
      const course = relevantCourses.find(c => 
        c.course_title.toLowerCase().includes(rec.course_title.toLowerCase()) ||
        rec.course_title.toLowerCase().includes(c.course_title.toLowerCase())
      );
      return { ...rec, course_id: course?.id, course_details: course };
    }).filter(r => r.course_id);

    // Save enhanced recommendations
    for (const rec of enrichedRecs.slice(0, 8)) {
      await base44.asServiceRole.entities.CourseRecommendation?.create({
        student_id: student.id,
        course_id: rec.course_id,
        match_score: rec.match_score,
        career_alignment_score: rec.career_alignment_score,
        predicted_success_rate: rec.predicted_success_rate,
        rationale: rec.why_recommended,
        career_outcomes: rec.career_outcomes,
        potential_challenges: rec.potential_challenges,
        status: 'suggested',
        generated_at: new Date().toISOString(),
        recommendation_version: 'enhanced_v2'
      });
    }

    return Response.json({
      success: true,
      recommendations: enrichedRecs,
      recommendation_strategy: recommendations.recommendation_strategy,
      personalization_factors: recommendations.personalization_factors
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});