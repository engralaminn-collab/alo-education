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
            work_experience_years: student.work_experience_years || 0,
            admission_preferences: student.admission_preferences?.map(p => ({
                destination: p.study_destination,
                level: p.study_level,
                program: p.program_title
            })) || []
        };

        const universitiesData = universities.map(u => {
            const universityCourses = courses.filter(c => c.university_id === u.id);
            return {
                id: u.id,
                name: u.university_name,
                country: u.country,
                city: u.city,
                ranking: u.qs_ranking || u.ranking,
                acceptance_rate: u.acceptance_rate,
                programs: universityCourses.map(c => ({
                    id: c.id,
                    title: c.course_title,
                    level: c.level,
                    subject_area: c.subject_area,
                    duration: c.duration,
                    tuition_min: c.tuition_fee_min,
                    tuition_max: c.tuition_fee_max,
                    currency: c.currency,
                    intake: c.intake,
                    ielts_required: c.ielts_overall,
                    entry_requirements: c.entry_requirements
                }))
            };
        });

        const prompt = `You are an expert education consultant at ALO Education.

STUDENT PROFILE:
${JSON.stringify(studentSummary, null, 2)}

AVAILABLE UNIVERSITIES WITH PROGRAMS:
${JSON.stringify(universitiesData.slice(0, 30), null, 2)}

TASK: Analyze the student's profile and recommend the TOP 5 most suitable UNIVERSITY + PROGRAM combinations.

MATCHING CRITERIA:
1. Country preference match (CRITICAL)
2. Academic level match (degree level MUST match program level)
3. Field of study alignment with student's preferred fields and career goals
4. Budget fit - tuition within student's budget_max
5. Admission competitiveness vs student's academic results
6. English proficiency meets program requirements
7. Intake timing alignment
8. Career outcomes and program reputation

For EACH recommendation, provide:
- University ID
- Specific Course/Program ID from the programs array
- Match score (0-100)
- Key reasons why this university + program combination fits
- Admission probability (High/Moderate/Low)
- Career prospects for this program
- Why this program aligns with student goals`;


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
                                course_id: { type: 'string' },
                                match_score: { type: 'number' },
                                reasons: { type: 'array', items: { type: 'string' } },
                                admission_probability: { type: 'string' },
                                career_prospects: { type: 'string' },
                                program_alignment: { type: 'string' }
                            }
                        }
                    }
                }
            }
        });

        // Enrich with full university and course data
        const enrichedRecommendations = aiResponse.recommendations.map(rec => {
            const uni = universities.find(u => u.id === rec.university_id);
            const course = courses.find(c => c.id === rec.course_id);
            return {
                ...rec,
                university: uni,
                program: course
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