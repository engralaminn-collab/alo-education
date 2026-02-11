import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Plus, Trash2, Play, Pause, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowAutomationBuilder() {
  const queryClient = useQueryClient();
  const [editingWorkflow, setEditingWorkflow] = useState(null);

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.WorkflowAutomation.list()
  });

  const saveWorkflow = useMutation({
    mutationFn: (workflow) => {
      if (workflow.id) {
        return base44.entities.WorkflowAutomation.update(workflow.id, workflow);
      }
      return base44.entities.WorkflowAutomation.create(workflow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setEditingWorkflow(null);
      toast.success('Workflow saved');
    }
  });

  const toggleWorkflow = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.WorkflowAutomation.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow updated');
    }
  });

  const newWorkflow = () => {
    setEditingWorkflow({
      name: '',
      description: '',
      trigger_type: 'inquiry_status_change',
      trigger_conditions: {},
      actions: [{ action_type: 'assign_task', execution_order: 1, parallel: false, config: {} }],
      is_active: true
    });
  };

  const addAction = () => {
    setEditingWorkflow(prev => ({
      ...prev,
      actions: [...prev.actions, {
        action_type: 'send_email',
        execution_order: prev.actions.length + 1,
        parallel: false,
        config: {}
      }]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Workflow Automation
            </CardTitle>
            <Button onClick={newWorkflow} className="bg-education-blue">
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No workflows created yet</p>
          ) : (
            <div className="space-y-3">
              {workflows.map(wf => (
                <div key={wf.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{wf.name}</h4>
                      <Badge variant={wf.is_active ? 'default' : 'secondary'}>
                        {wf.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{wf.actions?.length || 0} actions</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{wf.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>Executed: {wf.execution_count || 0} times</span>
                      <span>Success Rate: {wf.success_rate?.toFixed(1) || 100}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleWorkflow.mutate({ id: wf.id, is_active: !wf.is_active })}
                    >
                      {wf.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingWorkflow(wf)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle>{editingWorkflow.id ? 'Edit' : 'Create'} Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  value={editingWorkflow.name}
                  onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Trigger Type</Label>
                <Select
                  value={editingWorkflow.trigger_type}
                  onValueChange={(v) => setEditingWorkflow({ ...editingWorkflow, trigger_type: v })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inquiry_status_change">Inquiry Status Change</SelectItem>
                    <SelectItem value="sla_breach">SLA Breach</SelectItem>
                    <SelectItem value="application_status_change">Application Status Change</SelectItem>
                    <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                    <SelectItem value="lead_score_threshold">Lead Score Threshold</SelectItem>
                    <SelectItem value="days_inactive">Days Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={editingWorkflow.description}
                onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Actions</Label>
                <Button size="sm" variant="outline" onClick={addAction}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Action
                </Button>
              </div>
              <div className="space-y-3">
                {editingWorkflow.actions?.map((action, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Action {idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingWorkflow({
                          ...editingWorkflow,
                          actions: editingWorkflow.actions.filter((_, i) => i !== idx)
                        })}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                    <Select
                      value={action.action_type}
                      onValueChange={(v) => {
                        const newActions = [...editingWorkflow.actions];
                        newActions[idx].action_type = v;
                        setEditingWorkflow({ ...editingWorkflow, actions: newActions });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send_email">Send Email</SelectItem>
                        <SelectItem value="assign_task">Assign Task</SelectItem>
                        <SelectItem value="update_field">Update Field</SelectItem>
                        <SelectItem value="assign_counselor">Assign Counselor</SelectItem>
                        <SelectItem value="update_lead_score">Update Lead Score</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={action.parallel}
                        onCheckedChange={(checked) => {
                          const newActions = [...editingWorkflow.actions];
                          newActions[idx].parallel = checked;
                          setEditingWorkflow({ ...editingWorkflow, actions: newActions });
                        }}
                      />
                      <Label className="text-sm">Execute in parallel</Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => saveWorkflow.mutate(editingWorkflow)}>
                Save Workflow
              </Button>
              <Button variant="outline" onClick={() => setEditingWorkflow(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}