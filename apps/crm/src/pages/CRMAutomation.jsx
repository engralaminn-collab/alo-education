import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Zap, Send, UserPlus, RefreshCw, Clock, 
  CheckCircle, Settings, Brain, Shield, Plus, Trash2, Edit, Play
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import WorkflowAutomation from '@/components/crm/WorkflowAutomation';
import CommunicationParser from '@/components/crm/CommunicationParser';
import AdvancedWorkflowBuilder from '@/components/crm/AdvancedWorkflowBuilder';
import LeadScoringDashboard from '@/components/crm/LeadScoringDashboard';

export default function CRMAutomation() {
  const queryClient = useQueryClient();
  const [automating, setAutomating] = useState(false);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [newRule, setNewRule] = useState({
    rule_name: '',
    description: '',
    trigger_type: 'communication_gap',
    action_type: 'create_task',
    trigger_conditions: { days_threshold: 5 },
    task_priority: 'medium',
    email_subject_template: '',
    email_template: '',
    is_active: true
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['automation-workflows'],
    queryFn: () => base44.entities.AutomatedWorkflow.list('-created_date'),
  });

  const createWorkflow = useMutation({
    mutationFn: (data) => base44.entities.AutomatedWorkflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
      setCreateRuleOpen(false);
      setNewRule({
        rule_name: '',
        description: '',
        trigger_type: 'communication_gap',
        action_type: 'create_task',
        trigger_conditions: { days_threshold: 5 },
        task_priority: 'medium',
        email_subject_template: '',
        email_template: '',
        is_active: true
      });
      toast.success('Workflow rule created');
    }
  });

  const deleteWorkflow = useMutation({
    mutationFn: (id) => base44.entities.AutomatedWorkflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
      toast.success('Workflow deleted');
    }
  });

  const toggleWorkflow = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.AutomatedWorkflow.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
      toast.success('Workflow updated');
    }
  });

  // Auto-assign leads to counselors
  const autoAssignLeads = useMutation({
    mutationFn: async () => {
      const inquiries = await base44.entities.Inquiry.filter({ status: 'new' });
      const counselors = await base44.entities.Counselor.filter({ 
        status: 'active', 
        is_available: true 
      });

      if (counselors.length === 0) return { assigned: 0 };

      const sorted = counselors.sort((a, b) => 
        (a.current_students || 0) - (b.current_students || 0)
      );

      let assigned = 0;
      for (const inquiry of inquiries) {
        const counselor = sorted.find(c => 
          c.specializations?.some(s => 
            inquiry.country_of_interest?.toLowerCase().includes(s.toLowerCase())
          ) && (c.current_students || 0) < (c.max_students || 50)
        ) || sorted[0];

        if (counselor && (counselor.current_students || 0) < (counselor.max_students || 50)) {
          await base44.entities.Inquiry.update(inquiry.id, {
            assigned_to: counselor.user_id,
            status: 'contacted'
          });
          assigned++;
        }
      }

      return { assigned };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-inquiries'] });
      toast.success(`Auto-assigned ${data.assigned} new leads to counselors`);
    }
  });

  return (
    <CRMLayout 
      title="Automation & AI Workflows"
      actions={
        <Dialog open={createRuleOpen} onOpenChange={setCreateRuleOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={newRule.rule_name}
                  onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                  placeholder="e.g. 5-Day Follow-up for Silent Students"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Describe what this rule does"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trigger Type</Label>
                  <Select 
                    value={newRule.trigger_type}
                    onValueChange={(v) => setNewRule({ ...newRule, trigger_type: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="communication_gap">Communication Gap</SelectItem>
                      <SelectItem value="deadline_approaching">Deadline Approaching</SelectItem>
                      <SelectItem value="document_pending">Document Pending</SelectItem>
                      <SelectItem value="status_change">Status Change</SelectItem>
                      <SelectItem value="sentiment_negative">Negative Sentiment</SelectItem>
                      <SelectItem value="scheduled">Scheduled Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Action Type</Label>
                  <Select 
                    value={newRule.action_type}
                    onValueChange={(v) => setNewRule({ ...newRule, action_type: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create_task">Create Task</SelectItem>
                      <SelectItem value="send_email">Send Email</SelectItem>
                      <SelectItem value="send_personalized_email">Send Personalized Email</SelectItem>
                      <SelectItem value="notify_counselor">Notify Counselor</SelectItem>
                      <SelectItem value="flag_urgent">Flag Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {['communication_gap', 'deadline_approaching', 'document_pending'].includes(newRule.trigger_type) && (
                <div>
                  <Label>Days Threshold</Label>
                  <Input
                    type="number"
                    value={newRule.trigger_conditions.days_threshold || 5}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      trigger_conditions: {
                        ...newRule.trigger_conditions,
                        days_threshold: parseInt(e.target.value)
                      }
                    })}
                    className="mt-2"
                  />
                </div>
              )}

              {['create_task', 'notify_counselor'].includes(newRule.action_type) && (
                <div>
                  <Label>Task Priority</Label>
                  <Select 
                    value={newRule.task_priority}
                    onValueChange={(v) => setNewRule({ ...newRule, task_priority: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {['send_email', 'send_personalized_email'].includes(newRule.action_type) && (
                <>
                  <div>
                    <Label>Email Subject Template</Label>
                    <Input
                      value={newRule.email_subject_template}
                      onChange={(e) => setNewRule({ ...newRule, email_subject_template: e.target.value })}
                      placeholder="e.g. {{student_name}}, let's get you back on track!"
                      className="mt-2"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Use placeholders: {`{{student_name}}, {{course_name}}, {{deadline_date}}, {{status}}`}
                    </p>
                  </div>

                  <div>
                    <Label>Email Body Template</Label>
                    <Textarea
                      value={newRule.email_template}
                      onChange={(e) => setNewRule({ ...newRule, email_template: e.target.value })}
                      placeholder="Hi {{student_name}}, we noticed you haven't responded in {{days}} days..."
                      className="mt-2 min-h-32"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {newRule.action_type === 'send_personalized_email' 
                        ? 'AI will personalize this template based on student data and context'
                        : 'Placeholders will be replaced with actual student data'}
                    </p>
                  </div>
                </>
              )}

              <Button
                onClick={() => createWorkflow.mutate(newRule)}
                disabled={!newRule.rule_name || createWorkflow.isPending}
                className="w-full"
              >
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Active Rules */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Automation Rules</h2>
        <div className="space-y-3">
          {workflows.map(workflow => (
            <Card key={workflow.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={(v) => toggleWorkflow.mutate({ id: workflow.id, is_active: v })}
                      />
                      <h4 className="font-semibold text-slate-900">{workflow.rule_name}</h4>
                    </div>
                    {workflow.description && (
                      <p className="text-sm text-slate-600 mb-2 ml-14">{workflow.description}</p>
                    )}
                    <div className="flex items-center gap-2 ml-14 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        Trigger: {workflow.trigger_type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Action: {workflow.action_type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-700 text-xs">
                        {workflow.executions_count || 0} runs
                      </Badge>
                      {workflow.success_count > 0 && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {workflow.success_count} actions
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteWorkflow.mutate(workflow.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {workflows.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">No Automation Rules Yet</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Create your first automation rule to streamline workflows
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Auto-Assign Leads
            </CardTitle>
            <CardDescription>
              Assign new inquiries to counselors by specialization and workload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => autoAssignLeads.mutate()}
              disabled={autoAssignLeads.isPending}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoAssignLeads.isPending ? 'animate-spin' : ''}`} />
              Run Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-purple-600" />
              Communication Analysis
            </CardTitle>
            <CardDescription>
              Parse student communications for sentiment and concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              <Play className="w-4 h-4 mr-2" />
              Auto-Running
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-emerald-600" />
              Document Verification
            </CardTitle>
            <CardDescription>
              AI verifies uploaded documents for authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              <Play className="w-4 h-4 mr-2" />
              Auto-Running
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lead Scoring Dashboard */}
      <div className="mb-8">
        <LeadScoringDashboard />
      </div>

      {/* AI-Powered Features */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <WorkflowAutomation />
        <CommunicationParser />
        <AdvancedWorkflowBuilder />
      </div>

      {/* Automation Benefits */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Automation Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <UserPlus className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Faster Lead Response</h4>
              <p className="text-sm text-slate-600">
                New inquiries are instantly assigned to the best-fit counselor
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <Clock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Never Miss a Deadline</h4>
              <p className="text-sm text-slate-600">
                Automatic reminders ensure timely follow-ups
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Real-time Tracking</h4>
              <p className="text-sm text-slate-600">
                Application statuses update as milestones are completed
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <Brain className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">AI Intelligence</h4>
              <p className="text-sm text-slate-600">
                Smart parsing and document verification save hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}