import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, universityIds, emailTemplate, emailSubject } = await req.json();

    if (!studentId || !universityIds || universityIds.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch student profile
    const student = await base44.entities.StudentProfile.filter({ id: studentId });
    if (!student || student.length === 0) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentData = student[0];

    // Create outreach records for each university
    const outreachPromises = universityIds.map(async (universityId) => {
      // Fetch university
      const universities = await base44.entities.University.filter({ id: universityId });
      const university = universities[0];

      if (!university) return null;

      // Personalize email content
      const personalizedBody = emailTemplate
        .replace('{{STUDENT_NAME}}', studentData.first_name || 'Student')
        .replace('{{STUDENT_EMAIL}}', studentData.email)
        .replace('{{STUDENT_PHONE}}', studentData.phone || 'Not provided')
        .replace('{{UNIVERSITY_NAME}}', university.university_name)
        .replace('{{STUDENT_INTERESTS}}', studentData.preferred_fields?.join(', ') || 'Multiple fields');

      // Send email to university
      await base44.integrations.Core.SendEmail({
        to: university.website_url ? 'admissions@' + new URL(university.website_url).hostname : 'info@example.com',
        subject: emailSubject.replace('{{UNIVERSITY_NAME}}', university.university_name),
        body: personalizedBody,
        from_name: 'ALO Education'
      });

      // Create outreach record
      const outreach = await base44.entities.UniversityOutreach.create({
        student_id: studentId,
        university_id: universityId,
        outreach_type: 'application_inquiry',
        email_subject: emailSubject.replace('{{UNIVERSITY_NAME}}', university.university_name),
        email_body: personalizedBody,
        sent_date: new Date().toISOString(),
        automated: true,
        status: 'sent'
      });

      return outreach;
    });

    const results = await Promise.all(outreachPromises);
    const successful = results.filter(r => r !== null);

    return Response.json({
      success: true,
      sent: successful.length,
      total: universityIds.length,
      outreach_records: successful
    });
  } catch (error) {
    console.error('Outreach error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});