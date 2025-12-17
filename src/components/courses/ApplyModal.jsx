import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, Send } from 'lucide-react';

export default function ApplyModal({ open, onClose, course, university }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    qualification: '',
    english_test_type: '',
    notes: ''
  });

  const createLead = useMutation({
    mutationFn: async (data) => {
      // Generate lead code
      const leadCode = `LD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      return base44.entities.Lead.create({
        lead_code: leadCode,
        source: 'course_finder_apply',
        status: 'new',
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        course_id: course?.id,
        university_id: university?.id,
        destination_country: course?.country,
        study_level: course?.level,
        qualification: data.qualification,
        english_test_type: data.english_test_type,
        priority: 'high',
        page_url: window.location.href,
        notes: data.notes
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit application. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createLead.mutate(formData);
  };

  const handleWhatsApp = () => {
    const message = `Hi ALO Education, I'm interested in ${course?.course_title} at ${university?.university_name || university?.name} for ${course?.intake || 'upcoming intake'}. Please guide me.`;
    const whatsappUrl = `https://wa.me/8801805020101?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for your interest. Our counselor will contact you within 24 hours.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleWhatsApp}
                className="w-full"
                style={{ backgroundColor: '#25D366', color: 'white' }}
              >
                Chat on WhatsApp
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for this Course</DialogTitle>
          <DialogDescription>
            {course?.course_title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              required
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="Enter your full name"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Phone *</Label>
            <Input
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+880 1XXX-XXXXXX"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Current Qualification</Label>
            <Select 
              value={formData.qualification}
              onValueChange={(v) => setFormData({...formData, qualification: v})}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HSC">HSC</SelectItem>
                <SelectItem value="A-Level">A-Level</SelectItem>
                <SelectItem value="Diploma">Diploma</SelectItem>
                <SelectItem value="Bachelor">Bachelor</SelectItem>
                <SelectItem value="Master">Master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>English Test</Label>
            <Select 
              value={formData.english_test_type}
              onValueChange={(v) => setFormData({...formData, english_test_type: v})}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IELTS">IELTS</SelectItem>
                <SelectItem value="PTE">PTE</SelectItem>
                <SelectItem value="TOEFL">TOEFL</SelectItem>
                <SelectItem value="Duolingo">Duolingo</SelectItem>
                <SelectItem value="MOI">MOI</SelectItem>
                <SelectItem value="OIETC">OIETC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any specific requirements or questions..."
              rows={3}
              className="mt-2"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            style={{ backgroundColor: '#F37021', color: '#000000' }}
            disabled={createLead.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {createLead.isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}