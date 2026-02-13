import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prediction_type } = await req.json();

    // Fetch historical data
    const students = await base44.asServiceRole.entities.StudentProfile.list('-created_date', 1000);
    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 1000);
    const inquiries = await base44.asServiceRole.entities.Inquiry.list('-created_date', 1000);
    const communications = await base44.asServiceRole.entities.CommunicationLog.list('-created_date', 2000);

    let predictions = {};

    if (prediction_type === 'success_rates') {
      // Calculate historical success patterns
      const successByProfile = {};
      
      students.forEach(student => {
        const studentApps = applications.filter(a => a.student_id === student.id);
        const successfulApps = studentApps.filter(a => 
          ['unconditional_offer', 'enrolled'].includes(a.status)
        ).length;
        
        const profileKey = `${student.preferred_degree_level}_${student.preferred_countries?.[0] || 'unknown'}`;
        
        if (!successByProfile[profileKey]) {
          successByProfile[profileKey] = { total: 0, successful: 0 };
        }
        successByProfile[profileKey].total += studentApps.length;
        successByProfile[profileKey].successful += successfulApps;
      });

      const predictPrompt = `
Analyze student success patterns and predict future outcomes:

Historical Success Data:
${Object.entries(successByProfile).map(([profile, data]) => 
  `${profile}: ${data.successful}/${data.total} (${(data.successful/data.total*100).toFixed(1)}%)`
).join('\n')}

Total Students Analyzed: ${students.length}
Total Applications: ${applications.length}
Overall Success Rate: ${(applications.filter(a => ['unconditional_offer', 'enrolled'].includes(a.status)).length / applications.length * 100).toFixed(1)}%

Recent Trends:
- New leads last 30 days: ${inquiries.filter(i => {
  const daysAgo = (Date.now() - new Date(i.created_date).getTime()) / (1000 * 60 * 60 * 24);
  return daysAgo <= 30;
}).length}
- Applications last 30 days: ${applications.filter(a => {
  const daysAgo = (Date.now() - new Date(a.created_date || a.created_date).getTime()) / (1000 * 60 * 60 * 24);
  return daysAgo <= 30;
}).length}

Predict:
1. Success rate trends for next quarter
2. High-performing student profiles
3. Risk factors affecting success
4. Factors that increase success probability
5. Recommendations to improve outcomes
`;

      predictions = await base44.integrations.Core.InvokeLLM({
        prompt: predictPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_success_rate: { type: "number" },
            trend_direction: { type: "string", enum: ["increasing", "stable", "decreasing"] },
            high_success_profiles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  profile_type: { type: "string" },
                  predicted_rate: { type: "number" },
                  factors: { type: "array", items: { type: "string" } }
                }
              }
            },
            risk_factors: { type: "array", items: { type: "string" } },
            success_drivers: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    }

    if (prediction_type === 'enrollment_forecast') {
      // Calculate historical enrollment patterns
      const monthlyEnrollments = {};
      
      applications.filter(a => a.status === 'enrolled').forEach(app => {
        const month = new Date(app.created_date).toISOString().substring(0, 7);
        monthlyEnrollments[month] = (monthlyEnrollments[month] || 0) + 1;
      });

      const forecastPrompt = `
Forecast future enrollment trends based on historical data:

Monthly Enrollment History (last 12 months):
${Object.entries(monthlyEnrollments).slice(-12).map(([month, count]) => 
  `${month}: ${count} enrollments`
).join('\n')}

Pipeline Data:
- Active leads: ${inquiries.filter(i => !['converted', 'lost'].includes(i.status)).length}
- Applications in progress: ${applications.filter(a => !['enrolled', 'rejected', 'withdrawn'].includes(a.status)).length}
- Pending offers: ${applications.filter(a => ['conditional_offer', 'unconditional_offer'].includes(a.status)).length}

Communication Engagement:
- Total communications: ${communications.length}
- Positive sentiment: ${communications.filter(c => c.sentiment === 'positive').length}

Forecast:
1. Next 3 months enrollment predictions
2. Peak enrollment periods
3. Growth trajectory
4. Conversion funnel projections
5. Capacity recommendations
`;

      predictions = await base44.integrations.Core.InvokeLLM({
        prompt: forecastPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            next_quarter_forecast: {
              type: "object",
              properties: {
                month_1: { type: "number" },
                month_2: { type: "number" },
                month_3: { type: "number" },
                confidence_level: { type: "string" }
              }
            },
            growth_rate: { type: "number" },
            peak_periods: { type: "array", items: { type: "string" } },
            pipeline_health: { type: "string" },
            bottlenecks: { type: "array", items: { type: "string" } },
            capacity_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    }

    return Response.json({
      success: true,
      prediction_type,
      predictions,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});