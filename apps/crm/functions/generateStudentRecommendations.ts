import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId } = await req.json();

    // Fetch student profile
    const student = await base44.asServiceRole.entities.StudentProfile.get(studentId);
    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch all courses
    const allCourses = await base44.asServiceRole.entities.Course.list();

    // Filter by rule-based matching
    const matchedCourses = allCourses.filter(course => {
      const matches = [];
      let score = 0;

      // Country preference match
      if (student.preferred_countries?.includes(course.country)) {
        score += 30;
        matches.push('Preferred country');
      }

      // Degree level match
      if (student.preferred_degree_level === course.level) {
        score += 25;
        matches.push('Preferred degree level');
      }

      // Budget match
      if (student.budget_max && course.tuition_fee_min) {
        if (course.tuition_fee_min <= student.budget_max) {
          score += 25;
          matches.push('Within budget');
        }
      }

      // Field of study match
      if (student.preferred_fields?.length > 0) {
        if (student.preferred_fields.some(field => 
          course.subject_area?.toLowerCase().includes(field.toLowerCase())
        )) {
          score += 20;
          matches.push('Preferred field');
        }
      }

      // English proficiency match
      if (student.english_proficiency?.overall_score && course.ielts_overall) {
        if (student.english_proficiency.overall_score >= course.ielts_overall) {
          score += 15;
          matches.push('Meets language requirements');
        }
      }

      // Application deadline match (intake preference)
      if (student.target_intake && course.intake?.includes(student.target_intake)) {
        score += 10;
        matches.push('Matches target intake');
      }

      return score >= 50; // Only recommend courses with 50%+ match
    }).map(course => ({
      course,
      score,
      matches
    }));

    // Create recommendations in database
    for (const match of matchedCourses.slice(0, 10)) { // Limit to top 10
      await base44.asServiceRole.entities.StudentRecommendation.create({
        student_id: studentId,
        course_id: match.course.id,
        university_id: match.course.university_id,
        match_score: match.score,
        match_reasons: match.matches,
        status: 'recommended',
      });
    }

    return Response.json({
      success: true,
      recommendations_created: matchedCourses.slice(0, 10).length,
      total_score: matchedCourses.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});