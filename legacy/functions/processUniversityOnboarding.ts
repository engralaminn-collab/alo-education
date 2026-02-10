import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { onboarding_id, action, review_notes } = await req.json();

    if (!onboarding_id || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const onboarding = await base44.asServiceRole.entities.UniversityOnboarding.get(onboarding_id);
    if (!onboarding) {
      return Response.json({ error: 'Onboarding not found' }, { status: 404 });
    }

    const updateData = {
      reviewed_by: user.email,
      reviewed_date: new Date().toISOString(),
      review_notes: review_notes || '',
    };

    if (action === 'approve') {
      updateData.onboarding_status = 'approved';

      // Create University record from onboarding data
      const universityData = {
        university_name: onboarding.university_name,
        country: onboarding.country,
        city: onboarding.city,
        logo: onboarding.logo_url,
        cover_image: onboarding.cover_image_url,
        about: onboarding.about,
        website_url: onboarding.website,
        entry_requirements_summary: onboarding.admission_requirements_summary,
        scholarships_summary: onboarding.scholarship_details || '',
        intakes: onboarding.intake_dates?.join(', ') || '',
        application_deadline: onboarding.application_deadline,
        show_on_country_page: true,
        status: 'active',
      };

      const university = await base44.asServiceRole.entities.University.create(universityData);

      // Create UniversityPartner record for access
      const partnerData = {
        university_id: university.id,
        partner_email: onboarding.primary_contact_email,
        partner_name: onboarding.primary_contact_name,
        contact_phone: onboarding.primary_contact_phone,
        role: 'admissions_officer',
        is_active: true,
        verified: true,
        notifications_enabled: true,
      };

      await base44.asServiceRole.entities.UniversityPartner.create(partnerData);

      // Send approval email
      await base44.integrations.Core.SendEmail({
        to: onboarding.primary_contact_email,
        subject: `Welcome to ALO Education - ${onboarding.university_name} Approved`,
        body: `
Dear ${onboarding.primary_contact_name},

Congratulations! Your onboarding application for ${onboarding.university_name} has been approved.

You can now:
- Access your University Partner Portal
- Manage your course listings
- View student applications
- Communicate with ALO counselors

Login credentials have been sent separately. For support, contact our team at info@aloeducation.com

Best regards,
ALO Education Team
        `
      });

    } else if (action === 'reject') {
      updateData.onboarding_status = 'rejected';

      // Send rejection email
      await base44.integrations.Core.SendEmail({
        to: onboarding.primary_contact_email,
        subject: `ALO Education Onboarding - ${onboarding.university_name}`,
        body: `
Dear ${onboarding.primary_contact_name},

Thank you for your interest in joining ALO Education as a partner university.

After reviewing your application, we have decided not to proceed at this time.

Reason: ${review_notes || 'Does not meet current partnership criteria'}

You may reapply in the future. If you have questions, please contact info@aloeducation.com

Best regards,
ALO Education Team
        `
      });
    } else if (action === 'under_review') {
      updateData.onboarding_status = 'under_review';
    }

    await base44.asServiceRole.entities.UniversityOnboarding.update(onboarding_id, updateData);

    return Response.json({
      success: true,
      message: `Onboarding ${action}ed successfully`,
      action: action,
    });
  } catch (error) {
    console.error('Error processing onboarding:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});