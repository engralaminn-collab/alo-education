import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // This runs as scheduled task, use service role
        const payload = await req.json();
        const { scheduledReportId } = payload;

        if (!scheduledReportId) {
            return Response.json({ error: 'No report ID provided' }, { status: 400 });
        }

        const scheduledReport = await base44.asServiceRole.entities.ScheduledReport.get(scheduledReportId);

        if (!scheduledReport.is_active) {
            return Response.json({ message: 'Report is inactive, skipping' });
        }

        // Generate the insights
        const insightsResponse = await base44.asServiceRole.functions.invoke('generateCRMInsights', {
            reportType: scheduledReport.report_type,
            dateFrom: null,
            dateTo: null
        });

        const insights = insightsResponse.data.insights;

        // Format email body
        let emailBody = `<h1>${scheduledReport.report_name}</h1>`;
        emailBody += `<p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>`;
        emailBody += `<p><strong>Report Type:</strong> ${scheduledReport.report_type}</p>`;
        emailBody += '<hr>';

        if (insights.student_analytics) {
            emailBody += '<h2>📊 Student Analytics</h2>';
            emailBody += `<p><strong>Total Students:</strong> ${insights.student_analytics.metrics.total_students}</p>`;
            emailBody += `<p><strong>Conversion Rate:</strong> ${insights.student_analytics.metrics.conversion_rate}%</p>`;
            emailBody += '<h3>Key Recommendations:</h3><ul>';
            insights.student_analytics.recommendations?.forEach(r => {
                emailBody += `<li>${r}</li>`;
            });
            emailBody += '</ul>';
        }

        if (insights.counselor_performance) {
            emailBody += '<h2>👥 Counselor Performance</h2>';
            emailBody += '<h3>Top Performers:</h3><ul>';
            insights.counselor_performance.top_performers?.forEach(p => {
                emailBody += `<li>${p}</li>`;
            });
            emailBody += '</ul>';
        }

        if (insights.outreach_success) {
            emailBody += '<h2>📧 Outreach Success</h2>';
            emailBody += `<p><strong>Response Rate:</strong> ${insights.outreach_success.metrics.response_rate}%</p>`;
            emailBody += '<h3>Effective Strategies:</h3><ul>';
            insights.outreach_success.effective_strategies?.forEach(s => {
                emailBody += `<li>${s}</li>`;
            });
            emailBody += '</ul>';
        }

        // Send to recipients
        for (const recipient of scheduledReport.recipients) {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: recipient,
                subject: `${scheduledReport.report_name} - ${new Date().toLocaleDateString()}`,
                body: emailBody
            });
        }

        // Update last generated
        await base44.asServiceRole.entities.ScheduledReport.update(scheduledReportId, {
            last_generated: new Date().toISOString()
        });

        return Response.json({
            success: true,
            message: `Report sent to ${scheduledReport.recipients.length} recipients`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});