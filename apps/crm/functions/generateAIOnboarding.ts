import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { student_id } = await req.json();

    // Fetch student profile
    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);

    // Build AI prompt for personalized onboarding
    const prompt = `
You are an expert education counselor creating a warm, personalized onboarding experience for a new student.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Career Goals: ${student.career_goals || 'Not specified'}
- Profile Completeness: ${student.profile_completeness || 0}%

Create a personalized onboarding experience with:

1. Welcome Message: A warm, encouraging welcome message that acknowledges their specific interests and goals (2-3 sentences)

2. Profile Insights: 3-4 key insights about their profile and what opportunities await them based on their preferences

3. Course Recommendations: Suggest 3-4 specific programs/courses that match their profile, including:
   - Program name
   - University (can be general or specific based on their preferences)
   - Why it's a good match
   - Match score (0-100)

4. Essential Tasks: 5-6 actionable first steps they should take, prioritized by importance:
   - Complete profile sections that are missing
   - Upload required documents
   - Schedule counselor consultation
   - Explore scholarship opportunities
   - Research visa requirements
   - Connect with alumni/current students

Make it encouraging, actionable, and personalized to their specific situation.
    `;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          welcome_message: { type: "string" },
          profile_insights: {
            type: "array",
            items: { type: "string" }
          },
          course_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                program: { type: "string" },
                university: { type: "string" },
                reason: { type: "string" },
                match_score: { type: "number" }
              }
            }
          },
          essential_tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          }
        }
      }
    });

    // Create onboarding tasks in the system
    const tasks = aiResponse.essential_tasks?.slice(0, 5).map(task => ({
      student_id,
      title: task.title,
      description: task.description,
      status: 'pending',
      priority: task.priority || 'medium',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    }));

    if (tasks?.length > 0) {
      await base44.asServiceRole.entities.Task.bulkCreate(tasks);
    }

    // Send welcome email
    await base44.integrations.Core.SendEmail({
      to: student.email,
      subject: `Welcome to ALO Education, ${student.first_name}! 🎓`,
      body: `
        <h2>Welcome ${student.first_name}!</h2>
        <p>${aiResponse.welcome_message}</p>
        
        <h3>Your Next Steps:</h3>
        <ul>
          ${aiResponse.essential_tasks?.slice(0, 3).map(t => `<li><strong>${t.title}</strong>: ${t.description}</li>`).join('')}
        </ul>
        
        <p>Log in to your dashboard to explore personalized course recommendations and connect with your dedicated counselor.</p>
        
        <p>We're excited to be part of your education journey!</p>
        
        <p>Best regards,<br>ALO Education Team</p>
      `
    });

    return Response.json({
      success: true,
      ...aiResponse
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});