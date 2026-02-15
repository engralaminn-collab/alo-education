import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all new inquiries that haven't been contacted
    const newInquiries = await base44.asServiceRole.entities.Inquiry.filter({
      status: 'new'
    });

    const now = new Date();
    const alerts = [];

    for (const inquiry of newInquiries) {
      const createdAt = new Date(inquiry.created_date);
      const minutesElapsed = Math.floor((now - createdAt) / (1000 * 60));

      // 30-minute SLA breach
      if (minutesElapsed >= 30 && !inquiry.sla_breached) {
        await base44.asServiceRole.entities.Inquiry.update(inquiry.id, {
          sla_breached: true
        });

        // Create SLA alert
        await base44.asServiceRole.entities.SLAAlert.create({
          inquiry_id: inquiry.id,
          alert_type: 'sla_breach_30min',
          assigned_counselor_id: inquiry.assigned_to,
          time_elapsed_minutes: minutesElapsed,
          status: 'pending'
        });

        // Notify counselor
        if (inquiry.assigned_to) {
          await base44.asServiceRole.entities.Notification.create({
            user_id: inquiry.assigned_to,
            type: 'sla_breach',
            title: 'SLA Breach Alert',
            message: `Lead from ${inquiry.name} has exceeded 30-minute response time (${minutesElapsed} minutes)`,
            link: `/crm/inquiries?id=${inquiry.id}`,
            priority: 'high'
          });
        }

        alerts.push({ type: '30min_breach', inquiry_id: inquiry.id });
      }

      // 50-minute escalation to manager (30 + 20)
      if (minutesElapsed >= 50 && !inquiry.escalated_to_manager) {
        await base44.asServiceRole.entities.Inquiry.update(inquiry.id, {
          escalated_to_manager: true,
          manager_notified_at: now.toISOString()
        });

        // Get branch manager
        if (inquiry.assigned_to) {
          const counselor = await base44.asServiceRole.entities.User.get(inquiry.assigned_to);
          
          if (counselor.branch_manager_id) {
            await base44.asServiceRole.entities.SLAAlert.create({
              inquiry_id: inquiry.id,
              alert_type: 'escalation_manager',
              assigned_counselor_id: inquiry.assigned_to,
              branch_manager_id: counselor.branch_manager_id,
              time_elapsed_minutes: minutesElapsed,
              status: 'pending'
            });

            await base44.asServiceRole.entities.Notification.create({
              user_id: counselor.branch_manager_id,
              type: 'sla_escalation',
              title: 'Manager Escalation - SLA Breach',
              message: `Lead from ${inquiry.name} unresponded for ${minutesElapsed} minutes. Counselor: ${counselor.full_name}`,
              link: `/crm/inquiries?id=${inquiry.id}`,
              priority: 'urgent'
            });
          }
        }

        alerts.push({ type: 'manager_escalation', inquiry_id: inquiry.id });
      }

      // 70-minute escalation to CEO (30 + 20 + 20)
      if (minutesElapsed >= 70 && !inquiry.escalated_to_ceo) {
        await base44.asServiceRole.entities.Inquiry.update(inquiry.id, {
          escalated_to_ceo: true,
          ceo_notified_at: now.toISOString()
        });

        // Get all admins/CEOs
        const admins = await base44.asServiceRole.entities.User.filter({
          role: 'admin'
        });

        for (const admin of admins) {
          await base44.asServiceRole.entities.SLAAlert.create({
            inquiry_id: inquiry.id,
            alert_type: 'escalation_ceo',
            assigned_counselor_id: inquiry.assigned_to,
            time_elapsed_minutes: minutesElapsed,
            status: 'pending'
          });

          await base44.asServiceRole.entities.Notification.create({
            user_id: admin.id,
            type: 'sla_escalation_ceo',
            title: 'CEO Alert - Critical SLA Breach',
            message: `URGENT: Lead from ${inquiry.name} unresponded for ${minutesElapsed} minutes`,
            link: `/crm/inquiries?id=${inquiry.id}`,
            priority: 'urgent'
          });
        }

        alerts.push({ type: 'ceo_escalation', inquiry_id: inquiry.id });
      }
    }

    return Response.json({
      success: true,
      inquiries_checked: newInquiries.length,
      alerts_created: alerts.length,
      alerts
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});