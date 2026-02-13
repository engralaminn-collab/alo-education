import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { studentId } = body;

    if (!studentId) {
      return Response.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Fetch student profile
    const profiles = await base44.asServiceRole.entities.StudentProfile.filter({ id: studentId });
    if (!profiles.length) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = profiles[0];

    // Fetch available universities and courses
    const universities = await base44.asServiceRole.entities.University.filter({
      status: 'active'
    }, undefined, 100);

    const courses = await base44.asServiceRole.entities.Course.filter({
      status: 'open'
    }, undefined, 100);

    // Get student's existing applications to avoid duplicates
    const existingApps = await base44.asServiceRole.entities.Application.filter({ student_id: studentId });
    const appliedCourseIds = new Set(existingApps.map(a => a.course_id));

    // Build prompt for LLM
    const prompt = buildPrompt(student, universities, courses, appliedCourseIds);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                course_id: { type: 'string' },
                university_id: { type: 'string' },
                course_title: { type: 'string' },
                university_name: { type: 'string' },
                match_score: { type: 'number' },
                match_reasons: {
                  type: 'array',
                  items: { type: 'string' }
                },
                why_recommended: { type: 'string' }
              }
            }
          },
          insights: { type: 'string' }
        }
      }
    });

    return Response.json({
      success: true,
      recommendations: response.recommendations || [],
      insights: response.insights || '',
      student_name: `${student.first_name} ${student.last_name}`
    });
  } catch (error) {
    console.error('Error suggesting courses:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildPrompt(student, universities, courses, appliedCourseIds) {
  const coursesJson = courses
    .filter(c => !appliedCourseIds.has(c.id))
    .slice(0, 50)
    .map(c => ({
      id: c.id,
      title: c.course_title,
      level: c.level,
      subject: c.subject_area,
      country: c.country,
      university: c.university_id,
      duration: c.duration,
      fee_min: c.tuition_fee_min,
      fee_max: c.tuition_fee_max,
      ielts_required: c.ielts_overall
    }));

  const universitiesJson = universities.slice(0, 50).map(u => ({
    id: u.id,
    name: u.university_name,
    country: u.country,
    city: u.city,
    ranking: u.qs_ranking,
    acceptance_rate: u.acceptance_rate
  }));

  return `You are an expert education counselor. Based on this student's profile, recommend the top 5-8 most suitable courses and universities from the provided catalog.

STUDENT PROFILE:
- Name: ${student.first_name} ${student.last_name}
- Academic Background: ${student.academic_background_summary || 'Not provided'}
- Preferred Fields: ${(student.preferred_fields || []).join(', ') || 'Not specified'}
- Preferred Countries: ${(student.preferred_countries || []).join(', ') || 'Not specified'}
- Preferred Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Career Goals: ${student.career_goals || 'Not specified'}
- Budget: ${student.budget_max ? `USD ${student.budget_max}/year` : 'Flexible'}
- English Test: ${student.english_proficiency?.test_type ? `${student.english_proficiency.test_type} - ${student.english_proficiency.overall_score}` : 'Not yet taken'}
- Work Experience: ${student.work_experience_years || 0} years

AVAILABLE UNIVERSITIES:
${JSON.stringify(universitiesJson, null, 2)}

AVAILABLE COURSES:
${JSON.stringify(coursesJson, null, 2)}

For each recommendation, provide:
1. course_id and university_id
2. match_score (0-100) based on how well it fits
3. match_reasons (array of 2-3 specific reasons)
4. why_recommended (1-2 sentences explaining the recommendation)

Also provide overall insights about the student's profile and recommended study path.

Return a JSON object with "recommendations" array and "insights" string.`;
}