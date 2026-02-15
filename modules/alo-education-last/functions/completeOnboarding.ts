import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, responses } = await req.json();

    const student = await base44.entities.StudentProfile.get(student_id);

    // Generate AI recommendations
    const prompt = `Analyze student onboarding responses and provide recommendations:

Student: ${student.first_name} ${student.last_name}
Responses: ${JSON.stringify(responses)}

Provide:
1. Top 3 recommended countries
2. Top 5 recommended programs/courses
3. Suggested universities
4. Financial aid recommendations
5. Next steps for the student
6. Priority tasks for assigned counselor

Return as JSON.`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_countries: {
            type: "array",
            items: { type: "string" }
          },
          recommended_programs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                program: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          recommended_universities: {
            type: "array",
            items: { type: "string" }
          },
          financial_aid_options: {
            type: "array",
            items: { type: "string" }
          },
          next_steps: {
            type: "array",
            items: { type: "string" }
          },
          counselor_tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                priority: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Update onboarding session
    await base44.entities.OnboardingSession.update(student_id, {
      status: 'completed',
      ai_recommendations: [recommendations],
      completed_at: new Date().toISOString(),
      completion_percentage: 100
    });

    // Send welcome email
    await base44.integrations.Core.SendEmail({
      to: student.email,
      subject: `Welcome to ALO Education, ${student.first_name}!`,
      body: `Dear ${student.first_name},

Thank you for completing your onboarding! Based on your responses, we've created a personalized study plan for you.

Your Top Recommendations:
${recommendations.recommended_programs.slice(0, 3).map(p => `- ${p.program}`).join('\n')}

Your counselor will contact you within 24 hours to discuss your options.

Best regards,
ALO Education Team`
    });

    // Create initial counselor tasks
    if (recommendations.counselor_tasks?.length > 0) {
      for (const task of recommendations.counselor_tasks.slice(0, 5)) {
        await base44.entities.Task.create({
          title: task.task,
          description: `Onboarding follow-up for ${student.first_name} ${student.last_name}`,
          student_id,
          priority: task.priority || 'medium',
          status: 'pending',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    return Response.json({
      success: true,
      recommendations,
      welcome_email_sent: true,
      tasks_created: recommendations.counselor_tasks?.length || 0
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});