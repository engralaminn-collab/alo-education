import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Copy, CheckCircle } from 'lucide-react';

const reminderTypes = [
  { value: 'application_deadline', label: 'Application Deadline' },
  { value: 'missing_document', label: 'Missing Document' },
  { value: 'document_expiry', label: 'Document Expiry' },
  { value: 'visa_deadline', label: 'Visa Deadline' },
  { value: 'action_required', label: 'Action Required' },
  { value: 'custom', label: 'Custom' }
];

const documentTypes = [
  'passport', 'transcript', 'degree_certificate', 'english_test',
  'cv', 'sop', 'lor', 'photo', 'financial_proof', 'other'
];

const applicationStatuses = [
  'draft', 'documents_pending', 'under_review', 'submitted_to_university',
  'conditional_offer', 'unconditional_offer', 'visa_processing', 'enrolled', 'rejected', 'withdrawn'
];

export default function ReminderConfigPanel({ counselorId }) {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders', counselorId],
    queryFn: () => base44.entities.Reminder.filter({ counselor_id: counselorId })
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  const createReminder = useMutation({
    mutationFn: (data) => base44.entities.Reminder.create({
      ...data,
      counselor_id: counselorId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setShowForm(false);
      setFormData(getDefaultFormData());
      toast.success('Reminder created successfully');
    }
  });

  const updateReminder = useMutation({
    mutationFn: (data) => base44.entities.Reminder.update(editingReminder.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setEditingReminder(null);
      setShowForm(false);
      setFormData(getDefaultFormData());
      toast.success('Reminder updated successfully');
    }
  });

  const deleteReminder = useMutation({
    mutationFn: (id) => base44.entities.Reminder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    }
  });

  const toggleReminderStatus = useMutation({
    mutationFn: (reminder) => base44.entities.Reminder.update(reminder.id, {
      is_active: !reminder.is_active
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    }
  });

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData(reminder);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.reminder_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingReminder) {
      updateReminder.mutate(formData);
    } else {
      createReminder.mutate(formData);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReminder(null);
    setFormData(getDefaultFormData());
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Automated Reminders</CardTitle>
            <CardDescription>Configure reminders for application deadlines, missing documents, and required actions</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-education-blue">
            <Plus className="w-4 h-4 mr-2" />
            New Reminder
          </Button>
        </CardHeader>
      </Card>

      {showForm && (
        <Card className="border-2 border-education-blue shadow-lg">
          <CardHeader>
            <CardTitle>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Reminder Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Application Deadline Alert"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Reminder Type <span className="text-red-500">*</span></Label>
                <Select value={formData.reminder_type} onValueChange={(v) => setFormData({ ...formData, reminder_type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Trigger Conditions</h4>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Application Statuses</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {applicationStatuses.map(status => (
                      <Badge
                        key={status}
                        variant={formData.trigger_condition.application_status.includes(status) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const statuses = formData.trigger_condition.application_status;
                          setFormData({
                            ...formData,
                            trigger_condition: {
                              ...formData.trigger_condition,
                              application_status: statuses.includes(status)
                                ? statuses.filter(s => s !== status)
                                : [...statuses, status]
                            }
                          });
                        }}
                      >
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Document Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {documentTypes.map(type => (
                      <Badge
                        key={type}
                        variant={formData.trigger_condition.document_types.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const types = formData.trigger_condition.document_types;
                          setFormData({
                            ...formData,
                            trigger_condition: {
                              ...formData.trigger_condition,
                              document_types: types.includes(type)
                                ? types.filter(t => t !== type)
                                : [...types, type]
                            }
                          });
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Days Before Deadline</Label>
                    <Input
                      type="number"
                      value={formData.trigger_condition.days_before_deadline || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        trigger_condition: {
                          ...formData.trigger_condition,
                          days_before_deadline: parseInt(e.target.value) || 0
                        }
                      })}
                      placeholder="e.g., 7"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <Select
                      value={formData.trigger_condition.target_audience}
                      onValueChange={(v) => setFormData({
                        ...formData,
                        trigger_condition: { ...formData.trigger_condition, target_audience: v }
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student Only</SelectItem>
                        <SelectItem value="counselor">Counselor Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Timing</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select value={formData.reminder_timing.frequency} onValueChange={(v) => setFormData({
                    ...formData,
                    reminder_timing: { ...formData.reminder_timing, frequency: v }
                  })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="on_date">On Specific Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time of Day</Label>
                  <Input
                    type="time"
                    value={formData.reminder_timing.time_of_day || '09:00'}
                    onChange={(e) => setFormData({
                      ...formData,
                      reminder_timing: { ...formData.reminder_timing, time_of_day: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>

              {formData.reminder_timing.frequency === 'on_date' && (
                <div className="mt-4">
                  <Label>Specific Date</Label>
                  <Input
                    type="date"
                    value={formData.reminder_timing.specific_date || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      reminder_timing: { ...formData.reminder_timing, specific_date: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Delivery Channels</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={formData.delivery_channels.in_app}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      delivery_channels: { ...formData.delivery_channels, in_app: checked }
                    })}
                  />
                  <Label>In-App Notification</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={formData.delivery_channels.email}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      delivery_channels: { ...formData.delivery_channels, email: checked }
                    })}
                  />
                  <Label>Email Notification</Label>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label>Message Subject</Label>
              <Input
                value={formData.message_template.subject}
                onChange={(e) => setFormData({
                  ...formData,
                  message_template: { ...formData.message_template, subject: e.target.value }
                })}
                placeholder="e.g., Reminder: Application Deadline"
                className="mt-1"
              />

              <Label className="mt-4 block">Message Body (use {{student_name}}, {{student_email}} as variables)</Label>
              <Textarea
                value={formData.message_template.body}
                onChange={(e) => setFormData({
                  ...formData,
                  message_template: { ...formData.message_template, body: e.target.value }
                })}
                placeholder="Your message template..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={createReminder.isPending || updateReminder.isPending}
                className="bg-education-blue"
              >
                {editingReminder ? 'Update' : 'Create'} Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No reminders configured yet. Create your first reminder to get started.</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{reminder.name}</h4>
                      <Badge variant={reminder.is_active ? 'default' : 'outline'}>
                        {reminder.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{reminderTypes.find(t => t.value === reminder.reminder_type)?.label}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Frequency: {reminder.reminder_timing.frequency}</p>
                      <p>Delivery: {reminder.delivery_channels.in_app ? '✓ In-App' : ''} {reminder.delivery_channels.email ? '✓ Email' : ''}</p>
                      {reminder.last_triggered && <p>Last triggered: {new Date(reminder.last_triggered).toLocaleDateString()}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReminderStatus.mutate(reminder)}
                    >
                      {reminder.is_active ? 'Pause' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(reminder)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReminder.mutate(reminder.id)}
                      className="text-red-600 hover:text-red-700"
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
    reminder_type: 'application_deadline',
    trigger_condition: {
      application_status: [],
      document_types: [],
      document_status: ['pending'],
      days_before_deadline: 7,
      days_until_expiry: 30,
      target_audience: 'both'
    },
    reminder_timing: {
      frequency: 'daily',
      time_of_day: '09:00',
      days_of_week: [],
      specific_date: ''
    },
    delivery_channels: {
      in_app: true,
      email: false
    },
    message_template: {
      subject: '',
      body: ''
    },
    status: 'draft'
  };
}