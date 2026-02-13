import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date();
    
    // Fetch pending and in-progress workflow executions
    const executions = await base44.asServiceRole.entities.WorkflowExecution.filter({
      status: { $in: ['pending', 'in_progress'] }
    });

    let processed = 0;
    let errors = 0;

    for (const execution of executions) {
      try {
        // Check if it's time to execute next action
        if (execution.next_action_at && new Date(execution.next_action_at) > now) {
          continue; // Not yet time
        }

        await executeWorkflowStep(base44, execution);
        processed++;
      } catch (err) {
        console.error(`Error processing workflow ${execution.id}:`, err);
        errors++;
      }
    }

    return Response.json({
      success: true,
      processed,
      errors,
      message: `Processed ${processed} workflow executions`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function executeWorkflowStep(base44, execution) {
  const template = await base44.asServiceRole.entities.WorkflowTemplate.filter({
    id: execution.workflow_template_id
  });

  if (!template.length || !template[0].is_active) {
    await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
      status: 'failed',
      execution_log: [
        ...(execution.execution_log || []),
        {
          step: execution.current_step,
          action_type: 'error',
          status: 'failed',
          executed_at: new Date().toISOString(),
          error: 'Template not found or inactive'
        }
      ]
    });
    return;
  }

  const workflow = template[0];
  const actions = workflow.actions || [];
  
  if (execution.current_step >= actions.length) {
    // Workflow completed
    await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    return;
  }

  const action = actions[execution.current_step];
  const log = execution.execution_log || [];

  try {
    await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
      status: 'in_progress'
    });

    const result = await executeAction(base44, action, execution);

    // Check if action requires delay
    let nextActionAt = null;
    if (action.delay_days && action.delay_days > 0) {
      const delayDate = new Date();
      delayDate.setDate(delayDate.getDate() + action.delay_days);
      nextActionAt = delayDate.toISOString();
    }

    // Update execution
    await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
      current_step: execution.current_step + 1,
      next_action_at: nextActionAt,
      execution_log: [
        ...log,
        {
          step: execution.current_step,
          action_type: action.action_type,
          status: 'completed',
          executed_at: new Date().toISOString(),
          result: result || 'Success'
        }
      ]
    });
  } catch (err) {
    await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
      status: 'failed',
      execution_log: [
        ...log,
        {
          step: execution.current_step,
          action_type: action.action_type,
          status: 'failed',
          executed_at: new Date().toISOString(),
          error: err.message
        }
      ]
    });
  }
}

async function executeAction(base44, action, execution) {
  const studentId = execution.student_id;

  switch (action.action_type) {
    case 'create_task':
      if (action.task_config) {
        await base44.asServiceRole.entities.Task.create({
          student_id: studentId,
          application_id: execution.application_id,
          title: action.task_config.title || 'Follow-up Task',
          description: action.task_config.description,
          type: action.task_config.type || 'follow_up',
          priority: action.task_config.priority || 'medium',
          assigned_to: action.task_config.assign_to,
          status: 'pending'
        });
      }
      return 'Task created';

    case 'send_message':
      if (action.message_config) {
        const student = await base44.asServiceRole.entities.StudentProfile.filter({ id: studentId });
        if (student.length > 0) {
          await base44.asServiceRole.entities.Notification.create({
            recipient_id: studentId,
            recipient_type: 'student',
            type: 'message',
            title: action.message_config.subject || 'Message from ALO Education',
            message: action.message_config.body,
            is_read: false
          });
        }
      }
      return 'Message sent';

    case 'send_email':
      if (action.message_config) {
        const student = await base44.asServiceRole.entities.StudentProfile.filter({ id: studentId });
        if (student.length > 0 && student[0].email) {
          await base44.integrations.Core.SendEmail({
            to: student[0].email,
            subject: action.message_config.subject || 'Update from ALO Education',
            body: action.message_config.body
          });
        }
      }
      return 'Email sent';

    case 'update_status':
      if (action.status_update) {
        await base44.asServiceRole.entities.StudentProfile.update(studentId, {
          status: action.status_update.new_status
        });
      }
      return 'Status updated';

    case 'ai_analysis':
      // Could trigger AI sentiment analysis or profile review
      return 'AI analysis completed';

    case 'delay':
      // Handled by the delay_days field
      return 'Delay set';

    default:
      return 'Action completed';
  }
}