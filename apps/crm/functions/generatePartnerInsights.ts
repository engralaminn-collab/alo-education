import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id } = await req.json();

    // Fetch partner data
    const [referrals, commissions, students] = await Promise.all([
      base44.entities.PartnerReferral.filter({ partner_id }),
      base44.entities.Commission.filter({ partner_id }),
      base44.entities.StudentProfile.list()
    ]);

    // Prepare analytics data
    const conversionByCountry = {};
    const conversionByProgram = {};
    const leadSourceBreakdown = {};
    
    referrals.forEach(ref => {
      const country = ref.lead_data?.country_of_interest || 'Unknown';
      const program = ref.lead_data?.program_title || 'Unknown';
      const source = ref.referral_source || 'Direct';
      
      conversionByCountry[country] = conversionByCountry[country] || { total: 0, converted: 0 };
      conversionByCountry[country].total++;
      if (ref.status === 'converted' || ref.status === 'enrolled') {
        conversionByCountry[country].converted++;
      }

      conversionByProgram[program] = conversionByProgram[program] || { total: 0, converted: 0 };
      conversionByProgram[program].total++;
      if (ref.status === 'converted' || ref.status === 'enrolled') {
        conversionByProgram[program].converted++;
      }

      leadSourceBreakdown[source] = (leadSourceBreakdown[source] || 0) + 1;
    });

    // Calculate trends
    const last30DaysReferrals = referrals.filter(r => {
      const createdDate = new Date(r.created_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    });

    const monthlyEarnings = commissions
      .filter(c => c.status === 'paid')
      .reduce((acc, c) => {
        const month = new Date(c.payment_date || c.created_date).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + c.amount;
        return acc;
      }, {});

    const avgMonthlyEarnings = Object.values(monthlyEarnings).reduce((a, b) => a + b, 0) / 
      (Object.keys(monthlyEarnings).length || 1);

    // Generate AI insights
    const prompt = `
Analyze this partner's referral performance and provide actionable insights:

Total Referrals: ${referrals.length}
Last 30 Days: ${last30DaysReferrals.length}
Conversion by Country: ${JSON.stringify(conversionByCountry)}
Conversion by Program: ${JSON.stringify(conversionByProgram)}
Lead Sources: ${JSON.stringify(leadSourceBreakdown)}
Average Monthly Earnings: $${avgMonthlyEarnings.toFixed(2)}

Provide:
1. Top 3 performance insights (what's working well)
2. Top 3 improvement opportunities
3. Best performing channels/countries/programs
4. 3-month earnings forecast based on trends
5. Recommended action items

Format as JSON with keys: insights, opportunities, best_performers, forecast, actions
`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          insights: { type: "array", items: { type: "string" } },
          opportunities: { type: "array", items: { type: "string" } },
          best_performers: {
            type: "object",
            properties: {
              country: { type: "string" },
              program: { type: "string" },
              source: { type: "string" }
            }
          },
          forecast: {
            type: "object",
            properties: {
              month1: { type: "number" },
              month2: { type: "number" },
              month3: { type: "number" }
            }
          },
          actions: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      analytics: {
        conversionByCountry,
        conversionByProgram,
        leadSourceBreakdown,
        trends: {
          last30Days: last30DaysReferrals.length,
          avgMonthlyEarnings
        }
      },
      insights: aiResponse
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});