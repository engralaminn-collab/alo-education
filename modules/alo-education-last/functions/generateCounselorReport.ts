import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { period = 'month' } = await req.json();

    // Call existing performance analysis
    const { data: analysis } = await base44.functions.invoke('analyzeCounselorPerformance', {});

    // Generate executive summary report
    const prompt = `Create an executive summary report for counselor team performance:

Analysis Data: ${JSON.stringify(analysis)}
Period: Last ${period}

Generate a comprehensive report with:
1. Executive Summary (key highlights)
2. Top Performers & Recognition
3. Team Strengths
4. Areas for Improvement
5. Actionable Recommendations
6. Training Needs
7. Resource Allocation Suggestions

Return as formatted markdown.`;

    const report = await base44.integrations.Core.InvokeLLM({
      prompt
    });

    return Response.json({
      report,
      period,
      generated_at: new Date().toISOString(),
      metrics_summary: analysis.overall_insights
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});