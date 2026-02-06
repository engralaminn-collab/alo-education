import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Only process status changes
    if (!old_data || data.status === old_data.status) {
      return Response.json({ message: 'No status change detected' });
    }

    const application = data;
    const previousStatus = old_data.status;
    const newStatus = data.status;

    // Get student info
    const students = await base44.asServiceRole.entities.StudentProfile.filter({ 
      id: application.student_id 
    });
    const student = students[0];

    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get course and university info
    const courses = await base44.asServiceRole.entities.Course.filter({ id: application.course_id });
    const course = courses[0];
    
    const universities = await base44.asServiceRole.entities.University.filter({ id: application.university_id });
    const university = universities[0];

    const courseName = course?.course_title || 'Your course';
    const universityName = university?.university_name || 'the university';

    // Log status change
    await base44.asServiceRole.entities.ApplicationStatusUpdate.create({
      application_id: application.id,
      previous_status: previousStatus,
      new_status: newStatus,
      update_source: 'manual',
      auto_detected: false,
      notification_sent_student: false,
      notification_sent_counselor: false
    });

    // Determine message based on new status
    let studentMessage = '';
    let priority = 'medium';

    switch(newStatus) {
      case 'submitted_to_university':
        studentMessage = `Your application for ${courseName} at ${universityName} has been submitted!`;
        priority = 'high';
        break;
      case 'under_review':
        studentMessage = `Your application for ${courseName} is now under review by ${universityName}.`;
        break;
      case 'conditional_offer':
        studentMessage = `🎉 Congratulations! You've received a conditional offer from ${universityName} for ${courseName}!`;
        priority = 'high';
        break;
      case 'unconditional_offer':
        studentMessage = `🎉 Excellent news! You've received an unconditional offer from ${universityName} for ${courseName}!`;
        priority = 'urgent';
        break;
      case 'rejected':
        studentMessage = `Your application to ${universityName} for ${courseName} was not successful this time. Your counselor will help you explore other options.`;
        priority = 'high';
        break;
      case 'enrolled':
        studentMessage = `🎓 Welcome! You're now enrolled at ${universityName} for ${courseName}. Your journey begins!`;
        priority = 'urgent';
        break;
      default:
        studentMessage = `Application status updated to: ${newStatus.replace(/_/g, ' ')}`;
    }

    // Send notification to student
    await base44.asServiceRole.entities.Notification.create({
      student_id: student.id,
      type: 'application',
      title: `Application Status Update`,
      message: studentMessage,
      priority,
      link: `/StudentPortal?tab=applications`
    });

    // Send notification to counselor
    if (student.counselor_id) {
      await base44.asServiceRole.entities.Notification.create({
        counselor_id: student.counselor_id,
        type: 'application',
        title: `Status Changed: ${student.first_name} ${student.last_name}`,
        message: `Application status: ${previousStatus} → ${newStatus}`,
        priority: ['conditional_offer', 'unconditional_offer', 'rejected', 'enrolled'].includes(newStatus) ? 'high' : 'medium',
        link: `/CRMStudentProfile?id=${student.id}`
      });
    }

    // Send email to student
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: student.email,
      subject: `Application Status Update - ${universityName}`,
      body: `
Dear ${student.first_name},

${studentMessage}

Course: ${courseName}
University: ${universityName}
New Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}

${newStatus === 'conditional_offer' || newStatus === 'unconditional_offer' ? 
  'Please check your student portal for offer details and next steps.' : 
  'Login to your student portal for more information.'}

Best regards,
ALO Education Team
      `
    });

    return Response.json({
      success: true,
      message: 'Notifications sent',
      status_change: `${previousStatus} → ${newStatus}`
    });

  } catch (error) {
    console.error('Error in status change notification:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});