import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { student_id } = payload;

    if (!student_id) {
      return Response.json({ error: 'student_id required' }, { status: 400 });
    }

    const student = await base44.asServiceRole.entities.StudentProfile.get(student_id);
    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get all counselors
    const counselors = await base44.asServiceRole.entities.Counselor.list();
    const allStudents = await base44.asServiceRole.entities.StudentProfile.list();

    // Filter active counselors
    const activeCounselors = counselors.filter(c => c.is_available && c.status === 'active');

    if (activeCounselors.length === 0) {
      return Response.json({ error: 'No available counselors' }, { status: 400 });
    }

    let bestCounselor = null;
    let bestScore = -1;

    for (const counselor of activeCounselors) {
      let score = 0;

      // Check specialization match
      const studentCountry = student.preferred_countries?.[0];
      if (studentCountry && counselor.specializations?.includes(studentCountry)) {
        score += 50;
      }

      // Check current workload
      const counselorStudents = allStudents.filter(s => s.counselor_id === counselor.id);
      const workloadRatio = counselorStudents.length / (counselor.max_students || 50);
      score += (1 - workloadRatio) * 30;

      // Check success rate
      if (counselor.success_rate) {
        score += counselor.success_rate * 0.2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestCounselor = counselor;
      }
    }

    if (!bestCounselor) {
      return Response.json({ error: 'Could not assign counselor' }, { status: 400 });
    }

    // Assign counselor to student
    await base44.asServiceRole.entities.StudentProfile.update(student_id, {
      counselor_id: bestCounselor.id,
      status: 'contacted'
    });

    // Update counselor's current student count
    await base44.asServiceRole.entities.Counselor.update(bestCounselor.id, {
      current_students: (bestCounselor.current_students || 0) + 1
    });

    // Send notification
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'ALO Education',
      to: student.email,
      subject: 'Your Counselor Has Been Assigned',
      body: `Dear ${student.first_name},\n\nYour counselor ${bestCounselor.name} has been assigned to guide you through your study abroad journey.\n\nBest regards,\nALO Education`
    });

    return Response.json({ 
      success: true, 
      assigned_counselor: bestCounselor.name,
      counselor_id: bestCounselor.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});