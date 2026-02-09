import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { counselor_id, date_range } = await req.json();

    // Fetch counselor data
    const counselor = counselor_id ? 
      await base44.asServiceRole.entities.Counselor.get(counselor_id) : null;

    // Fetch all counselors for comparison
    const allCounselors = await base44.asServiceRole.entities.Counselor.filter({ status: 'active' });

    // Fetch performance data
    const inquiries = await base44.asServiceRole.entities.Inquiry.list('-created_date', 500);
    const tasks = await base44.asServiceRole.entities.Task.list('-created_date', 1000);
    const students = await base44.asServiceRole.entities.StudentProfile.list('-created_date', 500);
    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 500);
    const communications = await base44.asServiceRole.entities.CommunicationLog.list('-created_date', 1000);
    const feedback = await base44.asServiceRole.entities.Feedback?.list('-created_date', 200) || [];

    // Calculate metrics per counselor
    const counselorMetrics = allCounselors.map(c => {
      const counselorInquiries = inquiries.filter(i => i.assigned_to === c.id);
      const counselorTasks = tasks.filter(t => t.assigned_to === c.id);
      const counselorStudents = students.filter(s => s.counselor_id === c.id);
      const counselorApplications = applications.filter(a => {
        const student = students.find(s => s.id === a.student_id);
        return student?.counselor_id === c.id;
      });
      const counselorComms = communications.filter(co => co.counselor_id === c.id);
      const counselorFeedback = feedback.filter(f => f.counselor_id === c.id);

      const convertedLeads = counselorInquiries.filter(i => i.status === 'converted').length;
      const completedTasks = counselorTasks.filter(t => t.status === 'completed').length;
      const avgResponseTime = counselorInquiries
        .filter(i => i.response_time_minutes)
        .reduce((sum, i) => sum + i.response_time_minutes, 0) / 
        (counselorInquiries.filter(i => i.response_time_minutes).length || 1);

      // Application success metrics
      const submittedApps = counselorApplications.filter(a => 
        ['submitted_to_university', 'conditional_offer', 'unconditional_offer', 'enrolled'].includes(a.status)
      ).length;
      const offersReceived = counselorApplications.filter(a => 
        ['conditional_offer', 'unconditional_offer', 'enrolled'].includes(a.status)
      ).length;
      const applicationSuccessRate = submittedApps > 0 ? 
        (offersReceived / submittedApps * 100).toFixed(1) : 0;

      // Communication effectiveness
      const positiveComms = counselorComms.filter(c => c.sentiment === 'positive').length;
      const totalSentimentComms = counselorComms.filter(c => c.sentiment).length;
      const positiveSentimentRate = totalSentimentComms > 0 ? 
        (positiveComms / totalSentimentComms * 100).toFixed(1) : 0;

      // Student satisfaction
      const avgSatisfaction = counselorFeedback.length > 0 ?
        (counselorFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / counselorFeedback.length).toFixed(1) : 0;

      // Engagement metrics
      const avgCommsPerStudent = counselorStudents.length > 0 ?
        (counselorComms.length / counselorStudents.length).toFixed(1) : 0;

      return {
        counselor_id: c.id,
        counselor_name: c.name,
        total_leads: counselorInquiries.length,
        converted_leads: convertedLeads,
        conversion_rate: counselorInquiries.length > 0 ? 
          (convertedLeads / counselorInquiries.length * 100).toFixed(1) : 0,
        avg_response_time: Math.round(avgResponseTime),
        total_tasks: counselorTasks.length,
        completed_tasks: completedTasks,
        task_completion_rate: counselorTasks.length > 0 ? 
          (completedTasks / counselorTasks.length * 100).toFixed(1) : 0,
        active_students: counselorStudents.length,
        total_applications: counselorApplications.length,
        application_success_rate: applicationSuccessRate,
        offers_received: offersReceived,
        total_communications: counselorComms.length,
        positive_sentiment_rate: positiveSentimentRate,
        avg_satisfaction_rating: avgSatisfaction,
        total_feedback: counselorFeedback.length,
        avg_comms_per_student: avgCommsPerStudent
      };
    });

    // AI Performance Analysis
    const analysisPrompt = `
You are an expert performance analyst and coaching specialist for education counselors. Analyze comprehensive counselor performance data and provide actionable insights.

Counselor Performance Metrics:
${JSON.stringify(counselorMetrics, null, 2)}

${counselor_id ? `Focus on counselor: ${counselor.name}` : 'Analyze all counselors and identify patterns'}

Provide comprehensive analysis including:

1. **Top Performers Identification** (top 3):
   - Identify counselors excelling in conversion rate, student satisfaction, application success
   - Specific strengths and what makes them effective
   - Key behaviors driving their success

2. **Areas for Improvement** (for each counselor performing below benchmarks):
   - Specific metrics that need attention (conversion, response time, satisfaction)
   - Root causes based on data patterns
   - Actionable coaching recommendations tailored to their weaknesses

3. **Student Satisfaction Analysis**:
   - Counselors with highest satisfaction ratings
   - Correlation between satisfaction and other metrics
   - Recommendations to improve student experience

4. **Coaching Recommendations** (prioritized by impact):
   - Specific, actionable steps for each counselor
   - Training focus areas based on data
   - Best practices to implement from top performers

5. **Performance Trends**:
   - Identify patterns across all counselors
   - Benchmark metrics for the team
   - Red flags requiring immediate attention

6. **Best Practices**:
   - Extract proven strategies from top performers
   - Communication patterns that drive engagement
   - Time management and task completion strategies

Be specific, data-driven, and provide actionable insights that managers can use for coaching.
    `;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          top_performers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                counselor_name: { type: "string" },
                rank: { type: "number" },
                overall_score: { type: "number" },
                strengths: {
                  type: "array",
                  items: { type: "string" }
                },
                key_behaviors: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          improvement_areas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                counselor_name: { type: "string" },
                priority_level: { type: "string", enum: ["high", "medium", "low"] },
                areas: {
                  type: "array",
                  items: { type: "string" }
                },
                coaching_recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      focus_area: { type: "string" },
                      specific_action: { type: "string" },
                      expected_impact: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          satisfaction_insights: {
            type: "object",
            properties: {
              highest_rated: {
                type: "array",
                items: { type: "string" }
              },
              satisfaction_drivers: {
                type: "array",
                items: { type: "string" }
              },
              improvement_tips: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          team_benchmarks: {
            type: "object",
            properties: {
              avg_conversion_rate: { type: "number" },
              avg_response_time: { type: "number" },
              avg_satisfaction: { type: "number" },
              top_quartile_threshold: { type: "number" }
            }
          },
          red_flags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                counselor_name: { type: "string" },
                issue: { type: "string" },
                severity: { type: "string", enum: ["critical", "high", "medium"] },
                immediate_action: { type: "string" }
              }
            }
          },
          best_practices: {
            type: "array",
            items: {
              type: "object",
              properties: {
                practice: { type: "string" },
                source: { type: "string" },
                impact: { type: "string" }
              }
            }
          },
          overall_insights: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      metrics: counselorMetrics,
      analysis: aiAnalysis
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});