import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { partner_id, type, title, message } = await req.json();

    // Get all partner team members
    const staffRoles = await base44.asServiceRole.entities.StaffRole.filter({
      partner_organization_id: partner_id,
      role: 'partner',
      is_active: true
    });

    // Create notifications for all team members
    const notifications = await Promise.all(
      staffRoles.map(role => 
        base44.asServiceRole.entities.Notification.create({
          user_id: role.user_id,
          type: type,
          title: title,
          message: message,
          is_read: false
        })
      )
    );

    return Response.json({ 
      success: true, 
      count: notifications.length 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});