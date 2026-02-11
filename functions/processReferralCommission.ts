import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only process when student status changes to enrolled
    if (event.type !== 'update' || data.status !== 'enrolled') {
      return Response.json({ success: true, message: 'No action needed' });
    }

    const studentId = data.id;

    // Find referral for this student
    const referrals = await base44.asServiceRole.entities.PartnerReferral.filter({ 
      student_id: studentId 
    });

    if (referrals.length === 0) {
      return Response.json({ success: true, message: 'No referral found' });
    }

    const referral = referrals[0];

    // Skip if already processed
    if (referral.commission_eligible) {
      return Response.json({ success: true, message: 'Already processed' });
    }

    // Update referral status
    await base44.asServiceRole.entities.PartnerReferral.update(referral.id, {
      status: 'enrolled'
    });

    // Calculate commission
    const baseCommission = 500;
    let commissionAmount = baseCommission;

    // Get enrolled application to check tuition
    const applications = await base44.asServiceRole.entities.Application.filter({ 
      student_id: studentId,
      status: 'enrolled'
    });

    if (applications.length > 0 && applications[0].tuition_fee) {
      commissionAmount = baseCommission + (applications[0].tuition_fee * 0.02);
    }

    // Create commission record
    const commission = await base44.asServiceRole.entities.Commission.create({
      student_id: studentId,
      partner_id: referral.partner_id,
      application_id: applications[0]?.id,
      amount: commissionAmount,
      currency: 'USD',
      status: 'approved',
      invoice_number: `INV-${Date.now()}`,
      notes: `Auto-generated commission for referral ${referral.referral_code}`
    });

    // Update referral with commission info
    await base44.asServiceRole.entities.PartnerReferral.update(referral.id, {
      commission_eligible: true,
      commission_amount: commissionAmount
    });

    // Send notification to partner
    await base44.asServiceRole.entities.Notification.create({
      user_id: referral.partner_id,
      type: 'application_update',
      title: 'Commission Approved! 🎉',
      message: `Congratulations! Commission of $${commissionAmount.toFixed(2)} has been approved for ${data.first_name} ${data.last_name}. Invoice: ${commission.invoice_number}`,
      is_read: false
    });

    return Response.json({ 
      success: true,
      commission_id: commission.id,
      amount: commissionAmount,
      referral_code: referral.referral_code
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});