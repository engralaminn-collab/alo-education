import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { studentId, universityId, programId, programs, reasons, careerProspects } = await req.json();

        // Fetch data
        const student = await base44.entities.StudentProfile.get(studentId);
        const university = await base44.entities.University.get(universityId);
        const program = programId ? await base44.entities.Course.get(programId) : null;
        
        // Get university contacts
        const contacts = await base44.entities.UniversityContact.filter({ 
            university_id: universityId 
        });
        const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

        const prompt = `You are a professional education consultant drafting an email to a university admissions department.

STUDENT INFORMATION:
- Name: ${student.first_name} ${student.last_name}
- Email: ${student.email}
- Phone: ${student.phone}
- Nationality: ${student.nationality}
- Preferred Degree: ${student.preferred_degree_level}
- Target Intake: ${student.target_intake}
- Academic Background: ${student.education_history?.map(e => `${e.level} - ${e.result}`).join(', ')}
- English Test: ${student.english_proficiency?.test_type} - ${student.english_proficiency?.overall_score || 'Not taken yet'}
- Work Experience: ${student.work_experience_years || 0} years

UNIVERSITY:
- Name: ${university.university_name}
- Country: ${university.country}

${program ? `SPECIFIC PROGRAM OF INTEREST:
- Program: ${program.course_title}
- Level: ${program.level}
- Duration: ${program.duration}
- Tuition: ${program.currency} ${program.tuition_fee_min}-${program.tuition_fee_max}
- Subject Area: ${program.subject_area}
- IELTS Required: ${program.ielts_overall || 'TBD'}
` : 'RECOMMENDED PROGRAMS:\n' + (programs?.join(', ') || 'General inquiry')}

MATCHING REASONS:
${reasons?.join(', ') || 'Strong profile fit'}

${careerProspects ? `CAREER PROSPECTS:\n${careerProspects}` : ''}

TASK: Draft a professional, personalized email to ${university.university_name}'s admissions team introducing this student.

REQUIREMENTS:
- Professional yet warm tone
- Highlight student's strengths
- Express genuine interest in specific programs
- Request information about application process, requirements, and deadlines
- Keep it concise (250-300 words)
- Include a clear call-to-action

Provide:
1. Subject line
2. Email body
3. Suggested follow-up timeline`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    subject: { type: 'string' },
                    body: { type: 'string' },
                    follow_up_days: { type: 'number' },
                    tone_notes: { type: 'string' }
                }
            }
        });

        // Create outreach record
        const outreach = await base44.entities.UniversityOutreach.create({
            university_id: universityId,
            student_id: studentId,
            contact_person: primaryContact?.contact_name || 'Admissions Team',
            contact_email: primaryContact?.email || university.website_url,
            outreach_type: 'student_introduction',
            subject: aiResponse.subject,
            message_body: aiResponse.body,
            status: 'draft',
            scheduled_date: new Date().toISOString(),
            created_by: user.email
        });

        return Response.json({
            success: true,
            outreach_id: outreach.id,
            subject: aiResponse.subject,
            body: aiResponse.body,
            follow_up_days: aiResponse.follow_up_days,
            recipient: primaryContact?.email || 'Not found - check university website',
            recipient_name: primaryContact?.contact_name || 'Admissions Team'
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});