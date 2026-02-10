import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { studentEmail, studentQuery, conversationHistory = [] } = body;

    if (!studentEmail || !studentQuery) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch student profile
    const profiles = await base44.entities.StudentProfile.filter({ email: studentEmail });
    if (!profiles.length) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = profiles[0];

    // Fetch student applications
    const applications = await base44.entities.Application.filter({ student_id: student.id });

    // Build context for LLM
    const context = buildContext(student, applications, conversationHistory);

    const prompt = `You are a helpful education counselor assisting a student. Based on the student profile and conversation history, draft a professional and empathetic response to the student's query.

Student Profile:
${context}

Student's Question:
"${studentQuery}"

Previous conversation (if any):
${conversationHistory.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Please draft a helpful, professional response that:
1. Directly addresses the student's question
2. References relevant information from their profile when applicable
3. Is empathetic and supportive in tone
4. Provides actionable advice or next steps
5. Is concise but comprehensive

Response:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    return Response.json({
      success: true,
      draft: response,
      student_name: `${student.first_name} ${student.last_name}`
    });
  } catch (error) {
    console.error('Error drafting response:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildContext(student, applications, conversationHistory) {
  let context = '';

  context += `Name: ${student.first_name} ${student.last_name}\n`;
  context += `Email: ${student.email}\n`;
  context += `Phone: ${student.phone}\n`;
  context += `Status: ${student.status}\n\n`;

  if (student.preferred_countries && student.preferred_countries.length > 0) {
    context += `Preferred Countries: ${student.preferred_countries.join(', ')}\n`;
  }

  if (student.preferred_degree_level) {
    context += `Preferred Degree Level: ${student.preferred_degree_level}\n`;
  }

  if (student.career_goals) {
    context += `Career Goals: ${student.career_goals}\n`;
  }

  if (student.academic_background_summary) {
    context += `Academic Background: ${student.academic_background_summary}\n`;
  }

  if (student.english_proficiency?.has_test) {
    context += `English Test: ${student.english_proficiency.test_type} - Overall Score: ${student.english_proficiency.overall_score}\n`;
  }

  if (applications && applications.length > 0) {
    context += `\nApplications:\n`;
    applications.forEach(app => {
      context += `- Status: ${app.status}, Priority: ${app.priority}\n`;
    });
  }

  return context;
}