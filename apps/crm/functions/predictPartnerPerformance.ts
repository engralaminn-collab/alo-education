import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id } = await req.json();

    // Get partner data
    const referrals = await base44.asServiceRole.entities.PartnerReferral.filter({ partner_id });
    const students = await base44.asServiceRole.entities.StudentProfile.filter({});
    const commissions = await base44.asServiceRole.entities.Commission.filter({ partner_id });

    // Calculate current metrics
    const totalReferrals = referrals.length;
    const conversions = referrals.filter(r => r.status === 'enrolled').length;
    const conversionRate = totalReferrals > 0 ? (conversions / totalReferrals) * 100 : 0;
    
    const totalEarnings = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const avgEarningsPerConversion = conversions > 0 ? totalEarnings / conversions : 0;

    // Get recent trend (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentReferrals = referrals.filter(r => new Date(r.created_date) >= threeMonthsAgo);
    const recentConversions = recentReferrals.filter(r => r.status === 'enrolled').length;
    const recentConversionRate = recentReferrals.length > 0 ? (recentConversions / recentReferrals.length) * 100 : 0;

    // AI-powered predictions
    const prompt = `
Analyze partner performance and provide predictions:

Current Metrics:
- Total Referrals: ${totalReferrals}
- Conversions: ${conversions}
- Conversion Rate: ${conversionRate.toFixed(1)}%
- Total Earnings: $${totalEarnings}
- Avg per Conversion: $${avgEarningsPerConversion.toFixed(2)}
- Recent 3M Conversion Rate: ${recentConversionRate.toFixed(1)}%

Provide predictions for next 3 months:
1. Expected conversion rate trend (improving/stable/declining with %)
2. Forecasted earnings (low, mid, high estimates)
3. Expected number of conversions
4. Ideal student profile (demographics, fields, countries based on past success)
5. Performance vs industry benchmarks (above/at/below average)
6. Recommended actions to improve (3-4 specific suggestions)

Return detailed JSON with predictions and recommendations.
`;

    const predictions = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          conversion_forecast: {
            type: "object",
            properties: {
              trend: { type: "string" },
              expected_rate: { type: "number" },
              confidence: { type: "string" }
            }
          },
          earnings_forecast: {
            type: "object",
            properties: {
              low_estimate: { type: "number" },
              mid_estimate: { type: "number" },
              high_estimate: { type: "number" },
              basis: { type: "string" }
            }
          },
          expected_conversions: { type: "number" },
          ideal_student_profile: {
            type: "object",
            properties: {
              demographics: { type: "string" },
              preferred_fields: {
                type: "array",
                items: { type: "string" }
              },
              target_countries: {
                type: "array",
                items: { type: "string" }
              },
              budget_range: { type: "string" }
            }
          },
          benchmark_comparison: {
            type: "object",
            properties: {
              performance_level: { type: "string" },
              percentile: { type: "number" },
              analysis: { type: "string" }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                expected_impact: { type: "string" },
                priority: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      current_metrics: {
        total_referrals: totalReferrals,
        conversions,
        conversion_rate: conversionRate,
        total_earnings: totalEarnings,
        avg_per_conversion: avgEarningsPerConversion
      },
      predictions
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});