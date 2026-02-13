import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Plus, Edit2, Trash2, Play } from 'lucide-react';
import { toast } from "sonner";

export default function TaskAutomation() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'follow_up',
    priority: 'medium',
    trigger_stage: '',
    trigger_lead_score_min: 0,
    due_days_offset: 3,
    auto_assign: true,
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['task-templates'],
    queryFn: () => base44.entities.TaskTemplate.list(),
  });

  const createTemplate = useMutation({
    mutationFn: (data) => base44.entities.TaskTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['task-templates']);
      setShowDialog(false);
      resetForm();
      toast.success('Task template created');
    },
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TaskTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['task-templates']);
      setShowDialog(false);
      resetForm();
      toast.success('Task template updated');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.TaskTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['task-templates']);
      toast.success('Task template deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'follow_up',
      priority: 'medium',
      trigger_stage: '',
      trigger_lead_score_min: 0,
      due_days_offset: 3,
      auto_assign: true,
      is_active: true,
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData(template);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createTemplate.mutate(formData);
    }
  };

  const applicationStages = [
    'draft', 'documents_pending', 'under_review', 'submitted_to_university',
    'conditional_offer', 'unconditional_offer', 'visa_processing', 'enrolled'
  ];

  return (
    <div>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: '#F7941D' }} />
              Task Automation Templates
            </CardTitle>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No task templates yet</p>
                <p className="text-sm mt-1">Create templates to automate task creation</p>
              </div>
            ) : (
              templates.map(template => (
                <div key={template.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{template.name}</h4>
                        <Badge variant="outline">{template.type}</Badge>
                        <Badge className={
                          template.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          template.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          template.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {template.priority}
                        </Badge>
                        {template.is_active ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        {template.trigger_stage && (
                          <span>▸ Triggers on: <strong>{template.trigger_stage.replace(/_/g, ' ')}</strong></span>
                        )}
                        {template.trigger_lead_score_min > 0 && (
                          <span>▸ Min score: <strong>{template.trigger_lead_score_min}</strong></span>
                        )}
                        <span>▸ Due in: <strong>{template.due_days_offset} days</strong></span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(template)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteTemplate.mutate(template.id)}
                        className="text-red-600 hover:text-red-700"
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

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Task Template' : 'Create Task Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label>Template Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Follow up after 3 days"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Check application status and reach out to student..."
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Task Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="visa_check">Visa Check</SelectItem>
                    <SelectItem value="document_review">Document Review</SelectItem>
                    <SelectItem value="offer_letter">Offer Letter</SelectItem>
                    <SelectItem value="interview_prep">Interview Prep</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger>
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
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Trigger on Application Stage</Label>
                <Select value={formData.trigger_stage} onValueChange={(v) => setFormData({...formData, trigger_stage: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {applicationStages.map(stage => (
                      <SelectItem key={stage} value={stage}>
                        {stage.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Min Lead Score (0 = no min)</Label>
                <Input
                  type="number"
                  value={formData.trigger_lead_score_min}
                  onChange={(e) => setFormData({...formData, trigger_lead_score_min: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <Label>Due Date Offset (days after trigger)</Label>
              <Input
                type="number"
                value={formData.due_days_offset}
                onChange={(e) => setFormData({...formData, due_days_offset: parseInt(e.target.value) || 3})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <Label>Auto-assign to student's counselor</Label>
                <p className="text-xs text-slate-500">Task will be assigned automatically</p>
              </div>
              <Switch
                checked={formData.auto_assign}
                onCheckedChange={(v) => setFormData({...formData, auto_assign: v})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-slate-500">Enable this template</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({...formData, is_active: v})}
              />
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.description || createTemplate.isPending || updateTemplate.isPending}
              className="w-full"
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}