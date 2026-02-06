import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailSubject, emailBody, emailFrom, studentEmail } = await req.json();

    // Find student profile
    const students = await base44.asServiceRole.entities.StudentProfile.filter({ email: studentEmail });
    const student = students[0];

    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get student's applications
    const applications = await base44.asServiceRole.entities.Application.filter({ 
      student_id: student.id 
    });

    // Use AI to parse email and detect status
    const analysisPrompt = `
Analyze this email from a university and extract application status information:

Subject: ${emailSubject}
From: ${emailFrom}
Body: ${emailBody}

Student has these active applications:
${applications.map(app => `- Application ID: ${app.id}, University: ${app.university_id}, Course: ${app.course_id}`).join('\n')}

Extract:
1. Which application this email is about (match by university/course if possible)
2. Current status: draft, documents_pending, under_review, submitted_to_university, conditional_offer, unconditional_offer, visa_processing, enrolled, rejected, withdrawn
3. Any reference numbers mentioned
4. Key details (deadlines, requirements, next steps)
5. Confidence level (0-100) in the status detection

Return JSON with: application_id, status, reference_number, details, confidence, keywords_found
`;

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          application_id: { type: "string" },
          status: { type: "string" },
          reference_number: { type: "string" },
          details: { type: "object" },
          confidence: { type: "number" },
          keywords_found: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (!analysis.application_id || !analysis.status) {
      return Response.json({ 
        success: false, 
        message: 'Could not extract status from email',
        analysis 
      });
    }

    // Get the application
    const application = applications.find(a => a.id === analysis.application_id);
    if (!application) {
      return Response.json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    // Only proceed if confidence is high enough and status changed
    if (analysis.confidence < 70) {
      return Response.json({ 
        success: false, 
        message: 'Low confidence in status detection',
        confidence: analysis.confidence,
        suggested_status: analysis.status
      });
    }

    const previousStatus = application.status;
    const newStatus = analysis.status;

    // Check if status actually changed
    if (previousStatus === newStatus) {
      return Response.json({ 
        success: true, 
        message: 'Status unchanged',
        status: newStatus
      });
    }

    // Update application status
    await base44.asServiceRole.entities.Application.update(application.id, {
      status: newStatus
    });

    // Log status update
    const statusUpdate = await base44.asServiceRole.entities.ApplicationStatusUpdate.create({
      application_id: application.id,
      previous_status: previousStatus,
      new_status: newStatus,
      update_source: 'email',
      detected_from_email: `${emailSubject}\n\n${emailBody.substring(0, 500)}`,
      university_reference: analysis.reference_number,
      confidence_score: analysis.confidence,
      extracted_details: analysis.details,
      auto_detected: true,
      notification_sent_student: false,
      notification_sent_counselor: false
    });

    // Create notifications for student
    await base44.asServiceRole.entities.Notification.create({
      student_id: student.id,
      type: 'application',
      title: `Application Status Updated: ${newStatus.replace(/_/g, ' ')}`,
      message: `Your application status has been automatically updated to "${newStatus.replace(/_/g, ' ')}". Check your portal for details.`,
      priority: ['conditional_offer', 'unconditional_offer', 'rejected'].includes(newStatus) ? 'high' : 'medium',
      link: `/StudentPortal?tab=applications`
    });

    // Create notification for counselor
    if (student.counselor_id) {
      await base44.asServiceRole.entities.Notification.create({
        counselor_id: student.counselor_id,
        type: 'application',
        title: `Student Application Status Changed: ${student.first_name} ${student.last_name}`,
        message: `Application status updated from "${previousStatus}" to "${newStatus}" (Auto-detected)`,
        priority: 'medium'
      });
    }

    // Send email notifications
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: student.email,
      subject: `Application Status Update: ${newStatus.replace(/_/g, ' ')}`,
      body: `
Dear ${student.first_name},

Great news! Your application status has been updated.

New Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}
${analysis.reference_number ? `Reference: ${analysis.reference_number}` : ''}

${analysis.details?.next_steps ? `Next Steps: ${analysis.details.next_steps}` : ''}

Login to your student portal to view full details: ${Deno.env.get('BASE44_APP_URL') || 'https://your-app.base44.app'}/StudentPortal

Best regards,
ALO Education Team
      `
    });

    // Mark notifications as sent
    await base44.asServiceRole.entities.ApplicationStatusUpdate.update(statusUpdate.id, {
      notification_sent_student: true,
      notification_sent_counselor: true
    });

    return Response.json({
      success: true,
      message: 'Status updated and notifications sent',
      previous_status: previousStatus,
      new_status: newStatus,
      confidence: analysis.confidence,
      application_id: application.id,
      status_update_id: statusUpdate.id
    });

  } catch (error) {
    console.error('Error parsing application email:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});