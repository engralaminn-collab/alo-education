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

    // Calculate metrics per counselor
    const counselorMetrics = allCounselors.map(c => {
      const counselorInquiries = inquiries.filter(i => i.assigned_to === c.id);
      const counselorTasks = tasks.filter(t => t.assigned_to === c.id);
      const counselorStudents = students.filter(s => s.counselor_id === c.id);

      const convertedLeads = counselorInquiries.filter(i => i.status === 'converted').length;
      const completedTasks = counselorTasks.filter(t => t.status === 'completed').length;
      const avgResponseTime = counselorInquiries
        .filter(i => i.response_time_minutes)
        .reduce((sum, i) => sum + i.response_time_minutes, 0) / 
        (counselorInquiries.filter(i => i.response_time_minutes).length || 1);

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
        active_students: counselorStudents.length
      };
    });

    // AI Performance Analysis
    const analysisPrompt = `
You are an expert performance analyst AI. Analyze counselor performance data and provide insights.

Counselor Metrics:
${JSON.stringify(counselorMetrics, null, 2)}

${counselor_id ? `Focus on counselor: ${counselor.name}` : 'Analyze all counselors'}

Provide:
1. Top 3 performing counselors with reasons
2. Areas for improvement per counselor
3. Actionable recommendations
4. Performance trends and patterns
5. Best practices from top performers
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
                strengths: {
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
                areas: {
                  type: "array",
                  items: { type: "string" }
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          best_practices: {
            type: "array",
            items: { type: "string" }
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