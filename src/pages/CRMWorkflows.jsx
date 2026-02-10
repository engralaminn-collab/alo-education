<<<<<<< HEAD
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Workflow, Plus, Edit2, Trash2, Play, Zap } from 'lucide-react';
import { toast } from "sonner";

export default function CRMWorkflows() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'lead_score_threshold',
    trigger_config: {},
    actions: [],
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.WorkflowTemplate.list(),
  });

  const createWorkflow = useMutation({
    mutationFn: (data) => base44.entities.WorkflowTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      setShowDialog(false);
      resetForm();
      toast.success('Workflow created');
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkflowTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      setShowDialog(false);
      resetForm();
      toast.success('Workflow updated');
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: (id) => base44.entities.WorkflowTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'lead_score_threshold',
      trigger_config: {},
      actions: [],
      is_active: true,
    });
    setEditingWorkflow(null);
  };

  const handleEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setFormData(workflow);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingWorkflow) {
      updateWorkflow.mutate({ id: editingWorkflow.id, data: formData });
    } else {
      createWorkflow.mutate(formData);
    }
  };

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...(formData.actions || []), { type: 'send_email', config: {} }]
    });
  };

  const updateAction = (index, field, value) => {
    const newActions = [...formData.actions];
    if (field === 'type') {
      newActions[index].type = value;
    } else {
      newActions[index].config = { ...newActions[index].config, [field]: value };
    }
    setFormData({ ...formData, actions: newActions });
  };

  const removeAction = (index) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index)
    });
  };

  return (
    <CRMLayout title="Automated Workflows">
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5" style={{ color: '#0B5ED7' }} />
                  Workflow Automation
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">Create automated workflows based on triggers</p>
              </div>
              <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                New Workflow
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {workflows.length === 0 ? (
                <div className="text-center py-12">
                  <Workflow className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No workflows yet</h3>
                  <p className="text-slate-500 mb-4">Create your first automated workflow</p>
                  <Button onClick={() => setShowDialog(true)}>Create Workflow</Button>
                </div>
              ) : (
                workflows.map(workflow => (
                  <div key={workflow.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                          {workflow.is_active ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-500">Inactive</Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {workflow.trigger_type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{workflow.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>• {workflow.actions?.length || 0} actions</span>
                          {workflow.trigger_config?.lead_score_min && (
                            <span>• Min score: {workflow.trigger_config.lead_score_min}</span>
                          )}
                          {workflow.trigger_config?.application_stage && (
                            <span>• Stage: {workflow.trigger_config.application_stage}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(workflow)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-red-600"
                          onClick={() => deleteWorkflow.mutate(workflow.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label>Workflow Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="High score follow-up"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Automatically follow up with high-scoring leads..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Trigger Type *</Label>
                <Select 
                  value={formData.trigger_type} 
                  onValueChange={(v) => setFormData({...formData, trigger_type: v, trigger_config: {}})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_score_threshold">Lead Score Threshold</SelectItem>
                    <SelectItem value="application_stage_change">Application Stage Change</SelectItem>
                    <SelectItem value="student_action">Student Action</SelectItem>
                    <SelectItem value="time_based">Time-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.trigger_type === 'lead_score_threshold' && (
                <div>
                  <Label>Minimum Lead Score</Label>
                  <Input
                    type="number"
                    value={formData.trigger_config?.lead_score_min || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      trigger_config: { ...formData.trigger_config, lead_score_min: parseInt(e.target.value) }
                    })}
                    placeholder="75"
                  />
                </div>
              )}

              {formData.trigger_type === 'application_stage_change' && (
                <div>
                  <Label>Application Stage</Label>
                  <Select
                    value={formData.trigger_config?.application_stage || ''}
                    onValueChange={(v) => setFormData({
                      ...formData,
                      trigger_config: { ...formData.trigger_config, application_stage: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conditional_offer">Conditional Offer</SelectItem>
                      <SelectItem value="unconditional_offer">Unconditional Offer</SelectItem>
                      <SelectItem value="visa_processing">Visa Processing</SelectItem>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Actions</Label>
                  <Button size="sm" variant="outline" onClick={addAction}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Action
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.actions?.map((action, index) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Select
                          value={action.type}
                          onValueChange={(v) => updateAction(index, 'type', v)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="send_email">Send Email</SelectItem>
                            <SelectItem value="create_task">Create Task</SelectItem>
                            <SelectItem value="update_status">Update Status</SelectItem>
                            <SelectItem value="create_notification">Create Notification</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" onClick={() => removeAction(index)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                      
                      {action.type === 'send_email' && (
                        <>
                          <Input
                            placeholder="Email subject"
                            value={action.config?.subject || ''}
                            onChange={(e) => updateAction(index, 'subject', e.target.value)}
                          />
                          <Textarea
                            placeholder="Email body"
                            value={action.config?.body || ''}
                            onChange={(e) => updateAction(index, 'body', e.target.value)}
                            rows={3}
                          />
                        </>
                      )}
                      
                      {action.type === 'create_task' && (
                        <>
                          <Input
                            placeholder="Task title"
                            value={action.config?.title || ''}
                            onChange={(e) => updateAction(index, 'title', e.target.value)}
                          />
                          <Select
                            value={action.config?.priority || 'medium'}
                            onValueChange={(v) => updateAction(index, 'priority', v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({...formData, is_active: v})}
                />
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!formData.name || createWorkflow.isPending || updateWorkflow.isPending}
                className="w-full"
              >
                {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
=======
import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import WorkflowAutomationBuilder from '@/components/crm/WorkflowAutomationBuilder';

export default function CRMWorkflows() {
  return (
    <CRMLayout title="Workflow Automation">
      <div className="p-6">
        <WorkflowAutomationBuilder />
>>>>>>> last/main
      </div>
    </CRMLayout>
  );
}