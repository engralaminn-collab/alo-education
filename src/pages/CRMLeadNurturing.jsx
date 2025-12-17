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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Workflow, Plus, Mail, Clock, Target, TrendingUp,
  Edit, Trash2, Play, Pause, BarChart3
} from 'lucide-react';

export default function CRMLeadNurturing() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: () => base44.entities.WorkflowTemplate.list(),
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: () => base44.entities.WorkflowExecution.list('-created_date', 50),
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'lead_score_threshold',
    trigger_config: {},
    actions: [],
    is_active: true
  });

  const createWorkflow = useMutation({
    mutationFn: (data) => base44.entities.WorkflowTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Workflow created successfully');
      setShowCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        trigger_type: 'lead_score_threshold',
        trigger_config: {},
        actions: [],
        is_active: true
      });
    }
  });

  const toggleWorkflow = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.WorkflowTemplate.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Workflow updated');
    }
  });

  const stats = {
    activeWorkflows: workflows.filter(w => w.is_active).length,
    totalExecutions: executions.length,
    successRate: executions.length > 0 
      ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
      : 0,
    pendingTasks: executions.filter(e => e.status === 'pending' || e.status === 'in_progress').length
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lead Nurturing Workflows</h1>
            <p className="text-slate-600 mt-1">Automate lead engagement and conversion</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} style={{ backgroundColor: '#0066CC', color: 'white' }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Workflows</p>
                  <p className="text-3xl font-bold text-[#0066CC]">{stats.activeWorkflows}</p>
                </div>
                <Workflow className="w-10 h-10 text-[#0066CC] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Executions</p>
                  <p className="text-3xl font-bold text-[#F37021]">{stats.totalExecutions}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-[#F37021] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-green-600">{stats.successRate}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pending Tasks</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.pendingTasks}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflows List */}
        <Card>
          <CardHeader>
            <CardTitle>Automated Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            {workflows.length === 0 ? (
              <div className="text-center py-12">
                <Workflow className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">No workflows created yet</p>
                <p className="text-sm text-slate-500">Create your first automated workflow to nurture leads</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{workflow.name}</h3>
                          <Badge className={workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{workflow.trigger_type?.replace(/_/g, ' ')}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{workflow.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Trigger: {workflow.trigger_type?.replace(/_/g, ' ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {workflow.actions?.length || 0} actions
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={workflow.is_active ? "outline" : "default"}
                          onClick={() => toggleWorkflow.mutate({ id: workflow.id, is_active: !workflow.is_active })}
                        >
                          {workflow.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Workflow Executions</CardTitle>
          </CardHeader>
          <CardContent>
            {executions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No executions yet</p>
            ) : (
              <div className="space-y-3">
                {executions.slice(0, 10).map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Workflow executed for student</p>
                      <p className="text-xs text-slate-500">
                        {execution.actions_completed} actions completed
                      </p>
                    </div>
                    <Badge className={
                      execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                      execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {execution.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Automated Workflow</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createWorkflow.mutate(formData); }} className="space-y-4">
            <div>
              <Label>Workflow Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., High Score Lead Follow-up"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this workflow does..."
                className="mt-2"
                rows={3}
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
                  <SelectItem value="time_based">Time-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWorkflow.isPending} style={{ backgroundColor: '#0066CC', color: 'white' }}>
                {createWorkflow.isPending ? 'Creating...' : 'Create Workflow'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}