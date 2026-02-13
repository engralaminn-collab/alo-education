import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metric_type } = await req.json();

    // Fetch historical data
    const students = await base44.asServiceRole.entities.StudentProfile.list('-created_date', 1000);
    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 1000);
    const inquiries = await base44.asServiceRole.entities.Inquiry.list('-created_date', 1000);
    const communications = await base44.asServiceRole.entities.CommunicationLog.list('-created_date', 2000);

    // Calculate time-series metrics
    const getMonthlyMetrics = (data, statusField = 'status') => {
      const monthly = {};
      data.forEach(item => {
        const month = new Date(item.created_date).toISOString().substring(0, 7);
        if (!monthly[month]) monthly[month] = { total: 0, byStatus: {} };
        monthly[month].total++;
        if (item[statusField]) {
          monthly[month].byStatus[item[statusField]] = (monthly[month].byStatus[item[statusField]] || 0) + 1;
        }
      });
      return monthly;
    };

    const monthlyApps = getMonthlyMetrics(applications);
    const monthlyInquiries = getMonthlyMetrics(inquiries);
    const monthlyStudents = getMonthlyMetrics(students);

    // Calculate success rates over time
    const monthlySuccessRates = {};
    Object.keys(monthlyApps).forEach(month => {
      const apps = applications.filter(a => a.created_date.startsWith(month));
      const successful = apps.filter(a => ['unconditional_offer', 'enrolled'].includes(a.status)).length;
      monthlySuccessRates[month] = apps.length > 0 ? (successful / apps.length * 100) : 0;
    });

    // AI anomaly detection
    const anomalyPrompt = `
Analyze these time-series metrics and identify anomalies, unusual patterns, or concerning trends.

Monthly Application Data (last 12 months):
${Object.entries(monthlyApps).slice(-12).map(([month, data]) => 
  `${month}: ${data.total} applications`
).join('\n')}

Monthly Success Rates:
${Object.entries(monthlySuccessRates).slice(-12).map(([month, rate]) => 
  `${month}: ${rate.toFixed(1)}%`
).join('\n')}

Monthly Inquiry Volume:
${Object.entries(monthlyInquiries).slice(-12).map(([month, data]) => 
  `${month}: ${data.total} inquiries`
).join('\n')}

Communication Patterns:
- Total communications: ${communications.length}
- Avg per month: ${(communications.length / 12).toFixed(0)}
- Sentiment distribution: ${communications.reduce((acc, c) => {
  if (c.sentiment) acc[c.sentiment] = (acc[c.sentiment] || 0) + 1;
  return acc;
}, {})}

Identify:
1. Statistical anomalies (unusual spikes or drops)
2. Trend changes (direction shifts)
3. Seasonal patterns broken
4. Success rate anomalies
5. Early warning indicators
6. Root cause hypotheses
`;

    const anomalies = await base44.integrations.Core.InvokeLLM({
      prompt: anomalyPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          detected_anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                anomaly_type: { 
                  type: "string", 
                  enum: ["spike", "drop", "trend_break", "pattern_change", "outlier"] 
                },
                metric: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                time_period: { type: "string" },
                description: { type: "string" },
                baseline_value: { type: "number" },
                actual_value: { type: "number" },
                deviation_percentage: { type: "number" },
                possible_causes: { type: "array", items: { type: "string" } },
                recommended_actions: { type: "array", items: { type: "string" } }
              }
            }
          },
          trend_analysis: {
            type: "object",
            properties: {
              application_trend: { type: "string", enum: ["increasing", "stable", "decreasing"] },
              success_rate_trend: { type: "string", enum: ["improving", "stable", "declining"] },
              inquiry_trend: { type: "string", enum: ["growing", "stable", "shrinking"] }
            }
          },
          early_warnings: { type: "array", items: { type: "string" } },
          seasonal_insights: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      anomalies,
      data_analyzed: {
        applications: applications.length,
        students: students.length,
        inquiries: inquiries.length,
        time_range: '12 months'
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});