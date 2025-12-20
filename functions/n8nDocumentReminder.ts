import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Checks for missing documents and triggers n8n reminder workflow
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const webhookSecret = Deno.env.get("N8N_WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active applications
    const applications = await base44.asServiceRole.entities.Application.filter({
      status: 'documents_pending'
    });

    const reminders = [];

    for (const app of applications) {
      // Get student details
      const students = await base44.asServiceRole.entities.StudentProfile.filter({
        id: app.student_id
      });
      const student = students[0];

      if (!student) continue;

      // Get documents for this application
      const documents = await base44.asServiceRole.entities.Document.filter({
        student_id: app.student_id,
        application_id: app.id
      });

      // Required documents
      const requiredDocs = [
        'passport',
        'transcript',
        'degree_certificate',
        'english_test',
        'sop',
        'lor'
      ];

      const submittedTypes = documents.map(d => d.document_type);
      const missingDocs = requiredDocs.filter(type => !submittedTypes.includes(type));

      if (missingDocs.length > 0) {
        // Check if reminder was sent recently
        const daysSinceLastUpdate = Math.floor(
          (Date.now() - new Date(app.updated_date).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastUpdate >= 3) {
          reminders.push({
            student_name: student.first_name + ' ' + student.last_name,
            student_email: student.email,
            student_phone: student.phone,
            application_id: app.id,
            missing_documents: missingDocs,
            days_pending: daysSinceLastUpdate
          });
        }
      }
    }

    return Response.json({
      success: true,
      reminders_count: reminders.length,
      reminders: reminders
    });

  } catch (error) {
    console.error('Document reminder error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});