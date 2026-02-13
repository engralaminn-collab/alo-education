import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filters } = await req.json();

    // Fetch all necessary data
    const applications = await base44.entities.Application.list();
    const students = await base44.entities.StudentProfile.list();
    const courses = await base44.entities.Course.list();
    const universities = await base44.entities.University.list();
    const counselors = await base44.entities.Counselor.list();
    const outreaches = await base44.entities.UniversityOutreach.list();

    // Calculate performance metrics
    const counselorPerformance = counselors.map(counselor => {
      const counselorStudents = students.filter(s => s.counselor_id === counselor.user_id);
      const studentIds = counselorStudents.map(s => s.id);
      const counselorApps = applications.filter(a => studentIds.includes(a.student_id));
      
      return {
        name: counselor.name,
        total_students: counselorStudents.length,
        total_applications: counselorApps.length,
        enrolled: counselorApps.filter(a => a.status === 'enrolled').length,
        conversion_rate: counselorApps.length > 0 
          ? ((counselorApps.filter(a => a.status === 'enrolled').length / counselorApps.length) * 100).toFixed(1)
          : 0
      };
    }).sort((a, b) => b.enrolled - a.enrolled);

    // Destination analysis
    const destinationStats = {};
    applications.forEach(app => {
      const course = courses.find(c => c.id === app.course_id);
      if (course?.country) {
        if (!destinationStats[course.country]) {
          destinationStats[course.country] = {
            total: 0,
            enrolled: 0,
            pending: 0
          };
        }
        destinationStats[course.country].total++;
        if (app.status === 'enrolled') destinationStats[course.country].enrolled++;
        if (app.status === 'submitted_to_university' || app.status === 'under_review') {
          destinationStats[course.country].pending++;
        }
      }
    });

    // Popular courses
    const courseStats = {};
    applications.forEach(app => {
      const course = courses.find(c => c.id === app.course_id);
      if (course) {
        const key = `${course.course_title} - ${course.level}`;
        if (!courseStats[key]) {
          courseStats[key] = { count: 0, enrolled: 0 };
        }
        courseStats[key].count++;
        if (app.status === 'enrolled') courseStats[key].enrolled++;
      }
    });

    const popularCourses = Object.entries(courseStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Outreach success
    const outreachStats = {
      total: outreaches.length,
      responded: outreaches.filter(o => o.response_received).length,
      positive: outreaches.filter(o => o.response_sentiment === 'positive').length,
      response_rate: outreaches.length > 0 
        ? ((outreaches.filter(o => o.response_received).length / outreaches.length) * 100).toFixed(1)
        : 0
    };

    // Build AI prompt
    const prompt = `Analyze this education consultancy performance data and provide actionable insights:

**Counselor Performance:**
${JSON.stringify(counselorPerformance.slice(0, 5), null, 2)}

**Destination Statistics:**
${JSON.stringify(destinationStats, null, 2)}

**Popular Courses:**
${JSON.stringify(popularCourses.slice(0, 5), null, 2)}

**Outreach Statistics:**
- Total outreach campaigns: ${outreachStats.total}
- Response rate: ${outreachStats.response_rate}%
- Positive responses: ${outreachStats.positive}

**Total Applications:** ${applications.length}
**Total Students:** ${students.length}

Provide comprehensive analysis with:
1. Top 3 key trends (what's working well)
2. Top 3 areas for improvement (specific actionable advice)
3. Top performing counselor insights (why they're successful)
4. Destination analysis (which countries show best conversion)
5. Strategic recommendations (3-5 specific actions to improve performance)

Be specific, data-driven, and actionable.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          key_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          areas_for_improvement: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: { type: "string" },
                issue: { type: "string" },
                recommendation: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          top_performer_insights: {
            type: "object",
            properties: {
              counselor_name: { type: "string" },
              success_factors: { type: "array", items: { type: "string" } },
              replicable_strategies: { type: "array", items: { type: "string" } }
            }
          },
          destination_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                country: { type: "string" },
                performance: { type: "string" },
                opportunity: { type: "string" }
              }
            }
          },
          strategic_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                expected_impact: { type: "string" },
                timeframe: { type: "string" }
              }
            }
          },
          overall_summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      insights: aiResponse,
      metrics: {
        counselorPerformance: counselorPerformance.slice(0, 10),
        destinationStats,
        popularCourses: popularCourses.slice(0, 10),
        outreachStats,
        totals: {
          applications: applications.length,
          students: students.length,
          counselors: counselors.length,
          enrolled: applications.filter(a => a.status === 'enrolled').length
        }
      }
    });

  } catch (error) {
    console.error('Performance analysis error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});