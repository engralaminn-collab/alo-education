import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function WorkflowExecutionEngine() {
  const { data: workflows = [] } = useQuery({
    queryKey: ['active-workflows'],
    queryFn: () => base44.entities.WorkflowTemplate.filter({ is_active: true }),
    refetchInterval: 60000, // Check every minute
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-workflows'],
    queryFn: () => base44.entities.StudentProfile.list('-updated_date', 200),
    refetchInterval: 60000,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-for-workflows'],
    queryFn: () => base44.entities.Application.list('-updated_date', 200),
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!workflows.length || !students.length) return;

    const executeWorkflows = async () => {
      for (const workflow of workflows) {
        for (const student of students) {
          // Check if trigger conditions are met
          let shouldExecute = false;
          let triggerData = {};

          if (workflow.trigger_type === 'lead_score_threshold') {
            const leadScore = (student.lead_score_adjustment || 0);
            if (leadScore >= (workflow.trigger_config?.lead_score_min || 0)) {
              shouldExecute = true;
              triggerData = { lead_score: leadScore };
            }
          }

          if (workflow.trigger_type === 'application_stage_change') {
            const studentApps = applications.filter(a => a.student_id === student.id);
            const targetStage = workflow.trigger_config?.application_stage;
            if (studentApps.some(a => a.status === targetStage)) {
              shouldExecute = true;
              triggerData = { stage: targetStage };
            }
          }

          if (shouldExecute) {
            // Check if already executed recently
            const recentExecutions = await base44.entities.WorkflowExecution.filter({
              workflow_template_id: workflow.id,
              student_id: student.id,
            });

            // Only execute once per student per workflow
            if (recentExecutions.length > 0) continue;

            // Execute workflow actions
            await executeWorkflowActions(workflow, student, triggerData);
          }
        }
      }
    };

    executeWorkflows();
  }, [workflows.length, students.length, applications.length]);

  const executeWorkflowActions = async (workflow, student, triggerData) => {
    try {
      // Create execution record
      const execution = await base44.entities.WorkflowExecution.create({
        workflow_template_id: workflow.id,
        student_id: student.id,
        trigger_data: triggerData,
        status: 'in_progress',
      });

      let actionsCompleted = 0;

      for (const action of workflow.actions || []) {
        try {
          if (action.type === 'send_email' && student.email) {
            await base44.integrations.Core.SendEmail({
              to: student.email,
              subject: action.config?.subject || 'Update from ALO Education',
              body: action.config?.body || 'Hello',
            });
            actionsCompleted++;
          }

          if (action.type === 'create_task' && student.counselor_id) {
            await base44.entities.Task.create({
              title: action.config?.title || 'Follow up',
              description: `Automated task for ${student.first_name} ${student.last_name}`,
              student_id: student.id,
              assigned_to: student.counselor_id,
              priority: action.config?.priority || 'medium',
              status: 'pending',
              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
            actionsCompleted++;
          }

          if (action.type === 'update_status') {
            await base44.entities.StudentProfile.update(student.id, {
              status: action.config?.new_status || student.status,
            });
            actionsCompleted++;
          }

          if (action.type === 'create_notification' && student.counselor_id) {
            await base44.entities.Notification.create({
              user_id: student.counselor_id,
              type: 'application_stage_change',
              title: action.config?.title || 'Workflow Alert',
              message: action.config?.message || `Workflow triggered for ${student.first_name}`,
              priority: 'medium',
            });
            actionsCompleted++;
          }
        } catch (err) {
          console.error('Action failed:', err);
        }
      }

      // Update execution record
      await base44.entities.WorkflowExecution.update(execution.id, {
        status: 'completed',
        actions_completed: actionsCompleted,
      });
    } catch (error) {
      console.error('Workflow execution failed:', error);
    }
  };

  return null; // Background component
}