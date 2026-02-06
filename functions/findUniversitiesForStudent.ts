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
        const student = await base44.entities.StudentProfile.get(studentId);
        
        // Fetch all active universities
        const universities = await base44.entities.University.filter({ status: 'active' });

        // Fetch courses for matching
        const courses = await base44.entities.Course.filter({ status: 'open' });

        // Prepare data for AI
        const studentSummary = {
            name: `${student.first_name} ${student.last_name}`,
            preferred_countries: student.preferred_countries || [],
            preferred_degree_level: student.preferred_degree_level,
            preferred_fields: student.preferred_fields || [],
            budget_max: student.budget_max,
            target_intake: student.target_intake,
            education: student.education_history?.map(e => ({
                level: e.level,
                result: e.result,
                institution: e.institution
            })) || [],
            english_proficiency: student.english_proficiency || {},
            work_experience_years: student.work_experience_years || 0
        };

        const universitiesData = universities.map(u => ({
            id: u.id,
            name: u.university_name,
            country: u.country,
            city: u.city,
            ranking: u.qs_ranking || u.ranking,
            acceptance_rate: u.acceptance_rate,
            tuition_estimate: 'Varies by program',
            available_programs: courses.filter(c => c.university_id === u.id).map(c => c.subject_area)
        }));

        const prompt = `You are an expert education consultant at ALO Education.

STUDENT PROFILE:
${JSON.stringify(studentSummary, null, 2)}

AVAILABLE UNIVERSITIES:
${JSON.stringify(universitiesData.slice(0, 50), null, 2)}

TASK: Analyze the student's profile and recommend the TOP 5 most suitable universities.

MATCHING CRITERIA:
1. Country preference match (CRITICAL)
2. Academic level match (degree level)
3. Field of study alignment
4. Budget fit (if specified)
5. Admission competitiveness vs student's grades
6. University ranking vs student's academic profile
7. Intake timing match

For each recommendation, provide:
- University ID
- Match score (0-100)
- Key reasons why this university fits
- Specific programs to highlight
- Admission probability estimate`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    recommendations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                university_id: { type: 'string' },
                                match_score: { type: 'number' },
                                reasons: { type: 'array', items: { type: 'string' } },
                                recommended_programs: { type: 'array', items: { type: 'string' } },
                                admission_probability: { type: 'string' }
                            }
                        }
                    }
                }
            }
        });

        // Enrich with full university data
        const enrichedRecommendations = aiResponse.recommendations.map(rec => {
            const uni = universities.find(u => u.id === rec.university_id);
            return {
                ...rec,
                university: uni
            };
        });

        return Response.json({
            success: true,
            student_name: `${student.first_name} ${student.last_name}`,
            recommendations: enrichedRecommendations
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});