import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Zap, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedWorkflowBuilder() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [conditions, setConditions] = useState([]);
  
  const [workflow, setWorkflow] = useState({
    rule_name: '',
    description: '',
    trigger_type: 'custom_combination',
    action_type: 'send_personalized_email',
    trigger_conditions: {
      days_threshold: 5,
      schedule_frequency: 'daily'
    },
    email_subject_template: '',
    email_template: '',
    dynamic_fields: [],
    task_priority: 'medium',
    is_active: true
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['advanced-workflows'],
    queryFn: () => base44.entities.AutomatedWorkflow.list('-created_date'),
  });

  const addCondition = () => {
    setConditions([...conditions, {
      field: 'communication_days',
      operator: 'greater_than',
      value: '5'
    }]);
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const createWorkflow = useMutation({
    mutationFn: async (data) => {
      // Build custom logic string from conditions
      const customLogic = conditions.map(c => 
        `${c.field} ${c.operator} ${c.value}`
      ).join(' AND ');

      return base44.entities.AutomatedWorkflow.create({
        ...data,
        trigger_conditions: {
          ...data.trigger_conditions,
          custom_logic: customLogic
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-workflows'] });
      setIsOpen(false);
      setWorkflow({
        rule_name: '',
        description: '',
        trigger_type: 'custom_combination',
        action_type: 'send_personalized_email',
        trigger_conditions: {
          days_threshold: 5,
          schedule_frequency: 'daily'
        },
        email_subject_template: '',
        email_template: '',
        dynamic_fields: [],
        task_priority: 'medium',
        is_active: true
      });
      setConditions([]);
      toast.success('Advanced workflow created');
    }
  });

  const availableFields = [
    { value: 'student_name', label: 'Student Name' },
    { value: 'course_name', label: 'Course Name' },
    { value: 'university_name', label: 'University Name' },
    { value: 'deadline_date', label: 'Deadline Date' },
    { value: 'days_since_communication', label: 'Days Since Last Communication' },
    { value: 'application_status', label: 'Application Status' },
    { value: 'counselor_name', label: 'Counselor Name' },
    { value: 'concerns', label: 'Student Concerns' },
    { value: 'sentiment', label: 'Recent Sentiment' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Advanced Workflow Builder
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Build Custom Automation Rule</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label>Rule Name *</Label>
                    <Input
                      value={workflow.rule_name}
                      onChange={(e) => setWorkflow({ ...workflow, rule_name: e.target.value })}
                      placeholder="e.g. Personalized Follow-up for Inactive Students"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={workflow.description}
                      onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                      placeholder="What does this rule do?"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Trigger Conditions */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Trigger Conditions</Label>
                  <div className="space-y-3">
                    {conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <Select
                          value={condition.field}
                          onValueChange={(v) => {
                            const newConditions = [...conditions];
                            newConditions[index].field = v;
                            setConditions(newConditions);
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="communication_days">Days Since Communication</SelectItem>
                            <SelectItem value="application_status">Application Status</SelectItem>
                            <SelectItem value="document_pending">Pending Documents</SelectItem>
                            <SelectItem value="sentiment">Sentiment</SelectItem>
                            <SelectItem value="deadline_days">Days to Deadline</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(v) => {
                            const newConditions = [...conditions];
                            newConditions[index].operator = v;
                            setConditions(newConditions);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          value={condition.value}
                          onChange={(e) => {
                            const newConditions = [...conditions];
                            newConditions[index].value = e.target.value;
                            setConditions(newConditions);
                          }}
                          placeholder="Value"
                          className="flex-1"
                        />

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeCondition(index)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCondition}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                </div>

                {/* Action Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Action to Take</Label>
                  
                  <Select
                    value={workflow.action_type}
                    onValueChange={(v) => setWorkflow({ ...workflow, action_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_personalized_email">Send Personalized Email (AI)</SelectItem>
                      <SelectItem value="send_email">Send Template Email</SelectItem>
                      <SelectItem value="create_task">Create Task</SelectItem>
                      <SelectItem value="notify_counselor">Notify Counselor</SelectItem>
                      <SelectItem value="flag_urgent">Flag as Urgent</SelectItem>
                    </SelectContent>
                  </Select>

                  {['send_email', 'send_personalized_email'].includes(workflow.action_type) && (
                    <>
                      <div>
                        <Label>Email Subject Template</Label>
                        <Input
                          value={workflow.email_subject_template}
                          onChange={(e) => setWorkflow({ ...workflow, email_subject_template: e.target.value })}
                          placeholder="{{student_name}}, important update on your application"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>
                          Email Body Template
                          {workflow.action_type === 'send_personalized_email' && (
                            <Badge className="ml-2 bg-purple-100 text-purple-700">AI Enhanced</Badge>
                          )}
                        </Label>
                        <Textarea
                          value={workflow.email_template}
                          onChange={(e) => setWorkflow({ ...workflow, email_template: e.target.value })}
                          placeholder={
                            workflow.action_type === 'send_personalized_email'
                              ? "Hi {{student_name}}, we haven't heard from you in {{days_since_communication}} days. AI will personalize this message based on student's status, concerns, and application progress..."
                              : "Hi {{student_name}}, this is a reminder about your application to {{university_name}}..."
                          }
                          className="mt-2 min-h-32"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Available placeholders: {availableFields.map(f => `{{${f.value}}}`).join(', ')}
                        </p>
                      </div>

                      {workflow.action_type === 'send_personalized_email' && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>AI Personalization:</strong> The email will be enhanced with context about the student's recent communications, sentiment, concerns, and application progress.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {['create_task', 'notify_counselor'].includes(workflow.action_type) && (
                    <div>
                      <Label>Task Priority</Label>
                      <Select
                        value={workflow.task_priority}
                        onValueChange={(v) => setWorkflow({ ...workflow, task_priority: v })}
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
                </div>

                {/* Schedule */}
                <div>
                  <Label>Run Schedule</Label>
                  <Select
                    value={workflow.trigger_conditions.schedule_frequency}
                    onValueChange={(v) => setWorkflow({
                      ...workflow,
                      trigger_conditions: {
                        ...workflow.trigger_conditions,
                        schedule_frequency: v
                      }
                    })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => createWorkflow.mutate(workflow)}
                  disabled={!workflow.rule_name || createWorkflow.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Create Automation Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workflows.filter(w => w.trigger_type === 'custom_combination' || w.action_type === 'send_personalized_email').map(w => (
            <div key={w.id} className="p-4 bg-slate-50 rounded-lg border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900">{w.rule_name}</h4>
                  <p className="text-sm text-slate-600">{w.description}</p>
                </div>
                <Badge className={w.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                  {w.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Runs: {w.trigger_conditions?.schedule_frequency || 'manual'}</span>
                <span>•</span>
                <span>Executed: {w.executions_count || 0} times</span>
                {w.success_count > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">{w.success_count} actions triggered</span>
                  </>
                )}
              </div>
            </div>
          ))}

          {workflows.filter(w => w.trigger_type === 'custom_combination').length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm">No custom workflows yet. Create one to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}