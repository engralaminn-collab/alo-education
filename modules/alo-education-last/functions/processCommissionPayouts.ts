import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all referrals that are enrolled but commission not yet processed
    const referrals = await base44.asServiceRole.entities.PartnerReferral.filter({ 
      status: 'enrolled',
      commission_eligible: false
    });

    const results = [];

    for (const referral of referrals) {
      // Get student profile
      const students = await base44.asServiceRole.entities.StudentProfile.filter({ 
        id: referral.student_id 
      });
      
      if (students.length === 0) continue;
      const student = students[0];

      // Calculate commission (example: $500 base + 2% of tuition if available)
      const baseCommission = 500;
      let commissionAmount = baseCommission;

      // Get applications to check tuition fees
      const applications = await base44.asServiceRole.entities.Application.filter({ 
        student_id: student.id,
        status: 'enrolled'
      });

      if (applications.length > 0 && applications[0].tuition_fee) {
        commissionAmount = baseCommission + (applications[0].tuition_fee * 0.02);
      }

      // Create commission record
      const commission = await base44.asServiceRole.entities.Commission.create({
        student_id: student.id,
        partner_id: referral.partner_id,
        application_id: applications[0]?.id,
        amount: commissionAmount,
        currency: 'USD',
        status: 'approved',
        invoice_number: `INV-${Date.now()}`
      });

      // Update referral
      await base44.asServiceRole.entities.PartnerReferral.update(referral.id, {
        commission_eligible: true,
        commission_amount: commissionAmount
      });

      // Notify partner
      await base44.asServiceRole.functions.invoke('sendPartnerNotification', {
        partner_id: referral.partner_id,
        type: 'application_update',
        title: 'Commission Approved',
        message: `Commission of $${commissionAmount.toFixed(2)} approved for ${student.first_name} ${student.last_name}`
      });

      results.push({
        referral_id: referral.id,
        commission_id: commission.id,
        amount: commissionAmount
      });
    }

    return Response.json({ 
      success: true,
      processed: results.length,
      results 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});