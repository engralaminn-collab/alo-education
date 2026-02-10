import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_type, filters, date_range } = await req.json();

    // Fetch all relevant data
    const students = await base44.asServiceRole.entities.StudentProfile.list('-created_date', 1000);
    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 1000);
    const inquiries = await base44.asServiceRole.entities.Inquiry.list('-created_date', 1000);
    const courses = await base44.asServiceRole.entities.Course.list('-created_date', 500);
    const counselors = await base44.asServiceRole.entities.Counselor.filter({ status: 'active' });
    const communications = await base44.asServiceRole.entities.CommunicationLog.list('-created_date', 2000);

    // Apply filters
    const filterData = (data) => {
      if (!filters) return data;
      
      let filtered = data;
      if (filters.country) {
        filtered = filtered.filter(d => d.country === filters.country || d.preferred_countries?.includes(filters.country));
      }
      if (filters.status) {
        filtered = filtered.filter(d => d.status === filters.status);
      }
      if (filters.counselor_id) {
        filtered = filtered.filter(d => d.counselor_id === filters.counselor_id || d.assigned_to === filters.counselor_id);
      }
      if (date_range?.start && date_range?.end) {
        filtered = filtered.filter(d => {
          const date = new Date(d.created_date);
          return date >= new Date(date_range.start) && date <= new Date(date_range.end);
        });
      }
      return filtered;
    };

    let reportData = {};

    // Generate report based on type
    if (report_type === 'student_cohort') {
      const filteredStudents = filterData(students);
      
      const cohortPrompt = `
Analyze this student cohort data and provide comprehensive insights:

Total Students: ${filteredStudents.length}

Status Distribution:
${Object.entries(filteredStudents.reduce((acc, s) => {
  acc[s.status] = (acc[s.status] || 0) + 1;
  return acc;
}, {})).map(([status, count]) => `- ${status}: ${count}`).join('\n')}

Country Preferences:
${Object.entries(filteredStudents.reduce((acc, s) => {
  s.preferred_countries?.forEach(c => acc[c] = (acc[c] || 0) + 1);
  return acc;
}, {})).slice(0, 10).map(([country, count]) => `- ${country}: ${count}`).join('\n')}

Degree Levels:
${Object.entries(filteredStudents.reduce((acc, s) => {
  acc[s.preferred_degree_level] = (acc[s.preferred_degree_level] || 0) + 1;
  return acc;
}, {})).map(([level, count]) => `- ${level}: ${count}`).join('\n')}

Provide:
1. Cohort characteristics and patterns
2. Geographic trends
3. Program preferences
4. Success indicators
5. Risk factors
6. Recommendations for targeted strategies
`;

      reportData = await base44.integrations.Core.InvokeLLM({
        prompt: cohortPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            cohort_size: { type: "number" },
            demographics: {
              type: "object",
              properties: {
                top_countries: { type: "array", items: { type: "string" } },
                popular_programs: { type: "array", items: { type: "string" } },
                avg_profile_completion: { type: "number" }
              }
            },
            trends: { type: "array", items: { type: "string" } },
            success_indicators: { type: "array", items: { type: "string" } },
            risk_factors: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    }

    if (report_type === 'application_trends') {
      const filteredApps = filterData(applications);
      
      const trendsPrompt = `
Analyze application trends and patterns:

Total Applications: ${filteredApps.length}

Status Breakdown:
${Object.entries(filteredApps.reduce((acc, a) => {
  acc[a.status] = (acc[a.status] || 0) + 1;
  return acc;
}, {})).map(([status, count]) => `- ${status}: ${count}`).join('\n')}

Success Metrics:
- Offers received: ${filteredApps.filter(a => ['conditional_offer', 'unconditional_offer', 'enrolled'].includes(a.status)).length}
- Rejection rate: ${(filteredApps.filter(a => a.status === 'rejected').length / filteredApps.length * 100).toFixed(1)}%
- Enrolled: ${filteredApps.filter(a => a.status === 'enrolled').length}

Provide comprehensive trend analysis with actionable insights.
`;

      reportData = await base44.integrations.Core.InvokeLLM({
        prompt: trendsPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            total_applications: { type: "number" },
            success_rate: { type: "number" },
            conversion_funnel: {
              type: "object",
              properties: {
                submitted: { type: "number" },
                offers: { type: "number" },
                enrolled: { type: "number" }
              }
            },
            trending_universities: { type: "array", items: { type: "string" } },
            seasonal_patterns: { type: "string" },
            bottlenecks: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } }
          }
        }
      });
    }

    if (report_type === 'course_effectiveness') {
      const courseRecommendations = await base44.asServiceRole.entities.CourseRecommendation?.list('-created_date', 500) || [];
      
      const effectivenessPrompt = `
Analyze course catalog effectiveness:

Total Courses: ${courses.length}
Active Courses: ${courses.filter(c => c.status === 'open').length}
Total Recommendations: ${courseRecommendations.length}

Course Engagement:
- Viewed: ${courseRecommendations.filter(r => r.status === 'viewed').length}
- Applied: ${courseRecommendations.filter(r => r.status === 'applied').length}
- Conversion rate: ${(courseRecommendations.filter(r => r.status === 'applied').length / courseRecommendations.length * 100).toFixed(1)}%

Provide insights on catalog performance and optimization opportunities.
`;

      reportData = await base44.integrations.Core.InvokeLLM({
        prompt: effectivenessPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            catalog_size: { type: "number" },
            engagement_metrics: {
              type: "object",
              properties: {
                view_rate: { type: "number" },
                application_rate: { type: "number" },
                conversion_rate: { type: "number" }
              }
            },
            top_performing_courses: { type: "array", items: { type: "string" } },
            underperforming_courses: { type: "array", items: { type: "string" } },
            gaps_identified: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    }

    if (report_type === 'counselor_performance') {
      const counselorMetrics = counselors.map(c => {
        const counselorStudents = students.filter(s => s.counselor_id === c.id);
        const counselorApps = applications.filter(a => {
          const student = students.find(s => s.id === a.student_id);
          return student?.counselor_id === c.id;
        });
        const counselorComms = communications.filter(co => co.counselor_id === c.id);

        return {
          name: c.name,
          students: counselorStudents.length,
          applications: counselorApps.length,
          success_rate: counselorApps.length > 0 ? 
            (counselorApps.filter(a => ['unconditional_offer', 'enrolled'].includes(a.status)).length / counselorApps.length * 100).toFixed(1) : 0,
          communications: counselorComms.length,
          positive_sentiment: counselorComms.filter(co => co.sentiment === 'positive').length
        };
      });

      reportData = {
        total_counselors: counselors.length,
        metrics: counselorMetrics,
        team_performance: {
          avg_students_per_counselor: (students.length / counselors.length).toFixed(1),
          avg_success_rate: (counselorMetrics.reduce((sum, m) => sum + parseFloat(m.success_rate), 0) / counselorMetrics.length).toFixed(1)
        }
      };
    }

    return Response.json({
      success: true,
      report_type,
      generated_at: new Date().toISOString(),
      data: reportData,
      filters_applied: filters
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});