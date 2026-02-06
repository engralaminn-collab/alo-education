import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function LogInteractionModal({ students, selectedStudent, counselorId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    student_id: selectedStudent?.id || '',
    interaction_type: 'call',
    interaction_date: new Date().toISOString().slice(0, 16),
    duration_minutes: '',
    summary: '',
    action_items: '',
    follow_up_required: false,
    follow_up_date: '',
    sentiment: 'neutral'
  });

  const logInteraction = useMutation({
    mutationFn: (data) => base44.entities.CounselorInteraction.create({
      ...data,
      counselor_id: counselorId,
      action_items: data.action_items ? data.action_items.split('\n').filter(Boolean) : []
    }),
    onSuccess: () => {
      toast.success('Interaction logged successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to log interaction');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    logInteraction.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Student Interaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Student</Label>
            <Select value={formData.student_id} onValueChange={(v) => setFormData({ ...formData, student_id: v })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Interaction Type</Label>
              <Select value={formData.interaction_type} onValueChange={(v) => setFormData({ ...formData, interaction_type: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">In-Person Meeting</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="video_call">Video Call</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="mt-2"
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.interaction_date}
                onChange={(e) => setFormData({ ...formData, interaction_date: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Student Sentiment</Label>
              <Select value={formData.sentiment} onValueChange={(v) => setFormData({ ...formData, sentiment: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Summary</Label>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              className="mt-2"
              placeholder="Brief summary of the interaction..."
              required
            />
          </div>

          <div>
            <Label>Action Items (one per line)</Label>
            <Textarea
              value={formData.action_items}
              onChange={(e) => setFormData({ ...formData, action_items: e.target.value })}
              rows={3}
              className="mt-2"
              placeholder="Send transcript&#10;Schedule follow-up meeting&#10;Review application"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.follow_up_required}
                onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-education-blue"
              />
              <span className="text-sm">Follow-up required</span>
            </label>

            {formData.follow_up_required && (
              <div>
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  className="mt-2"
                  required={formData.follow_up_required}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={logInteraction.isPending} className="bg-education-blue">
              {logInteraction.isPending ? 'Logging...' : 'Log Interaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}