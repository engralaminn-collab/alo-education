import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, CheckCircle } from 'lucide-react';

export default function PartnerSubmitLead() {
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    admission_preferences: {
      study_destination: '',
      study_level: ''
    },
    lead_source: 'Partner'
  });

  const submitLead = useMutation({
    mutationFn: (data) => base44.entities.StudentProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-students']);
      setSubmitted(true);
      toast.success('Student lead submitted successfully!');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          nationality: '',
          admission_preferences: { study_destination: '', study_level: '' },
          lead_source: 'Partner'
        });
      }, 3000);
    },
    onError: () => {
      toast.error('Failed to submit lead. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLead.mutate(formData);
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Student Lead Submitted!</h3>
          <p className="text-slate-600 mb-6">
            The student information has been submitted successfully. Our team will process it shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" style={{ color: '#0066CC' }} />
          Submit Student Details
        </CardTitle>
        <CardDescription>
          Submit student details for admission processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                placeholder="John"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                placeholder="Doe"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1234567890"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Destination *</Label>
              <Select 
                value={formData.admission_preferences.study_destination}
                onValueChange={(v) => setFormData({
                  ...formData, 
                  admission_preferences: {...formData.admission_preferences, study_destination: v}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Study Level *</Label>
              <Select 
                value={formData.admission_preferences.study_level}
                onValueChange={(v) => setFormData({
                  ...formData, 
                  admission_preferences: {...formData.admission_preferences, study_level: v}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select study level" />
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

          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
              placeholder="e.g., Indian, Chinese"
              className="mt-2"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold"
            style={{ backgroundColor: '#F37021', color: '#000000' }}
            disabled={submitLead.isPending}
          >
            {submitLead.isPending ? 'Submitting...' : 'Submit Lead'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}