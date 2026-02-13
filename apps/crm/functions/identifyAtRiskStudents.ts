import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id } = await req.json();

    // Get partner's students
    const referrals = await base44.asServiceRole.entities.PartnerReferral.filter({ partner_id });
    const studentIds = referrals.map(r => r.student_id).filter(Boolean);
    
    if (studentIds.length === 0) {
      return Response.json({ success: true, at_risk_students: [] });
    }

    const students = await base44.asServiceRole.entities.StudentProfile.filter({});
    const partnerStudents = students.filter(s => studentIds.includes(s.id));

    // Get communication history
    const messages = await base44.asServiceRole.entities.DirectMessage.filter({});
    const interactions = await base44.asServiceRole.entities.CounselorInteraction.filter({});

    const atRiskAnalysis = [];

    for (const student of partnerStudents) {
      // Calculate risk factors
      const studentMessages = messages.filter(m => 
        m.sender_id === student.id || m.recipient_id === student.id
      );
      
      const lastMessage = studentMessages
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
      
      const daysSinceLastContact = lastMessage 
        ? Math.floor((Date.now() - new Date(lastMessage.created_date)) / (1000 * 60 * 60 * 24))
        : 999;

      const studentInteractions = interactions.filter(i => i.student_id === student.id);
      const profileCompleteness = student.profile_completeness || 0;

      // Determine risk level
      let riskLevel = 'low';
      const riskFactors = [];

      if (daysSinceLastContact > 14) {
        riskLevel = 'high';
        riskFactors.push({
          factor: 'No Recent Contact',
          severity: 'high',
          description: `${daysSinceLastContact} days since last interaction`
        });
      } else if (daysSinceLastContact > 7) {
        riskLevel = 'medium';
        riskFactors.push({
          factor: 'Delayed Contact',
          severity: 'medium',
          description: `${daysSinceLastContact} days since last interaction`
        });
      }

      if (profileCompleteness < 50) {
        riskLevel = riskLevel === 'high' ? 'critical' : 'high';
        riskFactors.push({
          factor: 'Incomplete Profile',
          severity: 'high',
          description: `Only ${profileCompleteness}% profile complete`
        });
      }

      if (studentInteractions.length === 0) {
        riskFactors.push({
          factor: 'No Counselor Interaction',
          severity: 'medium',
          description: 'Student has not engaged with counselor'
        });
      }

      if (riskLevel !== 'low') {
        // Generate AI outreach suggestions
        const outreachPrompt = `
Generate personalized outreach suggestions for at-risk student:
Name: ${student.first_name} ${student.last_name}
Risk Level: ${riskLevel}
Risk Factors: ${riskFactors.map(f => f.description).join('; ')}
Profile: ${student.preferred_countries?.join(', ')} | ${student.preferred_fields?.join(', ')}
Days Since Contact: ${daysSinceLastContact}

Provide 3-4 specific outreach actions with:
- action_type (email, phone_call, whatsapp, meeting)
- priority (low, medium, high)
- suggested_message (personalized, empathetic message template)
- talking_points (3-4 key discussion points)
- best_time_to_contact (based on typical engagement patterns)

Make it personal, actionable, and focused on re-engagement.
`;

        const suggestions = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: outreachPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action_type: { type: "string" },
                    priority: { type: "string" },
                    suggested_message: { type: "string" },
                    talking_points: {
                      type: "array",
                      items: { type: "string" }
                    },
                    best_time_to_contact: { type: "string" }
                  }
                }
              }
            }
          }
        });

        // Create or update at-risk record
        const existing = await base44.asServiceRole.entities.AtRiskStudent.filter({
          student_id: student.id,
          status: 'identified'
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.AtRiskStudent.create({
            student_id: student.id,
            partner_id,
            risk_level: riskLevel,
            risk_factors: riskFactors,
            last_interaction_date: lastMessage?.created_date || null,
            days_since_last_contact: daysSinceLastContact,
            application_progress: profileCompleteness,
            ai_outreach_suggestions: suggestions.actions,
            status: 'identified',
            identified_at: new Date().toISOString()
          });
        }

        atRiskAnalysis.push({
          student,
          risk_level: riskLevel,
          risk_factors: riskFactors,
          days_since_last_contact: daysSinceLastContact,
          outreach_suggestions: suggestions.actions
        });
      }
    }

    return Response.json({
      success: true,
      at_risk_students: atRiskAnalysis,
      total_at_risk: atRiskAnalysis.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});