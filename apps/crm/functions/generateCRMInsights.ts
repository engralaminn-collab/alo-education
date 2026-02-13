import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { reportType, dateFrom, dateTo } = await req.json();

        // Fetch relevant data based on report type
        let insights = {};

        if (reportType === 'student_analytics' || reportType === 'all') {
            const students = await base44.asServiceRole.entities.StudentProfile.list();
            const applications = await base44.asServiceRole.entities.Application.list();

            const prompt = `Analyze this student data and provide actionable insights:

STUDENT DATA:
- Total Students: ${students.length}
- Status Distribution: ${JSON.stringify(students.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
}, {}))}
- Top Countries: ${JSON.stringify(students.reduce((acc, s) => {
    (s.preferred_countries || []).forEach(c => {
        acc[c] = (acc[c] || 0) + 1;
    });
    return acc;
}, {}))}
- Degree Levels: ${JSON.stringify(students.reduce((acc, s) => {
    acc[s.preferred_degree_level] = (acc[s.preferred_degree_level] || 0) + 1;
    return acc;
}, {}))}

APPLICATIONS:
- Total Applications: ${applications.length}
- Status Distribution: ${JSON.stringify(applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
}, {}))}
- Conversion Rate: ${((applications.filter(a => a.status === 'enrolled').length / students.length) * 100).toFixed(1)}%

Provide insights on:
1. Enrollment trends and patterns
2. Drop-off points in the student journey
3. High-performing segments
4. Areas needing attention
5. Actionable recommendations`;

            const studentInsights = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        key_trends: { type: 'array', items: { type: 'string' } },
                        drop_off_points: { type: 'array', items: { type: 'string' } },
                        high_performers: { type: 'array', items: { type: 'string' } },
                        areas_of_concern: { type: 'array', items: { type: 'string' } },
                        recommendations: { type: 'array', items: { type: 'string' } }
                    }
                }
            });

            insights.student_analytics = {
                ...studentInsights,
                metrics: {
                    total_students: students.length,
                    total_applications: applications.length,
                    conversion_rate: ((applications.filter(a => a.status === 'enrolled').length / students.length) * 100).toFixed(1),
                    avg_applications_per_student: (applications.length / students.length).toFixed(1)
                }
            };
        }

        if (reportType === 'counselor_performance' || reportType === 'all') {
            const counselors = await base44.asServiceRole.entities.Counselor.list();
            const students = await base44.asServiceRole.entities.StudentProfile.list();
            const applications = await base44.asServiceRole.entities.Application.list();
            const chats = await base44.asServiceRole.entities.WhatsAppConversation.list();

            const counselorStats = counselors.map(c => {
                const counselorStudents = students.filter(s => s.counselor_id === c.user_id);
                const counselorApps = applications.filter(a => 
                    counselorStudents.some(s => s.id === a.student_id)
                );
                const counselorChats = chats.filter(ch => ch.assigned_counselor_id === c.user_id);
                const slaViolations = counselorChats.filter(ch => ch.sla_violated);

                return {
                    name: c.name,
                    students: counselorStudents.length,
                    applications: counselorApps.length,
                    enrolled: counselorApps.filter(a => a.status === 'enrolled').length,
                    conversion_rate: counselorApps.length > 0 ? ((counselorApps.filter(a => a.status === 'enrolled').length / counselorApps.length) * 100).toFixed(1) : 0,
                    avg_response_time: counselorChats.length > 0 ? (counselorChats.reduce((sum, ch) => sum + (ch.response_time_minutes || 0), 0) / counselorChats.length).toFixed(0) : 0,
                    sla_violations: slaViolations.length,
                    sla_compliance: counselorChats.length > 0 ? (((counselorChats.length - slaViolations.length) / counselorChats.length) * 100).toFixed(1) : 100
                };
            });

            const prompt = `Analyze counselor performance data:

${JSON.stringify(counselorStats, null, 2)}

Provide insights on:
1. Top performers and what makes them successful
2. Areas where counselors need support
3. Response time patterns and SLA compliance
4. Workload distribution fairness
5. Training or process recommendations`;

            const counselorInsights = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        top_performers: { type: 'array', items: { type: 'string' } },
                        improvement_areas: { type: 'array', items: { type: 'string' } },
                        response_time_analysis: { type: 'string' },
                        workload_balance: { type: 'string' },
                        training_recommendations: { type: 'array', items: { type: 'string' } }
                    }
                }
            });

            insights.counselor_performance = {
                ...counselorInsights,
                counselor_stats: counselorStats
            };
        }

        if (reportType === 'outreach_success' || reportType === 'all') {
            const outreach = await base44.asServiceRole.entities.UniversityOutreach.list();
            const campaigns = await base44.asServiceRole.entities.OutreachCampaign.list();

            const outreachStats = {
                total_outreach: outreach.length,
                by_status: outreach.reduce((acc, o) => {
                    acc[o.status] = (acc[o.status] || 0) + 1;
                    return acc;
                }, {}),
                response_rate: outreach.length > 0 ? ((outreach.filter(o => o.status === 'responded').length / outreach.length) * 100).toFixed(1) : 0,
                by_type: outreach.reduce((acc, o) => {
                    acc[o.outreach_type] = (acc[o.outreach_type] || 0) + 1;
                    return acc;
                }, {}),
                campaigns: campaigns.map(c => ({
                    name: c.campaign_name,
                    type: c.scenario_type,
                    response_rate: c.response_rate,
                    is_active: c.is_active
                }))
            };

            const prompt = `Analyze university outreach performance:

${JSON.stringify(outreachStats, null, 2)}

Provide insights on:
1. Most effective outreach types
2. Response rate patterns
3. Campaign performance comparison
4. Timing and strategy recommendations
5. Partnership opportunities`;

            const outreachInsights = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        effective_strategies: { type: 'array', items: { type: 'string' } },
                        response_patterns: { type: 'string' },
                        campaign_analysis: { type: 'array', items: { type: 'string' } },
                        timing_recommendations: { type: 'string' },
                        partnership_opportunities: { type: 'array', items: { type: 'string' } }
                    }
                }
            });

            insights.outreach_success = {
                ...outreachInsights,
                metrics: outreachStats
            };
        }

        return Response.json({
            success: true,
            report_type: reportType,
            generated_at: new Date().toISOString(),
            insights
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});