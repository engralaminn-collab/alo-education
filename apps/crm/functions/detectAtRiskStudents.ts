import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, run_for_all } = await req.json();

    // Fetch data
    const students = run_for_all 
      ? await base44.asServiceRole.entities.StudentProfile.filter({ 
          status: { $in: ['in_progress', 'applied', 'ready_to_apply'] } 
        })
      : [await base44.asServiceRole.entities.StudentProfile.get(student_id)];

    const communications = await base44.asServiceRole.entities.CommunicationLog.list('-created_date', 1000);
    const applications = await base44.asServiceRole.entities.Application.list('-created_date', 500);
    const tasks = await base44.asServiceRole.entities.Task.list('-created_date', 500);

    const atRiskStudents = [];

    for (const student of students) {
      const studentComms = communications.filter(c => c.student_id === student.id);
      const studentApps = applications.filter(a => a.student_id === student.id);
      const studentTasks = tasks.filter(t => t.student_id === student.id);

      // Calculate risk indicators
      const daysSinceLastContact = studentComms.length > 0 
        ? Math.floor((Date.now() - new Date(studentComms[0].created_date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      const negativeSentiment = studentComms.filter(c => c.sentiment === 'negative').length;
      const totalSentiment = studentComms.filter(c => c.sentiment).length;
      const negativeSentimentRate = totalSentiment > 0 ? (negativeSentiment / totalSentiment * 100) : 0;

      const pendingTasks = studentTasks.filter(t => t.status === 'pending').length;
      const overdueTasks = studentTasks.filter(t => {
        if (t.due_date && t.status === 'pending') {
          return new Date(t.due_date) < new Date();
        }
        return false;
      }).length;

      const stalledApps = studentApps.filter(a => 
        a.status === 'draft' || a.status === 'documents_pending'
      ).length;

      const profileCompleteness = student.profile_completeness || 0;

      // AI risk assessment
      const riskPrompt = `
Analyze this student's engagement and performance data to assess dropout risk:

Student: ${student.first_name} ${student.last_name}
Status: ${student.status}
Profile Completeness: ${profileCompleteness}%

Engagement Metrics:
- Days since last contact: ${daysSinceLastContact}
- Total communications: ${studentComms.length}
- Negative sentiment rate: ${negativeSentimentRate.toFixed(1)}%
- Pending tasks: ${pendingTasks}
- Overdue tasks: ${overdueTasks}

Application Progress:
- Active applications: ${studentApps.length}
- Stalled applications: ${stalledApps}
- Application statuses: ${studentApps.map(a => a.status).join(', ') || 'None'}

Recent Communication Topics:
${studentComms.slice(0, 5).map(c => c.key_topics?.join(', ')).filter(Boolean).join(' | ') || 'None'}

Assess dropout risk and provide intervention recommendations.
`;

      const riskAssessment = await base44.integrations.Core.InvokeLLM({
        prompt: riskPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
            risk_score: { type: "number" },
            risk_factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high"] },
                  description: { type: "string" }
                }
              }
            },
            recommended_interventions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action_type: { type: "string", enum: ["immediate_call", "urgent_meeting", "email_outreach", "task_assignment", "counselor_escalation"] },
                  priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                  description: { type: "string" },
                  timeframe: { type: "string" }
                }
              }
            },
            early_warning_signs: { type: "array", items: { type: "string" } }
          }
        }
      });

      if (['high', 'critical'].includes(riskAssessment.risk_level)) {
        // Create or update at-risk record
        const atRiskRecord = await base44.asServiceRole.entities.AtRiskStudent?.create({
          student_id: student.id,
          risk_level: riskAssessment.risk_level,
          risk_factors: riskAssessment.risk_factors,
          last_interaction_date: studentComms[0]?.created_date || null,
          days_since_last_contact: daysSinceLastContact,
          application_progress: (studentApps.filter(a => 
            !['draft', 'rejected', 'withdrawn'].includes(a.status)
          ).length / Math.max(studentApps.length, 1) * 100),
          ai_outreach_suggestions: riskAssessment.recommended_interventions,
          status: 'identified',
          identified_at: new Date().toISOString()
        });

        // Create intervention tasks for counselor
        for (const intervention of riskAssessment.recommended_interventions) {
          await base44.asServiceRole.entities.Task.create({
            title: `[At-Risk] ${intervention.action_type.replace('_', ' ').toUpperCase()}`,
            description: intervention.description,
            student_id: student.id,
            assigned_to: student.counselor_id,
            priority: intervention.priority,
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            status: 'pending',
            task_type: intervention.action_type,
            created_by_ai: true,
            ai_context: JSON.stringify({ risk_assessment: riskAssessment })
          });
        }

        atRiskStudents.push({
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          risk_assessment: riskAssessment,
          interventions_created: riskAssessment.recommended_interventions.length
        });
      }
    }

    return Response.json({
      success: true,
      students_analyzed: students.length,
      at_risk_count: atRiskStudents.length,
      at_risk_students: atRiskStudents
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});