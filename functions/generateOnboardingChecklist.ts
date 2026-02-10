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

    const country = student.preferred_countries?.[0] || 'General';
    const degreeLevel = student.preferred_degree_level || 'Undergraduate';

    // Base checklist items
    const baseItems = [
      { title: 'Complete Personal Information', description: 'Fill in all personal details', category: 'profile', required: true, order: 1 },
      { title: 'Add Contact Information', description: 'Email, phone, and emergency contacts', category: 'profile', required: true, order: 2 },
      { title: 'Upload Passport Copy', description: 'Valid passport required', category: 'documents', required: true, order: 3 },
      { title: 'Add Academic History', description: 'Previous education details', category: 'profile', required: true, order: 4 },
      { title: 'Upload Academic Transcripts', description: 'All previous degree transcripts', category: 'documents', required: true, order: 5 },
      { title: 'English Proficiency Test', description: 'IELTS/TOEFL/PTE score', category: 'tests', required: true, order: 6 }
    ];

    // Country-specific items
    const countryItems = {
      'UK': [
        { title: 'UK Visa Requirements', description: 'Review UK student visa requirements', category: 'visa', required: true, order: 10 },
        { title: 'NHS Surcharge', description: 'Prepare for healthcare surcharge payment', category: 'visa', required: true, order: 11 }
      ],
      'USA': [
        { title: 'F-1 Visa Documentation', description: 'Gather F-1 visa application documents', category: 'visa', required: true, order: 10 },
        { title: 'SEVIS Fee Payment', description: 'Complete SEVIS I-901 fee payment', category: 'visa', required: true, order: 11 }
      ],
      'Canada': [
        { title: 'Study Permit Requirements', description: 'Review Canadian study permit requirements', category: 'visa', required: true, order: 10 },
        { title: 'Biometrics Appointment', description: 'Schedule biometrics appointment', category: 'visa', required: true, order: 11 }
      ],
      'Australia': [
        { title: 'Student Visa (Subclass 500)', description: 'Prepare Australia student visa documents', category: 'visa', required: true, order: 10 },
        { title: 'OSHC Insurance', description: 'Overseas Student Health Cover', category: 'visa', required: true, order: 11 }
      ]
    };

    // Degree-specific items
    const degreeItems = {
      'Postgraduate': [
        { title: 'Work Experience Documentation', description: 'Letters of recommendation and work certificates', category: 'documents', required: false, order: 7 },
        { title: 'Statement of Purpose', description: 'Write detailed SOP for postgraduate admission', category: 'documents', required: true, order: 8 },
        { title: 'Research Proposal', description: 'For research-based programs', category: 'documents', required: false, order: 9 }
      ],
      'PhD': [
        { title: 'Research Proposal', description: 'Detailed research proposal', category: 'documents', required: true, order: 7 },
        { title: 'Publications List', description: 'Previous research publications', category: 'documents', required: false, order: 8 }
      ]
    };

    let checklistItems = [...baseItems];

    if (countryItems[country]) {
      checklistItems = [...checklistItems, ...countryItems[country]];
    }

    if (degreeItems[degreeLevel]) {
      checklistItems = [...checklistItems, ...degreeItems[degreeLevel]];
    }

    // Final items
    checklistItems.push(
      { title: 'Financial Documents', description: 'Bank statements and sponsorship letters', category: 'documents', required: true, order: 12 },
      { title: 'Submit Applications', description: 'Complete university applications', category: 'application', required: true, order: 13 }
    );

    // Create checklist
    const checklist = await base44.asServiceRole.entities.OnboardingChecklist.create({
      student_id,
      destination_country: country,
      degree_level: degreeLevel,
      checklist_items: checklistItems,
      completion_percentage: 0
    });

    return Response.json({ success: true, checklist });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});