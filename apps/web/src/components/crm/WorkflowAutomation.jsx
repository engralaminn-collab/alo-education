import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Play, Pause, Edit, Trash2, Zap } from 'lucide-react';

const triggerTypes = [
  { value: 'profile_created', label: 'New Profile Created' },
  { value: 'profile_completeness_threshold', label: 'Profile Completeness Threshold' },
  { value: 'application_status_change', label: 'Application Status Changed' },
  { value: 'document_uploaded', label: 'Document Uploaded' },
  { value: 'document_rejected', label: 'Document Rejected' }
];

const actionTypes = [
  { value: 'create_task', label: 'Create Task' },
  { value: 'send_message', label: 'Send In-App Message' },
  { value: 'send_email', label: 'Send Email' },
  { value: 'update_status', label: 'Update Student Status' },
  { value: 'delay', label: 'Wait/Delay' }
];

export default function WorkflowAutomation() {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const queryClient = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.WorkflowTemplate.list()
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  const createWorkflow = useMutation({
    mutationFn: (data) => base44.entities.WorkflowTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setShowForm(false);
      setFormData(getDefaultFormData());
      toast.success('Workflow created successfully');
    }
  });

  const updateWorkflow = useMutation({
    mutationFn: (data) => base44.entities.WorkflowTemplate.update(editingWorkflow.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setEditingWorkflow(null);
      setShowForm(false);
      setFormData(getDefaultFormData());
      toast.success('Workflow updated');
    }
  });

  const deleteWorkflow = useMutation({
    mutationFn: (id) => base44.entities.WorkflowTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow deleted');
    }
  });

  const toggleWorkflow = useMutation({
    mutationFn: (workflow) => base44.entities.WorkflowTemplate.update(workflow.id, {
      is_active: !workflow.is_active
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  const handleSave = () => {
    if (!formData.name || !formData.trigger_type || formData.actions.length === 0) {
      toast.error('Please fill in all required fields and add at least one action');
      return;
    }

    if (editingWorkflow) {
      updateWorkflow.mutate(formData);
    } else {
      createWorkflow.mutate(formData);
    }
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, getDefaultAction()]
    });
  };

  const updateAction = (index, field, value) => {
    const newActions = [...formData.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setFormData({ ...formData, actions: newActions });
  };

  const removeAction = (index) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Automated Workflows
            </CardTitle>
            <CardDescription>Streamline repetitive tasks with automated sequences</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-education-blue">
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </CardHeader>
      </Card>

      {showForm && (
        <Card className="border-2 border-education-blue shadow-lg">
          <CardHeader>
            <CardTitle>{editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Workflow Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., New Student Onboarding"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Trigger <span className="text-red-500">*</span></Label>
                <Select value={formData.trigger_type} onValueChange={(v) => setFormData({ ...formData, trigger_type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this workflow does..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Actions Sequence</h4>
                <Button onClick={addAction} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </Button>
              </div>

              <div className="space-y-3">
                {formData.actions.map((action, index) => (
                  <Card key={index} className="p-4 bg-slate-50">
                    <div className="flex items-start gap-4">
                      <Badge className="mt-1">Step {index + 1}</Badge>
                      <div className="flex-1 space-y-3">
                        <Select
                          value={action.action_type}
                          onValueChange={(v) => updateAction(index, 'action_type', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {action.action_type === 'create_task' && (
                          <div className="space-y-2">
                            <Input
                              placeholder="Task title"
                              value={action.task_config?.title || ''}
                              onChange={(e) => updateAction(index, 'task_config', {
                                ...action.task_config,
                                title: e.target.value
                              })}
                            />
                            <Textarea
                              placeholder="Task description"
                              value={action.task_config?.description || ''}
                              onChange={(e) => updateAction(index, 'task_config', {
                                ...action.task_config,
                                description: e.target.value
                              })}
                              rows={2}
                            />
                          </div>
                        )}

                        {(action.action_type === 'send_message' || action.action_type === 'send_email') && (
                          <div className="space-y-2">
                            <Input
                              placeholder="Subject"
                              value={action.message_config?.subject || ''}
                              onChange={(e) => updateAction(index, 'message_config', {
                                ...action.message_config,
                                subject: e.target.value
                              })}
                            />
                            <Textarea
                              placeholder="Message body"
                              value={action.message_config?.body || ''}
                              onChange={(e) => updateAction(index, 'message_config', {
                                ...action.message_config,
                                body: e.target.value
                              })}
                              rows={3}
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Delay (days)"
                            value={action.delay_days || ''}
                            onChange={(e) => updateAction(index, 'delay_days', parseInt(e.target.value) || 0)}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-600 pt-2">days delay before executing</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAction(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setEditingWorkflow(null);
                setFormData(getDefaultFormData());
              }}>Cancel</Button>
              <Button onClick={handleSave} className="bg-education-blue">
                {editingWorkflow ? 'Update' : 'Create'} Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {workflows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No workflows created yet</p>
          </div>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{workflow.name}</h4>
                      <Badge variant={workflow.is_active ? 'default' : 'outline'}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Trigger: {triggerTypes.find(t => t.value === workflow.trigger_type)?.label}</span>
                      <span>•</span>
                      <span>{workflow.actions?.length || 0} actions</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWorkflow.mutate(workflow)}
                    >
                      {workflow.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingWorkflow(workflow);
                        setFormData(workflow);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWorkflow.mutate(workflow.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function getDefaultFormData() {
  return {
    name: '',
    description: '',
    trigger_type: 'profile_created',
    trigger_conditions: {},
    actions: [],
    is_active: true
  };
}

function getDefaultAction() {
  return {
    action_type: 'create_task',
    delay_days: 0,
    task_config: { title: '', description: '', type: 'follow_up', priority: 'medium' },
    message_config: { subject: '', body: '' }
  };
}