import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Workflow, Plus, Edit, Trash, Mail, Clock } from 'lucide-react';

export default function CRMLeadNurturingWorkflows() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'lead_score_threshold',
    trigger_config: { lead_score_min: 50 },
    actions: [],
    is_active: true
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.WorkflowTemplate.list('-created_date'),
  });

  const createWorkflow = useMutation({
    mutationFn: (data) => base44.entities.WorkflowTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow created successfully');
      setShowForm(false);
      resetForm();
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkflowTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow updated successfully');
      setShowForm(false);
      resetForm();
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
      trigger_config: { lead_score_min: 50 },
      actions: [],
      is_active: true
    });
    setEditingWorkflow(null);
  };

  const handleEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setFormData(workflow);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingWorkflow) {
      updateWorkflow.mutate({ id: editingWorkflow.id, data: formData });
    } else {
      createWorkflow.mutate(formData);
    }
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lead Nurturing Workflows</h1>
            <p className="text-slate-600 mt-1">Automate lead engagement based on behavior and status</p>
          </div>
          <Button onClick={() => setShowForm(true)} style={{ backgroundColor: '#F37021', color: '#000000' }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingWorkflow ? 'Edit' : 'Create'} Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Workflow Name *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., High Score Follow-up"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe this workflow..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Trigger Type *</Label>
                  <Select 
                    value={formData.trigger_type}
                    onValueChange={(v) => setFormData({...formData, trigger_type: v})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead_score_threshold">Lead Score Threshold</SelectItem>
                      <SelectItem value="application_stage_change">Application Stage Change</SelectItem>
                      <SelectItem value="student_action">Student Action</SelectItem>
                      <SelectItem value="time_based">Time Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.trigger_type === 'lead_score_threshold' && (
                  <div>
                    <Label>Minimum Lead Score</Label>
                    <Input
                      type="number"
                      value={formData.trigger_config?.lead_score_min || 50}
                      onChange={(e) => setFormData({
                        ...formData, 
                        trigger_config: { ...formData.trigger_config, lead_score_min: parseInt(e.target.value) }
                      })}
                      className="mt-2"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={createWorkflow.isPending || updateWorkflow.isPending}>
                    {editingWorkflow ? 'Update' : 'Create'} Workflow
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0066CC20' }}>
                      <Workflow className="w-5 h-5" style={{ color: '#0066CC' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{workflow.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{workflow.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {workflow.trigger_type?.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className={workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(workflow)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteWorkflow.mutate(workflow.id)}>
                      <Trash className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CRMLayout>
  );
}