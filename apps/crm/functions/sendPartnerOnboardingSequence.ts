import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id, user_email, user_name, organization_name } = await req.json();

    // Day 1: Welcome Email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user_email,
      subject: '🎉 Welcome to ALO Education Partner Program!',
      body: `
Hi ${user_name},

Welcome to the ALO Education Partner Program! We're excited to have ${organization_name || 'you'} on board.

Here's what happens next:

📋 Step 1: Complete your partner profile
🔗 Step 2: Generate your unique referral links
👥 Step 3: Invite your team members (optional)
📚 Step 4: Access our resource library

Your Partner Dashboard: ${Deno.env.get('BASE44_APP_URL') || 'https://your-app.base44.app'}/PartnerPortal

Need help? Reply to this email or chat with us directly through the portal.

Best regards,
The ALO Education Team
      `.trim()
    });

    // Create initial tasks
    await base44.asServiceRole.entities.CounselorTask.bulkCreate([
      {
        counselor_id: partner_id,
        title: 'Complete Organization Profile',
        description: 'Add your organization details, contact info, and target markets',
        task_type: 'profile_setup',
        priority: 'high',
        status: 'pending'
      },
      {
        counselor_id: partner_id,
        title: 'Generate Your First Referral Link',
        description: 'Create a unique referral code and start tracking leads',
        task_type: 'referral_setup',
        priority: 'high',
        status: 'pending'
      },
      {
        counselor_id: partner_id,
        title: 'Explore Partner Resources',
        description: 'Check out our guides, best practices, and marketing materials',
        task_type: 'training',
        priority: 'medium',
        status: 'pending'
      }
    ]);

    // Schedule Day 3 follow-up
    setTimeout(async () => {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user_email,
        subject: '📚 Partner Resources & Best Practices',
        body: `
Hi ${user_name},

Hope you're settling in well! Here are some resources to help you succeed:

✅ Top Performing Referral Sources:
- Social media posts with student success stories
- Email campaigns to your network
- Direct WhatsApp/phone referrals

📊 Success Tips:
- Partners who complete their profile get 3x more conversions
- Personalized follow-up messages increase enrollment by 40%
- Tracking multiple referral codes helps identify best channels

Have questions? We're here to help!

Best,
ALO Team
        `.trim()
      });
    }, 3 * 24 * 60 * 60 * 1000); // 3 days

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});