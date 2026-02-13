import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send } from 'lucide-react';

export default function SubmitStudentDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    admission_preferences: {
      study_destination: '',
      study_level: '',
    }
  });

  const submitStudent = useMutation({
    mutationFn: async (data) => {
      const inquiry = await base44.entities.Inquiry.create({
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone,
        country_of_interest: data.admission_preferences.study_destination,
        degree_level: data.admission_preferences.study_level,
        source: 'partner',
        status: 'new'
      });
      
      return base44.entities.StudentProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-students'] });
      queryClient.invalidateQueries({ queryKey: ['partner-applications'] });
      toast.success('Student submitted successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        nationality: '',
        admission_preferences: { study_destination: '', study_level: '' }
      });
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit student');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitStudent.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1234567890"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label>Nationality</Label>
            <Input
              value={formData.nationality}
              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
              className="mt-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Destination *</Label>
              <Select 
                value={formData.admission_preferences.study_destination}
                onValueChange={(v) => setFormData({...formData, admission_preferences: {...formData.admission_preferences, study_destination: v}})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Study Level *</Label>
              <Select 
                value={formData.admission_preferences.study_level}
                onValueChange={(v) => setFormData({...formData, admission_preferences: {...formData.admission_preferences, study_level: v}})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Foundation">Foundation</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitStudent.isPending}
              style={{ backgroundColor: '#0066CC', color: 'white' }}
            >
              {submitStudent.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Lead
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}