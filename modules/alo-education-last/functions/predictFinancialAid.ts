import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { student_id } = await req.json();

    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);

    // Calculate academic score
    const latestEducation = student.education_history?.[student.education_history.length - 1];
    const gpa = latestEducation?.result ? parseFloat(latestEducation.result) : 0;

    // AI Financial Aid Prediction
    const predictionPrompt = `
You are an expert financial aid advisor AI. Predict this student's likelihood of receiving financial aid/scholarships.

Student Profile:
- Nationality: ${student.nationality || 'Not specified'}
- Academic Performance: GPA ${gpa}, Latest: ${latestEducation?.result || 'N/A'}
- Education Level: ${latestEducation?.level || 'N/A'}
- English Test: ${student.english_proficiency?.test_type} ${student.english_proficiency?.overall_score || 'N/A'}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Work Experience: ${student.work_experience_years || 0} years
- Budget: ${student.budget_max || 'Not specified'}
- Career Goals: ${student.career_goals || 'Not specified'}
- Financial Status: ${student.funding_status || 'Not specified'}, Sponsor: ${student.sponsor || 'Not specified'}

Analyze and provide:
1. Financial aid probability (0-100)
2. Scholarship eligibility level (high, medium, low)
3. Specific reasons for prediction
4. Recommended scholarship types
5. Financial planning suggestions
6. Documents needed for aid applications
7. Timeline for applications
    `;

    const aiPrediction = await base44.integrations.Core.InvokeLLM({
      prompt: predictionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          aid_probability: { type: "number" },
          eligibility_level: {
            type: "string",
            enum: ["high", "medium", "low"]
          },
          reasons: {
            type: "array",
            items: { type: "string" }
          },
          recommended_scholarship_types: {
            type: "array",
            items: { type: "string" }
          },
          financial_planning_suggestions: {
            type: "array",
            items: { type: "string" }
          },
          required_documents: {
            type: "array",
            items: { type: "string" }
          },
          application_timeline: { type: "string" }
        }
      }
    });

    // Flag high-potential students
    if (aiPrediction.aid_probability >= 70 && student.counselor_id) {
      await base44.asServiceRole.entities.Task.create({
        title: `High Financial Aid Potential: ${student.first_name} ${student.last_name}`,
        description: `This student has ${aiPrediction.aid_probability}% aid probability. Proactive counseling recommended.`,
        type: 'other',
        student_id: student.id,
        assigned_to: student.counselor_id,
        priority: 'high',
        status: 'pending',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return Response.json({
      success: true,
      student_name: `${student.first_name} ${student.last_name}`,
      prediction: aiPrediction
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});