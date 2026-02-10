import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { referral_code, lead_email } = await req.json();

    // Get referral info
    const referrals = await base44.asServiceRole.entities.PartnerReferral.filter({ 
      referral_code 
    });
    
    if (referrals.length === 0) {
      return Response.json({ error: 'Referral not found' }, { status: 404 });
    }

    const referral = referrals[referrals.length - 1]; // Get latest referral
    const partnerId = referral.partner_id;

    // Create student profile
    const studentProfile = await base44.asServiceRole.entities.StudentProfile.create({
      first_name: referral.lead_data.first_name,
      last_name: referral.lead_data.last_name,
      email: referral.lead_data.email,
      phone: referral.lead_data.phone,
      preferred_countries: [referral.lead_data.country_of_interest],
      preferred_degree_level: referral.lead_data.degree_level,
      target_intake: referral.lead_data.intake,
      source: `partner_${partnerId}`,
      status: 'new_lead'
    });

    // Update referral with student ID
    await base44.asServiceRole.entities.PartnerReferral.update(referral.id, {
      student_id: studentProfile.id,
      status: 'contacted'
    });

    // Auto-assign counselor (get first available)
    const counselors = await base44.asServiceRole.entities.StaffRole.filter({ 
      role: 'counsellor',
      is_active: true 
    });
    
    if (counselors.length > 0) {
      await base44.asServiceRole.entities.StudentProfile.update(studentProfile.id, {
        counselor_id: counselors[0].user_id
      });
    }

    // Send notification to partner
    await base44.asServiceRole.functions.invoke('sendPartnerNotification', {
      partner_id: partnerId,
      type: 'new_lead',
      title: 'New Lead Submitted',
      message: `${referral.lead_data.first_name} ${referral.lead_data.last_name} submitted through your referral link ${referral_code}`
    });

    return Response.json({ 
      success: true, 
      student_id: studentProfile.id 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});