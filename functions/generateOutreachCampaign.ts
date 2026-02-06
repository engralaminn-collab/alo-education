import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      studentCriteria, 
      universityCriteria, 
      outreachType, 
      objective,
      targetUniversities 
    } = await req.json();

    // Fetch sample students and universities for context
    const students = await base44.entities.StudentProfile.list();
    const universities = await base44.entities.University.list();
    const courses = await base44.entities.Course.list();

    // Filter based on criteria
    let targetStudents = students;
    if (studentCriteria.nationality) {
      targetStudents = targetStudents.filter(s => s.nationality === studentCriteria.nationality);
    }
    if (studentCriteria.preferredCountries?.length > 0) {
      targetStudents = targetStudents.filter(s => 
        s.preferred_countries?.some(c => studentCriteria.preferredCountries.includes(c))
      );
    }

    let relevantUniversities = universities;
    if (universityCriteria.countries?.length > 0) {
      relevantUniversities = relevantUniversities.filter(u => 
        universityCriteria.countries.includes(u.country)
      );
    }

    // Build AI prompt
    const prompt = `You are an expert university outreach campaign strategist. Create a comprehensive outreach campaign plan.

**Campaign Details:**
- Outreach Type: ${outreachType}
- Objective: ${objective}

**Target Student Profile:**
- Total students matching criteria: ${targetStudents.length}
- Sample profile: ${JSON.stringify(targetStudents[0], null, 2)}
- Student criteria: ${JSON.stringify(studentCriteria, null, 2)}

**Target Universities:**
- Total universities: ${relevantUniversities.length}
- Sample university: ${JSON.stringify(relevantUniversities[0], null, 2)}
- University criteria: ${JSON.stringify(universityCriteria, null, 2)}
${targetUniversities ? `- Specific universities: ${targetUniversities.join(', ')}` : ''}

**Generate a complete campaign plan with:**

1. **Campaign Strategy**: Overall approach and key messaging points
2. **Email Templates**: Create 3 email templates:
   - Initial outreach email (subject + body with {{placeholders}} for personalization)
   - Follow-up 1 (7 days after, if no response)
   - Follow-up 2 (14 days after, if no response)
3. **Personalization Variables**: List all {{variables}} used (e.g., {{university_name}}, {{student_name}}, {{course_name}})
4. **Optimal Timing**: Best day of week and time to send (consider university timezones)
5. **Success Metrics**: Expected response rate and key indicators
6. **A/B Testing Suggestions**: 2 subject line variations for testing

Make emails professional, concise, and focused on building partnerships. Include clear CTAs.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          campaign_name: { type: "string" },
          strategy: { type: "string" },
          target_audience: { type: "string" },
          key_messaging: { type: "array", items: { type: "string" } },
          email_templates: {
            type: "object",
            properties: {
              initial: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  body: { type: "string" }
                }
              },
              follow_up_1: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  body: { type: "string" },
                  days_after: { type: "number" }
                }
              },
              follow_up_2: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  body: { type: "string" },
                  days_after: { type: "number" }
                }
              }
            }
          },
          personalization_variables: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                variable: { type: "string" },
                description: { type: "string" }
              }
            } 
          },
          optimal_timing: {
            type: "object",
            properties: {
              day_of_week: { type: "string" },
              hour: { type: "number" },
              timezone: { type: "string" },
              rationale: { type: "string" }
            }
          },
          success_metrics: {
            type: "object",
            properties: {
              expected_response_rate: { type: "number" },
              key_indicators: { type: "array", items: { type: "string" } }
            }
          },
          ab_testing: {
            type: "object",
            properties: {
              subject_variation_a: { type: "string" },
              subject_variation_b: { type: "string" },
              testing_strategy: { type: "string" }
            }
          }
        }
      }
    });

    // Create campaign record
    const campaignData = {
      campaign_name: response.campaign_name,
      scenario_type: outreachType,
      email_template: response.email_templates.initial.body,
      subject_template: response.email_templates.initial.subject,
      target_universities: targetUniversities || relevantUniversities.slice(0, 10).map(u => u.id),
      optimal_send_time: {
        day_of_week: response.optimal_timing.day_of_week,
        hour: response.optimal_timing.hour,
        timezone: response.optimal_timing.timezone
      },
      follow_up_sequence: [
        {
          days_after: response.email_templates.follow_up_1.days_after || 7,
          email_template: response.email_templates.follow_up_1.body,
          subject_template: response.email_templates.follow_up_1.subject
        },
        {
          days_after: response.email_templates.follow_up_2.days_after || 14,
          email_template: response.email_templates.follow_up_2.body,
          subject_template: response.email_templates.follow_up_2.subject
        }
      ],
      ai_generated: true,
      response_rate: response.success_metrics.expected_response_rate,
      created_by: user.email
    };

    const campaign = await base44.entities.OutreachCampaign.create(campaignData);

    return Response.json({
      success: true,
      campaign: campaign,
      analysis: response,
      matching_students: targetStudents.length,
      target_universities_count: relevantUniversities.length
    });

  } catch (error) {
    console.error('Campaign generation error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});