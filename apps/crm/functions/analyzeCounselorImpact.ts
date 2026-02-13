import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all counselors and their data
    const counselors = await base44.asServiceRole.entities.User.filter({ role: 'admin' }); // Adjust role filter as needed
    const students = await base44.asServiceRole.entities.StudentProfile.list('-created_date', 1000);
    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 1000);
    const communications = await base44.asServiceRole.entities.CommunicationLog.list('-created_date', 2000);
    const inquiries = await base44.asServiceRole.entities.Inquiry.list('-created_date', 1000);

    // Calculate metrics per counselor
    const counselorMetrics = counselors.map(counselor => {
      const counselorStudents = students.filter(s => s.counselor_id === counselor.id);
      const counselorInquiries = inquiries.filter(i => i.assigned_to === counselor.id);
      const counselorComms = communications.filter(c => c.counselor_id === counselor.id);
      const counselorApps = applications.filter(app => 
        counselorStudents.some(s => s.id === app.student_id)
      );

      const successfulApps = counselorApps.filter(a => 
        ['unconditional_offer', 'enrolled'].includes(a.status)
      ).length;
      const successRate = counselorApps.length > 0 ? (successfulApps / counselorApps.length * 100) : 0;
      const conversionRate = counselorInquiries.length > 0 ? 
        (counselorStudents.length / counselorInquiries.length * 100) : 0;
      
      const avgResponseTime = counselorComms
        .filter(c => c.response_time_minutes)
        .reduce((sum, c) => sum + c.response_time_minutes, 0) / 
        Math.max(counselorComms.filter(c => c.response_time_minutes).length, 1);

      const positiveComms = counselorComms.filter(c => c.sentiment === 'positive').length;
      const totalSentiment = counselorComms.filter(c => c.sentiment).length;
      const sentimentScore = totalSentiment > 0 ? (positiveComms / totalSentiment * 100) : 0;

      return {
        counselor_id: counselor.id,
        name: counselor.full_name,
        students_count: counselorStudents.length,
        applications_count: counselorApps.length,
        success_rate: successRate,
        conversion_rate: conversionRate,
        avg_response_time: avgResponseTime,
        sentiment_score: sentimentScore,
        communications_count: counselorComms.length
      };
    }).filter(m => m.students_count > 0);

    // AI impact analysis
    const analysisPrompt = `
Analyze the correlation between counselor actions and student success rates.

Counselor Performance Data:
${counselorMetrics.map(m => `
- ${m.name}:
  Students: ${m.students_count}
  Success Rate: ${m.success_rate.toFixed(1)}%
  Conversion: ${m.conversion_rate.toFixed(1)}%
  Avg Response: ${m.avg_response_time.toFixed(1)} min
  Sentiment: ${m.sentiment_score.toFixed(1)}%
  Communications: ${m.communications_count}
`).join('\n')}

Analyze:
1. Which counselor actions correlate most with student success?
2. What patterns differentiate top performers?
3. How does response time impact outcomes?
4. Communication quality vs. quantity impact
5. Key success factors
`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          top_performers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                overall_score: { type: "number" },
                success_rate: { type: "number" },
                conversion_rate: { type: "number" },
                avg_response_time: { type: "number" },
                key_strengths: { type: "array", items: { type: "string" } }
              }
            }
          },
          impact_correlations: {
            type: "object",
            properties: {
              response_time_impact: { type: "string" },
              communication_frequency_impact: { type: "string" },
              sentiment_impact: { type: "string" },
              key_findings: { type: "array", items: { type: "string" } }
            }
          },
          success_factors: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Merge AI analysis with actual metrics
    const enrichedTopPerformers = analysis.top_performers.map(tp => {
      const metrics = counselorMetrics.find(m => m.name === tp.name);
      return { ...tp, ...metrics };
    });

    return Response.json({
      success: true,
      top_performers: enrichedTopPerformers,
      impact_correlations: analysis.impact_correlations,
      success_factors: analysis.success_factors,
      recommendations: analysis.recommendations
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});