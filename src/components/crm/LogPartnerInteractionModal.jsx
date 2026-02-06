import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function LogPartnerInteractionModal({ open, onClose, university, counselors }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    university_id: university?.id || '',
    counselor_id: '',
    interaction_type: '',
    interaction_date: new Date(),
    subject: '',
    summary: '',
    follow_up_required: false,
    follow_up_date: null,
    outcome: ''
  });

  const createInteraction = useMutation({
    mutationFn: (data) => base44.entities.UniversityInteraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universityInteractions'] });
      toast.success('Interaction logged successfully');
      onClose();
      resetForm();
    },
    onError: () => toast.error('Failed to log interaction')
  });

  const resetForm = () => {
    setFormData({
      university_id: university?.id || '',
      counselor_id: '',
      interaction_type: '',
      interaction_date: new Date(),
      subject: '',
      summary: '',
      follow_up_required: false,
      follow_up_date: null,
      outcome: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createInteraction.mutate({
      ...formData,
      interaction_date: formData.interaction_date.toISOString(),
      follow_up_date: formData.follow_up_date?.toISOString()
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Partner Interaction</DialogTitle>
          <p className="text-sm text-slate-500">{university?.university_name}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Interaction Type *</Label>
              <Select value={formData.interaction_type} onValueChange={(val) => setFormData({...formData, interaction_type: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="meeting">In-Person Meeting</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Counselor/Staff *</Label>
              <Select value={formData.counselor_id} onValueChange={(val) => setFormData({...formData, counselor_id: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select counselor" />
                </SelectTrigger>
                <SelectContent>
                  {counselors?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Interaction Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(formData.interaction_date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={formData.interaction_date}
                  onSelect={(date) => setFormData({...formData, interaction_date: date})}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Subject *</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="e.g., Discussed 2026 partnership terms"
              required
            />
          </div>

          <div>
            <Label>Summary *</Label>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              placeholder="Detailed summary of the interaction..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Outcome</Label>
            <Textarea
              value={formData.outcome}
              onChange={(e) => setFormData({...formData, outcome: e.target.value})}
              placeholder="What was achieved or decided..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="follow_up"
              checked={formData.follow_up_required}
              onChange={(e) => setFormData({...formData, follow_up_required: e.target.checked})}
              className="w-4 h-4"
            />
            <Label htmlFor="follow_up">Follow-up Required</Label>
          </div>

          {formData.follow_up_required && (
            <div>
              <Label>Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formData.follow_up_date ? format(formData.follow_up_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.follow_up_date}
                    onSelect={(date) => setFormData({...formData, follow_up_date: date})}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createInteraction.isPending}>
              {createInteraction.isPending ? 'Saving...' : 'Log Interaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}