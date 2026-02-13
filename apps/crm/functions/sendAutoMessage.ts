import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { student_id, message_type, metadata = {} } = payload;

    if (!student_id || !message_type) {
      return Response.json({ error: 'student_id and message_type required' }, { status: 400 });
    }

    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get counselor if assigned
    let counselor = null;
    if (student.counselor_id) {
      counselor = await base44.asServiceRole.entities.Counselor.get(student.counselor_id);
    }

    // Message templates
    const templates = {
      lead_received: {
        email_subject: 'Thank you for contacting ALO Education',
        email_body: `Dear ${student.first_name || 'Student'},\n\nThank you for your interest in studying abroad with ALO Education. One of our expert counsellors will contact you shortly to guide you through the next steps.\n\nBest regards,\nALO Education Team`,
        whatsapp: `Hello ${student.first_name}, thank you for contacting ALO Education. Our counsellor will reach out to you shortly to assist with your study abroad plans.`
      },
      counselling_assigned: {
        whatsapp: `Hello ${student.first_name}, your counsellor ${counselor?.name || 'from our team'} has been assigned to your case. We look forward to guiding you through your admission process.`
      },
      application_submitted: {
        email_subject: 'Your University Application Has Been Submitted',
        email_body: `Dear ${student.first_name},\n\nYour application to ${metadata.university_name || 'the university'} for ${metadata.course_name || 'your chosen course'} has been successfully submitted. We will update you once we receive a response.\n\nRegards,\nALO Education`,
        whatsapp: `Hi ${student.first_name}, your application to ${metadata.university_name || 'the university'} has been submitted successfully. We'll keep you updated.`
      },
      offer_received: {
        email_subject: '🎉 Congratulations! University Offer Received',
        email_body: `Dear ${student.first_name},\n\nCongratulations! You have received an offer from ${metadata.university_name || 'the university'}. Please check your Student Portal for details.\n\nBest regards,\nALO Education Team`,
        whatsapp: `Congratulations ${student.first_name} 🎉\nYou have received an offer from ${metadata.university_name || 'the university'}. Please check your Student Portal for details.`
      },
      cas_issued: {
        email_subject: 'CAS Issued – Next Step: Visa Application',
        email_body: `Dear ${student.first_name},\n\nYour CAS has been issued by ${metadata.university_name || 'the university'}. Our visa team will now guide you through the visa application process.\n\nRegards,\nALO Education`,
        whatsapp: `Hi ${student.first_name}, your CAS has been issued by ${metadata.university_name}. Our visa team will guide you through the next steps.`
      },
      visa_approved: {
        email_subject: '🎉 Visa Approved - Welcome to Your Study Abroad Journey!',
        email_body: `Dear ${student.first_name},\n\nCongratulations! Your visa has been approved. Welcome to your study abroad journey with ALO Education!\n\nWe wish you all the best in your studies.\n\nBest regards,\nALO Education Team`,
        whatsapp: `Congratulations ${student.first_name} 🎉\nYour visa has been approved. Welcome to your study abroad journey with ALO Education!`
      }
    };

    const template = templates[message_type];
    if (!template) {
      return Response.json({ error: 'Invalid message type' }, { status: 400 });
    }

    const results = { email: null, whatsapp: null };

    // Send email if template has email
    if (template.email_subject && template.email_body) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'ALO Education',
          to: student.email,
          subject: template.email_subject,
          body: template.email_body
        });
        results.email = 'sent';
      } catch (error) {
        results.email = 'failed: ' + error.message;
      }
    }

    // Log WhatsApp message (actual sending would require WhatsApp Business API)
    if (template.whatsapp) {
      try {
        await base44.asServiceRole.entities.WhatsAppMessage.create({
          student_id,
          phone: student.phone,
          message: template.whatsapp,
          type: message_type,
          status: 'pending'
        });
        results.whatsapp = 'queued';
      } catch (error) {
        results.whatsapp = 'failed: ' + error.message;
      }
    }

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      recipient_id: student_id,
      type: 'message',
      title: template.email_subject || 'New Message',
      message: 'You have received an automated message. Check your email.',
      priority: 'normal'
    });

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});