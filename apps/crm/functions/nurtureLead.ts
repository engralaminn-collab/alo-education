import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all leads needing nurturing
    const inquiries = await base44.asServiceRole.entities.Inquiry.filter({
      status: { $in: ['new', 'contacted'] }
    });

    const nurtureActions = [];

    for (const inquiry of inquiries) {
      const qualStatus = inquiry.qualification_status;
      
      // Check existing campaigns
      const existingCampaigns = await base44.asServiceRole.entities.LeadNurtureCampaign.filter({
        inquiry_id: inquiry.id,
        status: 'active'
      });

      if (existingCampaigns.length > 0) continue; // Already in campaign

      // Determine nurture strategy based on qualification
      if (qualStatus === 'hot') {
        // Hot leads: Automated email sequence
        const campaign = await base44.asServiceRole.entities.LeadNurtureCampaign.create({
          inquiry_id: inquiry.id,
          campaign_type: 'hot_lead_email_sequence',
          status: 'active',
          sequence_step: 1,
          messages_sent: 0,
          next_action_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

        // Generate email content
        const emailContent = await generateEmail(base44, inquiry, 'hot', 1);
        
        nurtureActions.push({
          inquiry_id: inquiry.id,
          action: 'email_sequence',
          campaign_id: campaign.id,
          email: emailContent
        });

      } else if (qualStatus === 'warm') {
        // Warm leads: Personalized SMS
        const campaign = await base44.asServiceRole.entities.LeadNurtureCampaign.create({
          inquiry_id: inquiry.id,
          campaign_type: 'warm_lead_sms',
          status: 'active',
          sequence_step: 1,
          messages_sent: 0,
          next_action_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        });

        const smsContent = await generateSMS(base44, inquiry);
        
        nurtureActions.push({
          inquiry_id: inquiry.id,
          action: 'sms',
          campaign_id: campaign.id,
          sms: smsContent
        });

      } else if (qualStatus === 'cold') {
        // Cold leads: Manual counselor outreach task
        if (inquiry.assigned_to) {
          await base44.asServiceRole.entities.Task.create({
            title: `Manual Outreach: ${inquiry.name}`,
            description: `Cold lead requiring personalized outreach. Low engagement history.`,
            type: 'follow_up',
            student_id: inquiry.converted_to_student,
            assigned_to: inquiry.assigned_to,
            priority: 'medium',
            status: 'pending',
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });

          nurtureActions.push({
            inquiry_id: inquiry.id,
            action: 'manual_task_created'
          });
        }
      }
    }

    return Response.json({
      success: true,
      leads_processed: inquiries.length,
      actions_taken: nurtureActions.length,
      actions: nurtureActions
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateEmail(base44, inquiry, status, step) {
  const prompt = `Generate a ${status} lead nurture email (step ${step}) for: ${inquiry.name}, interested in ${inquiry.degree_level} in ${inquiry.country_of_interest}. Be warm, professional, and action-oriented.`;
  
  const email = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        subject: { type: "string" },
        body: { type: "string" }
      }
    }
  });

  return email;
}

async function generateSMS(base44, inquiry) {
  const prompt = `Generate a warm, personalized SMS (160 chars) for lead: ${inquiry.name}, interested in studying ${inquiry.field_of_study}. Encourage engagement.`;
  
  const sms = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        message: { type: "string" }
      }
    }
  });

  return sms.message;
}