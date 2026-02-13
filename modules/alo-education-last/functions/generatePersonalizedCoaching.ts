import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { counselor_id } = await req.json();
    const targetCounselorId = counselor_id || user.id;

    // Fetch counselor performance data
    const counselor = await base44.asServiceRole.entities.User.get(targetCounselorId);
    const students = await base44.asServiceRole.entities.StudentProfile.filter({ counselor_id: targetCounselorId });
    const inquiries = await base44.asServiceRole.entities.Inquiry.filter({ assigned_to: targetCounselorId });
    const communications = await base44.asServiceRole.entities.CommunicationLog.filter({ 
      counselor_id: targetCounselorId 
    }, '-created_date', 200);
    const tasks = await base44.asServiceRole.entities.Task.filter({ assigned_to: targetCounselorId });
    const applications = await base44.asServiceRole.entities.Application.filter({}, '-created_date', 500);
    
    // Filter applications for this counselor's students
    const counselorApplications = applications.filter(app => 
      students.some(s => s.id === app.student_id)
    );

    // Calculate performance metrics
    const conversionRate = inquiries.length > 0 ? (students.length / inquiries.length * 100) : 0;
    const avgResponseTime = communications
      .filter(c => c.response_time_minutes)
      .reduce((sum, c) => sum + c.response_time_minutes, 0) / 
      Math.max(communications.filter(c => c.response_time_minutes).length, 1);
    
    const taskCompletionRate = tasks.length > 0 ? 
      (tasks.filter(t => t.status === 'completed').length / tasks.length * 100) : 0;
    
    const successRate = counselorApplications.length > 0 ?
      (counselorApplications.filter(a => ['unconditional_offer', 'enrolled'].includes(a.status)).length / 
       counselorApplications.length * 100) : 0;

    const negativeSentiment = communications.filter(c => c.sentiment === 'negative').length;
    const totalSentiment = communications.filter(c => c.sentiment).length;
    const sentimentScore = totalSentiment > 0 ? 
      ((totalSentiment - negativeSentiment) / totalSentiment * 100) : 50;

    // AI coaching analysis
    const coachingPrompt = `
You are an expert counselor coach and performance analyst. Analyze this counselor's performance data and provide personalized coaching recommendations.

Counselor: ${counselor.full_name}
Role: Education Counselor
Time in Role: [Calculate from created_date]

Performance Metrics:
- Lead Conversion Rate: ${conversionRate.toFixed(1)}% (${students.length}/${inquiries.length})
- Application Success Rate: ${successRate.toFixed(1)}%
- Average Response Time: ${avgResponseTime.toFixed(1)} minutes
- Task Completion Rate: ${taskCompletionRate.toFixed(1)}%
- Communication Sentiment: ${sentimentScore.toFixed(1)}% positive
- Active Students: ${students.length}
- Total Communications: ${communications.length}

Recent Communication Patterns:
- Channels used: ${communications.reduce((acc, c) => {
  acc[c.channel] = (acc[c.channel] || 0) + 1;
  return acc;
}, {})}
- Topics discussed: ${communications.flatMap(c => c.key_topics || []).slice(0, 20).join(', ')}

Student Status Distribution:
${students.reduce((acc, s) => {
  acc[s.status] = (acc[s.status] || 0) + 1;
  return acc;
}, {})}

Identify:
1. Key strengths and what's working well
2. Specific skill gaps and areas needing improvement
3. Performance compared to benchmarks (conversion >30%, success >60%, response <2hrs)
4. Root causes of any performance issues
5. Personalized coaching exercises
6. Training module recommendations
7. Short-term and long-term development goals
8. Actionable daily practices to improve
`;

    const coaching = await base44.integrations.Core.InvokeLLM({
      prompt: coachingPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          performance_summary: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          skill_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high"] },
                impact: { type: "string" },
                current_level: { type: "string" },
                target_level: { type: "string" }
              }
            }
          },
          coaching_exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                focus_area: { type: "string" },
                description: { type: "string" },
                duration_minutes: { type: "number" },
                difficulty: { type: "string", enum: ["easy", "moderate", "challenging"] },
                expected_outcome: { type: "string" },
                steps: { type: "array", items: { type: "string" } }
              }
            }
          },
          training_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_name: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                reason: { type: "string" },
                expected_improvement: { type: "string" }
              }
            }
          },
          daily_practices: { type: "array", items: { type: "string" } },
          short_term_goals: { type: "array", items: { type: "string" } },
          long_term_goals: { type: "array", items: { type: "string" } },
          benchmark_comparison: { type: "string" },
          improvement_timeline: { type: "string" }
        }
      }
    });

    // Save coaching recommendations
    await base44.asServiceRole.entities.CounselorInteraction?.create({
      counselor_id: targetCounselorId,
      interaction_type: 'ai_coaching',
      interaction_data: coaching,
      metrics: {
        conversion_rate: conversionRate,
        success_rate: successRate,
        avg_response_time: avgResponseTime,
        task_completion_rate: taskCompletionRate,
        sentiment_score: sentimentScore
      },
      created_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      coaching,
      metrics: {
        conversion_rate: conversionRate.toFixed(1),
        success_rate: successRate.toFixed(1),
        avg_response_time: avgResponseTime.toFixed(1),
        task_completion_rate: taskCompletionRate.toFixed(1),
        sentiment_score: sentimentScore.toFixed(1)
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});