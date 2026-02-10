import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    const { student_id, sequence_type = 'welcome' } = payload;

    if (!student_id) {
      return Response.json({ error: 'student_id required' }, { status: 400 });
    }

    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // Define email sequences based on type
    const sequences = {
      welcome: {
        subject: `Welcome to ALO Education, ${student.first_name}!`,
        body: `
          <h2>Welcome to ALO Education!</h2>
          <p>Dear ${student.first_name},</p>
          <p>We're excited to help you achieve your study abroad dreams. Here's what happens next:</p>
          <ol>
            <li>Complete your profile with academic and personal information</li>
            <li>Upload required documents (transcripts, passport, etc.)</li>
            <li>Book a consultation with your assigned counselor</li>
            <li>Explore universities and courses that match your goals</li>
          </ol>
          <p>Your counselor will reach out within 24-48 hours to guide you through the process.</p>
          <p>Best regards,<br/>The ALO Education Team</p>
        `
      },
      profile_incomplete: {
        subject: `${student.first_name}, Complete Your Profile - Important`,
        body: `
          <h2>Complete Your Profile</h2>
          <p>Hi ${student.first_name},</p>
          <p>We noticed your profile is incomplete. To provide the best recommendations, please complete:</p>
          <ul>
            <li>Academic history and qualifications</li>
            <li>English proficiency test scores</li>
            <li>Preferred study destinations and fields</li>
            <li>Budget and funding information</li>
          </ul>
          <p>This will help us match you with the perfect universities!</p>
        `
      },
      document_reminder: {
        subject: `Document Upload Reminder - Action Required`,
        body: `
          <h2>Document Upload Required</h2>
          <p>Hi ${student.first_name},</p>
          <p>To proceed with your applications, please upload the following documents:</p>
          <ul>
            <li>Academic transcripts</li>
            <li>Passport copy</li>
            <li>English test scores (IELTS/PTE/TOEFL)</li>
            <li>Statement of Purpose (if available)</li>
          </ul>
          <p>Once uploaded, our team will verify them within 2 business days.</p>
        `
      },
      application_submitted: {
        subject: `Your Application Has Been Submitted!`,
        body: `
          <h2>Application Submitted Successfully</h2>
          <p>Great news, ${student.first_name}!</p>
          <p>Your application has been submitted to the university. Here's what to expect:</p>
          <ul>
            <li>University review: 2-4 weeks</li>
            <li>We'll notify you as soon as we hear back</li>
            <li>Your counselor is monitoring progress</li>
          </ul>
          <p>Stay tuned for updates!</p>
        `
      },
      offer_received: {
        subject: `🎉 Congratulations! You've Received an Offer`,
        body: `
          <h2>Congratulations on Your Offer!</h2>
          <p>Fantastic news, ${student.first_name}!</p>
          <p>You've received an offer letter. Next steps:</p>
          <ol>
            <li>Review the offer details with your counselor</li>
            <li>Accept the offer if you're ready</li>
            <li>Pay tuition deposit (if required)</li>
            <li>Begin visa application process</li>
          </ol>
          <p>Your counselor will schedule a call to discuss the offer.</p>
        `
      }
    };

    const emailContent = sequences[sequence_type];
    if (!emailContent) {
      return Response.json({ error: 'Invalid sequence type' }, { status: 400 });
    }

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'ALO Education',
      to: student.email,
      subject: emailContent.subject,
      body: emailContent.body
    });

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      recipient_id: student_id,
      type: 'message',
      title: emailContent.subject,
      message: 'Check your email for important information',
      priority: 'normal'
    });

    return Response.json({ 
      success: true, 
      message: `${sequence_type} email sent to ${student.email}` 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});