import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch data
    const applications = await base44.entities.Application.list();
    const students = await base44.entities.StudentProfile.list();
    const messages = await base44.entities.Message.list();
    const documents = await base44.entities.Document.list();
    const tasks = await base44.entities.Task.list();

    // Calculate student health scores
    const studentHealthScores = students.map(student => {
      const studentApps = applications.filter(a => a.student_id === student.id);
      const studentMessages = messages.filter(m => m.student_id === student.id);
      const studentDocs = documents.filter(d => d.student_id === student.id);
      const studentTasks = tasks.filter(t => t.student_id === student.id);

      let score = 0;
      let factors = [];

      // Profile completeness (0-25 points)
      const completeness = student.profile_completeness || 0;
      score += (completeness / 100) * 25;
      if (completeness < 60) factors.push('Incomplete profile');

      // Application activity (0-25 points)
      if (studentApps.length > 0) {
        score += 15;
        const recentApp = studentApps.some(a => {
          const daysSince = a.applied_date ? (Date.now() - new Date(a.applied_date).getTime()) / (1000 * 60 * 60 * 24) : 999;
          return daysSince < 30;
        });
        if (recentApp) score += 10;
      } else {
        factors.push('No applications submitted');
      }

      // Communication engagement (0-25 points)
      if (studentMessages.length > 0) {
        score += Math.min(studentMessages.length * 5, 15);
        const recentMessage = studentMessages.some(m => {
          const daysSince = m.created_date ? (Date.now() - new Date(m.created_date).getTime()) / (1000 * 60 * 60 * 24) : 999;
          return daysSince < 7;
        });
        if (recentMessage) score += 10;
      } else {
        factors.push('No recent communication');
      }

      // Document submission (0-25 points)
      const approvedDocs = studentDocs.filter(d => d.status === 'approved').length;
      score += Math.min(approvedDocs * 5, 25);
      if (studentDocs.length > 0 && approvedDocs === 0) {
        factors.push('Documents pending approval');
      }

      // Risk indicators
      const isAtRisk = score < 40 || factors.length >= 2;
      const riskLevel = score < 30 ? 'high' : score < 50 ? 'medium' : 'low';

      return {
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        health_score: Math.min(Math.round(score), 100),
        risk_level: riskLevel,
        is_at_risk: isAtRisk,
        risk_factors: factors,
        metrics: {
          profile_completeness: completeness,
          applications: studentApps.length,
          messages: studentMessages.length,
          documents: studentDocs.length,
          approved_documents: approvedDocs
        }
      };
    });

    // Identify at-risk students
    const atRiskStudents = studentHealthScores
      .filter(s => s.is_at_risk)
      .sort((a, b) => a.health_score - b.health_score)
      .slice(0, 20);

    // Calculate monthly application trends
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const monthApps = applications.filter(a => {
        if (!a.applied_date) return false;
        const appDate = new Date(a.applied_date);
        return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === date.getFullYear();
      }).length;

      last6Months.push({ month: `${month} ${year}`, count: monthApps });
    }

    // Use AI for forecasting
    const forecastPrompt = `Based on this application trend data, forecast the next 3 months:
${JSON.stringify(last6Months, null, 2)}

Current total applications: ${applications.length}
Current total students: ${students.length}
At-risk students: ${atRiskStudents.length}

Provide:
1. Forecasted application numbers for next 3 months
2. Key trends you observe
3. Recommendations for counselors
4. Performance alerts (if any concerning patterns)`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: forecastPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          forecast: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                predicted_applications: { type: "number" },
                confidence: { type: "string" }
              }
            }
          },
          trends: {
            type: "array",
            items: { type: "string" }
          },
          recommendations: {
            type: "array",
            items: { type: "string" }
          },
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                severity: { type: "string", enum: ["high", "medium", "low"] },
                title: { type: "string" },
                message: { type: "string" },
                action_required: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      student_health_scores: studentHealthScores,
      at_risk_students: atRiskStudents,
      historical_trends: last6Months,
      forecast: aiResponse.forecast,
      insights: {
        trends: aiResponse.trends,
        recommendations: aiResponse.recommendations
      },
      alerts: aiResponse.alerts,
      summary: {
        total_students: students.length,
        total_applications: applications.length,
        at_risk_count: atRiskStudents.length,
        avg_health_score: Math.round(studentHealthScores.reduce((sum, s) => sum + s.health_score, 0) / studentHealthScores.length)
      }
    });

  } catch (error) {
    console.error('Predictive analytics error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});