import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { query } = await req.json();

    // Fetch comprehensive CRM data
    const inquiries = await base44.asServiceRole.entities.Inquiry.list('-created_date', 1000);
    const students = await base44.asServiceRole.entities.StudentProfile.list('-created_date', 1000);
    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 1000);

    // Prepare data summary for AI
    const dataSummary = {
      total_inquiries: inquiries.length,
      inquiries_by_status: groupBy(inquiries, 'status'),
      inquiries_by_source: groupBy(inquiries, 'source'),
      inquiries_by_country: groupBy(inquiries, 'country_of_interest'),
      conversion_rate: ((inquiries.filter(i => i.status === 'converted').length / inquiries.length) * 100).toFixed(2),
      avg_response_time: calculateAvgResponseTime(inquiries),
      total_students: students.length,
      students_by_status: groupBy(students, 'status'),
      total_applications: applications.length,
      applications_by_status: groupBy(applications, 'status'),
      recent_trends: analyzeRecentTrends(inquiries, students, applications)
    };

    // AI-powered analytics with natural language query
    const analyticsPrompt = `
You are an expert CRM analytics AI. Analyze this education CRM data and answer the user's query.

User Query: "${query}"

CRM Data Summary:
${JSON.stringify(dataSummary, null, 2)}

Recent Inquiries Sample: ${JSON.stringify(inquiries.slice(0, 20))}

Provide:
1. Direct answer to the query
2. Key insights and patterns
3. Predictive analytics (conversion predictions, trend forecasts)
4. Anomalies or concerns detected
5. Actionable recommendations
6. Relevant metrics and statistics

Be specific with numbers, percentages, and trends. Format your response clearly.
    `;

    const aiInsights = await base44.integrations.Core.InvokeLLM({
      prompt: analyticsPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          key_insights: {
            type: "array",
            items: { type: "string" }
          },
          predictions: {
            type: "object",
            properties: {
              next_month_conversion_rate: { type: "number" },
              expected_new_leads: { type: "number" },
              high_risk_students: { type: "number" }
            }
          },
          anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                description: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high"] }
              }
            }
          },
          recommendations: {
            type: "array",
            items: { type: "string" }
          },
          metrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                value: { type: "string" },
                trend: { type: "string", enum: ["up", "down", "stable"] }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      query,
      insights: aiInsights,
      data_summary: dataSummary,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const group = item[key] || 'Unknown';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});
}

function calculateAvgResponseTime(inquiries) {
  const withResponseTime = inquiries.filter(i => i.response_time_minutes);
  if (withResponseTime.length === 0) return 0;
  const sum = withResponseTime.reduce((acc, i) => acc + i.response_time_minutes, 0);
  return Math.round(sum / withResponseTime.length);
}

function analyzeRecentTrends(inquiries, students, applications) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  
  const recentInquiries = inquiries.filter(i => new Date(i.created_date) > thirtyDaysAgo);
  const recentStudents = students.filter(s => new Date(s.created_date) > thirtyDaysAgo);
  
  return {
    new_inquiries_last_30_days: recentInquiries.length,
    new_students_last_30_days: recentStudents.length,
    hot_leads_percentage: ((recentInquiries.filter(i => i.qualification_status === 'hot').length / recentInquiries.length) * 100).toFixed(1)
  };
}