import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { student_id } = await req.json();

    // Fetch comprehensive student data
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    const applications = await base44.asServiceRole.entities.Application.filter({ student_id });
    const communications = await base44.asServiceRole.entities.Message.filter({ 
      recipient_id: student_id 
    });
    const tasks = await base44.asServiceRole.entities.Task.filter({ student_id });

    // Calculate days since last contact
    const lastContact = communications.length > 0 
      ? Math.floor((Date.now() - new Date(communications[0].created_date)) / (1000 * 60 * 60 * 24))
      : 999;

    // AI Outreach Generation Prompt
    const outreachPrompt = `
You are an expert education counselor AI. Generate personalized, empathetic outreach suggestions for this student.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Career Goals: ${student.career_goals || 'Not specified'}
- Profile Completeness: ${student.profile_completeness}%

Applications: ${applications.length} (${applications.filter(a => a.status === 'submitted_to_university').length} submitted)
Pending Tasks: ${tasks.filter(t => t.status === 'pending').length}
Days Since Last Contact: ${lastContact}

Interaction History:
${communications.slice(0, 3).map(c => `- ${c.created_date}: ${c.content.substring(0, 100)}`).join('\n')}

Generate 3 personalized outreach suggestions:
1. Email: Subject line + body (warm, professional, action-oriented)
2. SMS: Short, friendly message (160 chars max)
3. Call Script: Key talking points and questions to ask

Make it personal, reference their specific situation, and provide clear next steps.
    `;

    const aiSuggestions = await base44.integrations.Core.InvokeLLM({
      prompt: outreachPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          email: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" }
            }
          },
          sms: { type: "string" },
          call_script: {
            type: "object",
            properties: {
              opening: { type: "string" },
              talking_points: {
                type: "array",
                items: { type: "string" }
              },
              questions: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          best_time_to_contact: { type: "string" },
          urgency_level: { type: "string", enum: ["high", "medium", "low"] }
        }
      }
    });

    return Response.json({
      success: true,
      student: {
        name: `${student.first_name} ${student.last_name}`,
        status: student.status,
        days_since_contact: lastContact
      },
      suggestions: aiSuggestions
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});