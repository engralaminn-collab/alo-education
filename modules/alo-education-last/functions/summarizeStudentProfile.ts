import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
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

    // Fetch applications
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id: studentId });

    // Fetch documents
    const documents = await base44.asServiceRole.entities.Document.filter({ student_id: studentId });

    // Fetch tasks
    const tasks = await base44.asServiceRole.entities.Task.filter({ student_id: studentId });

    // Build detailed context
    const context = buildDetailedContext(student, applications, documents, tasks);

    const prompt = `You are an education counselor. Analyze this student's profile and provide a comprehensive summary including:

1. Student Profile Overview - Key information and readiness for applications
2. Application Progress - Current status and next steps
3. Document Status - What's missing or pending
4. Key Strengths - Academic and personal strengths
5. Areas of Focus - What needs attention
6. Recommended Next Actions - Specific actionable steps

Student Information:
${context}

Provide a professional, structured summary that helps another counselor quickly understand the student's situation and needs.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    return Response.json({
      success: true,
      summary: response,
      student_name: `${student.first_name} ${student.last_name}`,
      profile_completeness: student.profile_completeness
    });
  } catch (error) {
    console.error('Error summarizing profile:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildDetailedContext(student, applications, documents, tasks) {
  let context = '';

  // Basic info
  context += `Name: ${student.first_name} ${student.last_name}\n`;
  context += `Email: ${student.email}\n`;
  context += `Phone: ${student.phone}\n`;
  context += `Nationality: ${student.nationality}\n`;
  context += `Profile Completeness: ${student.profile_completeness}%\n`;
  context += `Status: ${student.status}\n\n`;

  // Academic info
  context += `=== ACADEMIC BACKGROUND ===\n`;
  if (student.academic_background_summary) {
    context += `Summary: ${student.academic_background_summary}\n`;
  }
  if (student.education_history && student.education_history.length > 0) {
    context += `Education:\n`;
    student.education_history.forEach(edu => {
      context += `- ${edu.level} from ${edu.institution} (${edu.graduation_year})\n`;
    });
  }
  if (student.english_proficiency?.has_test) {
    context += `English: ${student.english_proficiency.test_type} - ${student.english_proficiency.overall_score}\n`;
  }
  context += '\n';

  // Career and goals
  context += `=== CAREER & GOALS ===\n`;
  if (student.career_goals) {
    context += `Career Goals: ${student.career_goals}\n`;
  }
  if (student.preferred_fields && student.preferred_fields.length > 0) {
    context += `Preferred Fields: ${student.preferred_fields.join(', ')}\n`;
  }
  if (student.preferred_countries && student.preferred_countries.length > 0) {
    context += `Preferred Countries: ${student.preferred_countries.join(', ')}\n`;
  }
  if (student.preferred_degree_level) {
    context += `Preferred Level: ${student.preferred_degree_level}\n`;
  }
  context += '\n';

  // Application status
  context += `=== APPLICATIONS (${applications.length}) ===\n`;
  if (applications.length > 0) {
    applications.forEach(app => {
      context += `- Status: ${app.status}, Priority: ${app.priority}, Offer: ${app.offer_type || 'None'}\n`;
    });
  } else {
    context += 'No applications yet\n';
  }
  context += '\n';

  // Document status
  context += `=== DOCUMENTS ===\n`;
  if (documents.length > 0) {
    const pending = documents.filter(d => d.status === 'pending');
    const approved = documents.filter(d => d.status === 'approved');
    const rejected = documents.filter(d => d.status === 'rejected');
    context += `Total: ${documents.length} | Pending: ${pending.length} | Approved: ${approved.length} | Rejected: ${rejected.length}\n`;
    if (pending.length > 0) {
      context += `Pending: ${pending.map(d => d.document_type).join(', ')}\n`;
    }
  } else {
    context += 'No documents uploaded\n';
  }
  context += '\n';

  // Tasks
  context += `=== PENDING TASKS ===\n`;
  if (tasks.length > 0) {
    const pending = tasks.filter(t => t.status === 'pending');
    if (pending.length > 0) {
      pending.forEach(task => {
        context += `- ${task.title} (${task.priority} priority)\n`;
      });
    } else {
      context += 'No pending tasks\n';
    }
  } else {
    context += 'No tasks\n';
  }

  return context;
}