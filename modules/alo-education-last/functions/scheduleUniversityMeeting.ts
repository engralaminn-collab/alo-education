import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      studentId,
      universityId,
      meetingType, // 'virtual_meeting' or 'campus_tour'
      preferredDate,
      preferredTime,
      notes
    } = await req.json();

    if (!studentId || !universityId || !meetingType || !preferredDate) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch student and university
    const students = await base44.entities.StudentProfile.filter({ id: studentId });
    const universities = await base44.entities.University.filter({ id: universityId });

    if (!students[0] || !universities[0]) {
      return Response.json({ error: 'Student or University not found' }, { status: 404 });
    }

    const student = students[0];
    const university = universities[0];

    // Create appointment
    const appointment = await base44.entities.Appointment.create({
      student_id: studentId,
      title: `${meetingType === 'virtual_meeting' ? 'Virtual Meeting' : 'Campus Tour'} - ${university.university_name}`,
      description: `${meetingType === 'virtual_meeting' ? 'Virtual meeting' : 'Campus tour'} with ${university.university_name}. ${notes || ''}`,
      appointment_date: new Date(`${preferredDate}T${preferredTime || '10:00'}`).toISOString(),
      duration_minutes: meetingType === 'virtual_meeting' ? 60 : 120,
      status: 'scheduled'
    });

    // Create task for follow-up
    const task = await base44.entities.Task.create({
      title: `Confirm ${meetingType === 'virtual_meeting' ? 'Virtual Meeting' : 'Campus Tour'} with ${university.university_name}`,
      description: `Student ${student.first_name} ${student.last_name} has requested a ${meetingType === 'virtual_meeting' ? 'virtual meeting' : 'campus tour'}. Please confirm with the student and university.`,
      type: meetingType === 'virtual_meeting' ? 'interview_prep' : 'other',
      student_id: studentId,
      assigned_to: user.id,
      status: 'pending',
      priority: 'high',
      due_date: preferredDate
    });

    // Send confirmation email to student
    await base44.integrations.Core.SendEmail({
      to: student.email,
      subject: `${meetingType === 'virtual_meeting' ? 'Virtual Meeting' : 'Campus Tour'} Request Confirmed - ${university.university_name}`,
      body: `Hi ${student.first_name},\n\nYour request for a ${meetingType === 'virtual_meeting' ? 'virtual meeting' : 'campus tour'} with ${university.university_name} has been received.\n\nScheduled for: ${preferredDate} at ${preferredTime || '10:00 AM'}\n\nOur team will confirm the details shortly.\n\nBest regards,\nALO Education Team`,
      from_name: 'ALO Education'
    });

    return Response.json({
      success: true,
      appointment,
      task,
      message: 'Meeting scheduled successfully'
    });
  } catch (error) {
    console.error('Meeting scheduling error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});