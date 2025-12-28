import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Video, MapPin, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';
import { format } from 'date-fns';

export default function CRMGroupSessions() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    session_type: 'webinar',
    date: '',
    time: '',
    duration_minutes: 60,
    location: '',
    meeting_link: '',
    max_participants: 50,
    topics: '',
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['group-sessions'],
    queryFn: async () => {
      try {
        return await base44.entities.GroupSession.list('-date');
      } catch {
        return [];
      }
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupSession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-sessions'] });
      setShowDialog(false);
      resetForm();
      toast.success('Session created successfully');
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GroupSession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-sessions'] });
      setShowDialog(false);
      setEditingSession(null);
      resetForm();
      toast.success('Session updated');
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id) => base44.entities.GroupSession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-sessions'] });
      toast.success('Session deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      session_type: 'webinar',
      date: '',
      time: '',
      duration_minutes: 60,
      location: '',
      meeting_link: '',
      max_participants: 50,
      topics: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSession) {
      updateSessionMutation.mutate({ id: editingSession.id, data: formData });
    } else {
      createSessionMutation.mutate(formData);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || '',
      session_type: session.session_type || 'webinar',
      date: session.date?.split('T')[0] || '',
      time: session.time || '',
      duration_minutes: session.duration_minutes || 60,
      location: session.location || '',
      meeting_link: session.meeting_link || '',
      max_participants: session.max_participants || 50,
      topics: session.topics || '',
    });
    setShowDialog(true);
  };

  const copyMeetingLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Meeting link copied!');
  };

  const upcomingSessions = sessions.filter(s => new Date(s.date) >= new Date());
  const pastSessions = sessions.filter(s => new Date(s.date) < new Date());

  return (
    <CRMLayout 
      title="Group Sessions & Webinars"
      actions={
        <Button onClick={() => setShowDialog(true)} style={{ backgroundColor: '#F37021' }}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      }
    >
      {/* Upcoming Sessions */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
            <Calendar className="w-5 h-5" />
            Upcoming Sessions ({upcomingSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No upcoming sessions</p>
              <Button onClick={() => setShowDialog(true)} className="mt-4" variant="outline">
                Schedule Your First Session
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="border-2" style={{ borderColor: '#0066CC' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: '#0066CC' }}>
                          {session.title}
                        </h3>
                        <Badge className="mt-1" style={{ backgroundColor: '#F37021', color: 'white' }}>
                          {session.session_type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(session)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600"
                          onClick={() => deleteSessionMutation.mutate(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{session.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4" />
                        {session.date && format(new Date(session.date), 'MMM d, yyyy')} at {session.time}
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Users className="w-4 h-4" />
                        Max {session.max_participants} participants
                      </div>
                      {session.meeting_link && (
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-slate-700" />
                          <Button
                            size="sm"
                            variant="link"
                            className="p-0 h-auto text-blue-600"
                            onClick={() => copyMeetingLink(session.meeting_link)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Meeting Link
                          </Button>
                        </div>
                      )}
                      {session.location && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin className="w-4 h-4" />
                          {session.location}
                        </div>
                      )}
                    </div>

                    {session.topics && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Topics:</p>
                        <p className="text-xs text-slate-600">{session.topics}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-600">Past Sessions ({pastSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastSessions.map((session) => (
                <div key={session.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-700">{session.title}</p>
                    <p className="text-sm text-slate-500">
                      {session.date && format(new Date(session.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-slate-500">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) {
          setEditingSession(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSession ? 'Edit Session' : 'Schedule New Session'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Session Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Study in UK - Information Session"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the session..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Session Type *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.session_type}
                  onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                  required
                >
                  <option value="webinar">Webinar</option>
                  <option value="workshop">Workshop</option>
                  <option value="info_session">Info Session</option>
                  <option value="orientation">Orientation</option>
                </select>
              </div>

              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Meeting Link (Zoom, Google Meet, etc.)</Label>
              <Input
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div>
              <Label>Physical Location (if applicable)</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., ALO Office, Dhaka"
              />
            </div>

            <div>
              <Label>Topics to be Covered</Label>
              <Textarea
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                placeholder="List the main topics..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                style={{ backgroundColor: '#F37021' }}
              >
                {editingSession ? 'Update' : 'Create'} Session
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}