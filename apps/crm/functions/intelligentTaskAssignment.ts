import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { eventType, entityId, entityData } = body;

    // Handle different events
    if (eventType === 'profile_created') {
      await handleNewStudent(base44, entityId, entityData);
    } else if (eventType === 'application_status_changed') {
      await handleApplicationStatusChange(base44, entityId, entityData);
    } else if (eventType === 'document_uploaded') {
      await handleDocumentUpload(base44, entityId, entityData);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleNewStudent(base44, studentId, student) {
  // Find active workflows for profile creation
  const workflows = await base44.asServiceRole.entities.WorkflowTemplate.filter({
    trigger_type: 'profile_created',
    is_active: true
  });

  for (const workflow of workflows) {
    await base44.asServiceRole.entities.WorkflowExecution.create({
      workflow_template_id: workflow.id,
      student_id: studentId,
      status: 'pending',
      started_at: new Date().toISOString(),
      execution_log: []
    });
  }
}

async function handleApplicationStatusChange(base44, applicationId, application) {
  const workflows = await base44.asServiceRole.entities.WorkflowTemplate.filter({
    trigger_type: 'application_status_change',
    is_active: true
  });

  for (const workflow of workflows) {
    const conditions = workflow.trigger_conditions || {};
    
    // Check if status matches
    if (conditions.application_status && 
        conditions.application_status.includes(application.status)) {
      await base44.asServiceRole.entities.WorkflowExecution.create({
        workflow_template_id: workflow.id,
        student_id: application.student_id,
        application_id: applicationId,
        status: 'pending',
        started_at: new Date().toISOString(),
        execution_log: []
      });
    }
  }
}

async function handleDocumentUpload(base44, documentId, document) {
  const workflows = await base44.asServiceRole.entities.WorkflowTemplate.filter({
    trigger_type: 'document_uploaded',
    is_active: true
  });

  for (const workflow of workflows) {
    const conditions = workflow.trigger_conditions || {};
    
    if (conditions.document_types && 
        conditions.document_types.includes(document.document_type)) {
      await base44.asServiceRole.entities.WorkflowExecution.create({
        workflow_template_id: workflow.id,
        student_id: document.student_id,
        status: 'pending',
        started_at: new Date().toISOString(),
        execution_log: []
      });
    }
  }
}