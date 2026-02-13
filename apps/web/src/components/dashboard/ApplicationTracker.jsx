import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Clock, Plus, Pencil, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'researching', label: 'Researching', color: 'bg-slate-100 text-slate-700' },
  { value: 'preparing', label: 'Preparing Documents', color: 'bg-blue-100 text-blue-700' },
  { value: 'ready_to_submit', label: 'Ready to Submit', color: 'bg-purple-100 text-purple-700' },
  { value: 'submitted', label: 'Submitted', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'awaiting_decision', label: 'Awaiting Decision', color: 'bg-amber-100 text-amber-700' },
  { value: 'offer_received', label: 'Offer Received', color: 'bg-green-500 text-white' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-slate-100 text-slate-500' },
];

export default function ApplicationTracker({ studentProfile }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    university_name: '',
    course_name: '',
    application_deadline: '',
    submission_date: '',
    status: 'researching',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: trackedApps = [] } = useQuery({
    queryKey: ['tracked-applications', studentProfile?.id],
    queryFn: async () => {
      const apps = await base44.entities.Application.filter({ 
        student_id: studentProfile?.id 
      });
      return apps;
    },
    enabled: !!studentProfile?.id,
  });

  const createAppMutation = useMutation({
    mutationFn: (data) => base44.entities.Application.create({
      ...data,
      student_id: studentProfile.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tracked-applications']);
      toast.success('Application added successfully');
      resetForm();
    },
  });

  const updateAppMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Application.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tracked-applications']);
      toast.success('Application updated');
      resetForm();
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: (id) => base44.entities.Application.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tracked-applications']);
      toast.success('Application removed');
    },
  });

  const sendDeadlineReminderMutation = useMutation({
    mutationFn: async (app) => {
      const daysLeft = differenceInDays(new Date(app.application_deadline), new Date());
      await base44.integrations.Core.SendEmail({
        to: studentProfile.email,
        subject: `Reminder: ${app.university_name} Application Deadline Approaching`,
        body: `
          <h2>Application Deadline Reminder</h2>
          <p>This is a reminder that your application deadline for <strong>${app.university_name}</strong> is approaching.</p>
          <ul>
            <li><strong>University:</strong> ${app.university_name}</li>
            <li><strong>Course:</strong> ${app.course_name || 'N/A'}</li>
            <li><strong>Deadline:</strong> ${format(new Date(app.application_deadline), 'MMMM d, yyyy')}</li>
            <li><strong>Days Left:</strong> ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</li>
            <li><strong>Current Status:</strong> ${app.status?.replace(/_/g, ' ')}</li>
          </ul>
          <p>Make sure you have all required documents ready before the deadline.</p>
          <p>Best regards,<br/>ALO Education Team</p>
        `
      });
    },
    onSuccess: () => {
      toast.success('Reminder email sent');
    },
  });

  const resetForm = () => {
    setFormData({
      university_name: '',
      course_name: '',
      application_deadline: '',
      submission_date: '',
      status: 'researching',
      notes: ''
    });
    setEditingApp(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingApp) {
      updateAppMutation.mutate({ id: editingApp.id, data: formData });
    } else {
      createAppMutation.mutate(formData);
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setFormData({
      university_name: app.university_name || '',
      course_name: app.course_name || '',
      application_deadline: app.application_deadline || '',
      submission_date: app.submission_date || '',
      status: app.status || 'researching',
      notes: app.notes || ''
    });
    setDialogOpen(true);
  };

  const getUrgency = (deadline) => {
    if (!deadline) return null;
    const days = differenceInDays(new Date(deadline), new Date());
    if (isPast(new Date(deadline))) return { level: 'expired', color: 'bg-slate-300', text: 'text-slate-600' };
    if (days <= 3) return { level: 'critical', color: 'bg-red-500', text: 'text-red-700' };
    if (days <= 7) return { level: 'high', color: 'bg-orange-500', text: 'text-orange-700' };
    if (days <= 14) return { level: 'medium', color: 'bg-amber-500', text: 'text-amber-700' };
    return { level: 'low', color: 'bg-green-500', text: 'text-green-700' };
  };

  // Sort by deadline (soonest first)
  const sortedApps = [...trackedApps].sort((a, b) => {
    if (!a.application_deadline) return 1;
    if (!b.application_deadline) return -1;
    return new Date(a.application_deadline) - new Date(b.application_deadline);
  });

  // Filter upcoming deadlines
  const upcomingDeadlines = sortedApps.filter(app => 
    app.application_deadline && 
    !isPast(new Date(app.application_deadline)) &&
    !['submitted', 'offer_received', 'rejected', 'withdrawn'].includes(app.status)
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: '#0066CC' }} />
              Application Tracker
            </CardTitle>
            <p className="text-slate-500 text-sm mt-1">Track your application deadlines and progress</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-white" style={{ backgroundColor: '#F37021' }} onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingApp ? 'Edit Application' : 'Add New Application'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>University Name *</Label>
                    <Input
                      value={formData.university_name}
                      onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                      placeholder="e.g., University of Oxford"
                      required
                    />
                  </div>
                  <div>
                    <Label>Course Name</Label>
                    <Input
                      value={formData.course_name}
                      onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                      placeholder="e.g., MSc Computer Science"
                    />
                  </div>
                  <div>
                    <Label>Application Deadline *</Label>
                    <Input
                      type="date"
                      value={formData.application_deadline}
                      onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Submission Date</Label>
                    <Input
                      type="date"
                      value={formData.submission_date}
                      onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    className="w-full min-h-[80px] px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" className="text-white" style={{ backgroundColor: '#0066CC' }}>
                    {editingApp ? 'Update' : 'Add'} Application
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Upcoming Deadlines Alert */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFB347' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-2">Upcoming Deadlines</h4>
                <div className="space-y-2">
                  {upcomingDeadlines.slice(0, 3).map(app => {
                    const urgency = getUrgency(app.application_deadline);
                    const daysLeft = differenceInDays(new Date(app.application_deadline), new Date());
                    return (
                      <div key={app.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{app.university_name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`${urgency.color} text-white text-xs`}>
                            {isToday(new Date(app.application_deadline)) ? 'Today!' : `${daysLeft} days left`}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendDeadlineReminderMutation.mutate(app)}
                            className="h-7 px-2 text-xs"
                          >
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        {sortedApps.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No applications tracked yet</h3>
            <p className="text-slate-500 text-sm mb-4">Start tracking your university applications and deadlines</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedApps.map(app => {
              const urgency = getUrgency(app.application_deadline);
              const statusConfig = statusOptions.find(s => s.value === app.status) || statusOptions[0];
              const daysLeft = app.application_deadline ? differenceInDays(new Date(app.application_deadline), new Date()) : null;

              return (
                <div key={app.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">{app.university_name}</h4>
                      {app.course_name && (
                        <p className="text-sm text-slate-600 mb-2">{app.course_name}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        {app.application_deadline && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(app.application_deadline), 'MMM d, yyyy')}
                          </Badge>
                        )}
                        {urgency && daysLeft !== null && daysLeft >= 0 && (
                          <Badge className={`${urgency.color} text-white`}>
                            {isToday(new Date(app.application_deadline)) ? 'Due Today!' : `${daysLeft} days left`}
                          </Badge>
                        )}
                        {app.submission_date && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Submitted {format(new Date(app.submission_date), 'MMM d')}
                          </Badge>
                        )}
                      </div>
                      {app.notes && (
                        <p className="text-sm text-slate-600 mt-2 italic">{app.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(app)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this application?')) {
                            deleteAppMutation.mutate(app.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}