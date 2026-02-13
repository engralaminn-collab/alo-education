import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Plus, Edit, Trash2, Copy } from 'lucide-react';

const categories = [
  'onboarding',
  'document_request',
  'application_update',
  'deadline_reminder',
  'general_inquiry',
  'follow_up',
  'congratulations'
];

export default function MessageTemplatesPanel({ onSelectTemplate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'onboarding',
    subject: '',
    content: '',
    is_shared: false
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['message-templates'],
    queryFn: () => base44.entities.MessageTemplate.list('-created_date')
  });

  const createTemplate = useMutation({
    mutationFn: (data) => base44.entities.MessageTemplate.create({
      ...data,
      created_by: user?.id,
      usage_count: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template created');
      handleClose();
    }
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MessageTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template updated');
      handleClose();
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.MessageTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Template deleted');
    }
  });

  const incrementUsage = useMutation({
    mutationFn: ({ id, count }) => base44.entities.MessageTemplate.update(id, {
      usage_count: count + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    }
  });

  const handleSave = () => {
    if (!formData.name || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createTemplate.mutate(formData);
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: 'onboarding',
      subject: '',
      content: '',
      is_shared: false
    });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject || '',
      content: template.content,
      is_shared: template.is_shared || false
    });
    setShowDialog(true);
  };

  const handleUseTemplate = (template) => {
    incrementUsage.mutate({ id: template.id, count: template.usage_count || 0 });
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <FileText className="w-5 h-5 text-education-blue" />
              Message Templates
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Quick replies for common scenarios
            </CardDescription>
          </div>
          <Button onClick={() => setShowDialog(true)} size="sm" className="bg-education-blue select-none">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No templates yet. Create one!</p>
            </div>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-all dark:bg-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold dark:text-white">{template.name}</h4>
                      <Badge variant="outline" className="text-xs dark:bg-slate-600">
                        {template.category}
                      </Badge>
                    </div>
                    {template.subject && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                        <strong>Subject:</strong> {template.subject}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {template.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                      <span>Used {template.usage_count || 0} times</span>
                      {template.is_shared && <Badge variant="outline" className="text-xs">Shared</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUseTemplate(template)}
                      className="h-8 w-8 select-none dark:bg-slate-600"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      className="h-8 w-8 select-none dark:bg-slate-600"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteTemplate.mutate(template.id)}
                      className="h-8 w-8 text-red-600 select-none dark:bg-slate-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="dark:bg-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium dark:text-white">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Welcome Message"
                  className="mt-1 dark:bg-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium dark:text-white">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="mt-1 dark:bg-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium dark:text-white">Subject (Optional)</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Message subject"
                className="mt-1 dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="text-sm font-medium dark:text-white">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Use variables like {{student_name}}, {{course_name}}, etc."
                className="mt-1 dark:bg-slate-700"
                rows={6}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tip: Use &#123;&#123;variable_name&#125;&#125; for dynamic content
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} className="select-none dark:bg-slate-700">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-education-blue select-none">
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}