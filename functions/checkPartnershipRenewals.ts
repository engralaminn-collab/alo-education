import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const agreements = await base44.asServiceRole.entities.UniversityAgreement.filter({ 
      status: 'active' 
    });

    const universities = await base44.asServiceRole.entities.University.list();
    const universityMap = universities.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

    // Find agreements expiring in 90, 60, and 30 days
    const renewalAlerts = agreements.filter(a => {
      if (!a.end_date) return false;
      const endDate = new Date(a.end_date);
      const daysUntil = (endDate - now) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 90;
    }).map(a => {
      const endDate = new Date(a.end_date);
      const daysUntil = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      const university = universityMap[a.university_id];
      
      let priority = 'low';
      if (daysUntil <= 30) priority = 'urgent';
      else if (daysUntil <= 60) priority = 'high';
      else priority = 'medium';

      return {
        agreement: a,
        university: university?.university_name || 'Unknown',
        daysUntil,
        priority
      };
    }).sort((a, b) => a.daysUntil - b.daysUntil);

    // Get all admin users to notify
    const adminUsers = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    // Send email notifications for urgent renewals (30 days or less)
    const urgentRenewals = renewalAlerts.filter(r => r.priority === 'urgent');
    
    if (urgentRenewals.length > 0) {
      const emailBody = `
<h2>Urgent: Partnership Agreements Expiring Soon</h2>
<p>The following partnership agreements will expire within 30 days:</p>

${urgentRenewals.map(renewal => `
<div style="padding: 15px; margin: 10px 0; border-left: 4px solid #DC2626; background: #FEF2F2;">
  <h3>${renewal.agreement.agreement_title}</h3>
  <p><strong>University:</strong> ${renewal.university}</p>
  <p><strong>Expires in:</strong> ${renewal.daysUntil} days (${new Date(renewal.agreement.end_date).toLocaleDateString()})</p>
  <p><strong>Commission Rate:</strong> ${renewal.agreement.commission_rate || 'N/A'}%</p>
  <p style="margin-top: 10px; color: #DC2626;"><strong>Action Required:</strong> Contact partnership manager to initiate renewal process.</p>
</div>
`).join('')}

<p style="margin-top: 20px;">Please review and take action on these renewals promptly.</p>
<p><em>This is an automated reminder from your CRM system.</em></p>
`;

      // Send email to each admin
      for (const admin of adminUsers) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'ALO Education CRM',
          to: admin.email,
          subject: `🚨 ${urgentRenewals.length} Partnership Agreement${urgentRenewals.length > 1 ? 's' : ''} Expiring Soon`,
          body: emailBody
        });
      }
    }

    // Create tasks for partnership managers
    for (const renewal of renewalAlerts) {
      if (renewal.priority === 'urgent' || renewal.priority === 'high') {
        // Check if task already exists
        const existingTasks = await base44.asServiceRole.entities.CounselorTask.filter({
          task_type: 'follow_up',
          title: `Renew Partnership: ${renewal.agreement.agreement_title}`
        });

        if (existingTasks.length === 0) {
          // Find a counselor/admin to assign to
          const assignee = adminUsers[0]; // Assign to first admin or implement round-robin

          await base44.asServiceRole.entities.CounselorTask.create({
            counselor_id: assignee.id,
            task_type: 'follow_up',
            title: `Renew Partnership: ${renewal.agreement.agreement_title}`,
            description: `Partnership agreement with ${renewal.university} expires in ${renewal.daysUntil} days. Current commission rate: ${renewal.agreement.commission_rate || 'N/A'}%. Please contact the university to initiate renewal negotiations.`,
            priority: renewal.priority,
            status: 'pending',
            due_date: new Date(renewal.agreement.end_date).toISOString(),
            notes: `Agreement ID: ${renewal.agreement.id}\nEnd Date: ${renewal.agreement.end_date}`
          });
        }
      }
    }

    return Response.json({ 
      success: true,
      renewalsFound: renewalAlerts.length,
      urgentRenewals: urgentRenewals.length,
      emailsSent: urgentRenewals.length > 0 ? adminUsers.length : 0,
      tasksCreated: renewalAlerts.filter(r => r.priority === 'urgent' || r.priority === 'high').length,
      renewals: renewalAlerts
    });

  } catch (error) {
    console.error('Error checking partnership renewals:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});