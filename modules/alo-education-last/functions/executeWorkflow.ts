import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { workflow_id, entity_id, entity_type, event_data } = await req.json();

    const workflow = await base44.asServiceRole.entities.WorkflowAutomation.get(workflow_id);
    
    if (!workflow.is_active) {
      return Response.json({ success: false, message: 'Workflow is inactive' });
    }

    // Evaluate trigger conditions
    const conditionsMet = await evaluateConditions(base44, workflow.trigger_conditions, entity_id, entity_type, event_data);
    
    if (!conditionsMet) {
      return Response.json({ success: false, message: 'Trigger conditions not met' });
    }

    // Sort actions by execution order
    const sortedActions = [...workflow.actions].sort((a, b) => a.execution_order - b.execution_order);
    
    // Group parallel vs sequential actions
    const actionGroups = [];
    let currentGroup = [];
    
    for (const action of sortedActions) {
      if (action.parallel && currentGroup.length > 0) {
        currentGroup.push(action);
      } else {
        if (currentGroup.length > 0) {
          actionGroups.push(currentGroup);
        }
        currentGroup = [action];
      }
    }
    if (currentGroup.length > 0) {
      actionGroups.push(currentGroup);
    }

    // Execute action groups
    const results = [];
    for (const group of actionGroups) {
      if (group.length === 1 || !group[0].parallel) {
        // Sequential execution
        for (const action of group) {
          const result = await executeAction(base44, action, entity_id, entity_type);
          results.push(result);
        }
      } else {
        // Parallel execution
        const groupResults = await Promise.all(
          group.map(action => executeAction(base44, action, entity_id, entity_type))
        );
        results.push(...groupResults);
      }
    }

    // Update workflow stats
    await base44.asServiceRole.entities.WorkflowAutomation.update(workflow_id, {
      execution_count: (workflow.execution_count || 0) + 1,
      last_executed: new Date().toISOString(),
      success_rate: calculateSuccessRate(results, workflow.execution_count)
    });

    return Response.json({
      success: true,
      workflow_name: workflow.name,
      actions_executed: results.length,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function evaluateConditions(base44, conditions, entityId, entityType, eventData) {
  if (!conditions || Object.keys(conditions).length === 0) return true;
  
  // Fetch entity data if needed
  let entityData = eventData;
  if (!entityData && entityId && entityType) {
    entityData = await base44.asServiceRole.entities[entityType].get(entityId);
  }
  
  // Simple condition evaluation
  for (const [key, value] of Object.entries(conditions)) {
    if (entityData[key] !== value) {
      return false;
    }
  }
  
  return true;
}

async function executeAction(base44, action, entityId, entityType) {
  try {
    // Evaluate conditional logic
    if (action.conditional_logic && !await evaluateConditions(base44, action.conditional_logic, entityId, entityType)) {
      return { action: action.action_type, status: 'skipped', reason: 'Conditions not met' };
    }

    switch (action.action_type) {
      case 'send_email':
        // Integration with email system
        return { action: 'send_email', status: 'success', recipient: action.config.to };
      
      case 'assign_task':
        const task = await base44.asServiceRole.entities.Task.create({
          title: action.config.title,
          description: action.config.description,
          assigned_to: action.config.counselor_id,
          student_id: entityType === 'StudentProfile' ? entityId : action.config.student_id,
          priority: action.config.priority || 'medium',
          due_date: calculateDueDate(action.config.due_days),
          status: 'pending'
        });
        return { action: 'assign_task', status: 'success', task_id: task.id };
      
      case 'update_field':
        await base44.asServiceRole.entities[entityType].update(entityId, action.config.updates);
        return { action: 'update_field', status: 'success' };
      
      case 'assign_counselor':
        await base44.asServiceRole.entities[entityType].update(entityId, {
          counselor_id: action.config.counselor_id
        });
        return { action: 'assign_counselor', status: 'success' };
      
      case 'update_lead_score':
        const inquiry = await base44.asServiceRole.entities.Inquiry.get(entityId);
        const newScore = (inquiry.qualification_score || 0) + action.config.score_change;
        await base44.asServiceRole.entities.Inquiry.update(entityId, {
          qualification_score: Math.max(0, Math.min(100, newScore))
        });
        return { action: 'update_lead_score', status: 'success', new_score: newScore };
      
      default:
        return { action: action.action_type, status: 'not_implemented' };
    }
  } catch (error) {
    return { action: action.action_type, status: 'error', error: error.message };
  }
}

function calculateDueDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + (days || 3));
  return date.toISOString().split('T')[0];
}

function calculateSuccessRate(results, previousCount) {
  const successCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;
  const newRate = (successCount / totalCount) * 100;
  
  // Weighted average with previous executions
  if (previousCount > 0) {
    return ((previousCount * 100) + newRate) / (previousCount + 1);
  }
  return newRate;
}