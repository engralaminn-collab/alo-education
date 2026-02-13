import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Loader2, CheckCircle, FileText, Send } from 'lucide-react';

export default function QuickApplicationModal({ 
  open, 
  onClose, 
  course, 
  university,
  studentProfile 
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    intake: '',
    essay: '',
    additional_info: '',
  });
  const [isGeneratingEssay, setIsGeneratingEssay] = useState(false);

  const queryClient = useQueryClient();

  const generateEssay = useMutation({
    mutationFn: async () => {
      const prompt = `Write a compelling personal statement/essay for this application:

STUDENT BACKGROUND:
- Education: ${JSON.stringify(studentProfile?.education_history)}
- Work Experience: ${studentProfile?.work_experience_years || 0} years
- Interests: ${studentProfile?.preferred_fields?.join(', ')}
- English: ${studentProfile?.english_proficiency?.test_type} ${studentProfile?.english_proficiency?.overall_score}

APPLICATION DETAILS:
- Course: ${course?.course_title}
- University: ${university?.university_name}
- Level: ${course?.level}
- Country: ${university?.country}

Write a 300-400 word personal statement that:
1. Explains motivation for this course
2. Connects student's background to the course
3. Highlights relevant experience and skills
4. Shows enthusiasm and future goals
5. Is professional yet personal

Return only the essay text, no additional formatting.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
      });

      return response;
    },
    onSuccess: (essay) => {
      setFormData({ ...formData, essay });
      toast.success('Essay generated successfully!');
    },
  });

  const submitApplication = useMutation({
    mutationFn: async () => {
      if (!studentProfile?.id) throw new Error('Student profile not found');

      const applicationData = {
        student_id: studentProfile.id,
        university_id: university.id,
        course_id: course.id,
        status: 'draft',
        intake: formData.intake,
        tuition_fee: course.tuition_fee_min,
        student_notes: formData.additional_info,
        milestones: {
          documents_submitted: { completed: false },
          application_submitted: { completed: false },
          offer_received: { completed: false },
          visa_applied: { completed: false },
          visa_approved: { completed: false },
          enrolled: { completed: false },
        },
      };

      const app = await base44.entities.Application.create(applicationData);

      // Save essay as document
      if (formData.essay) {
        await base44.entities.Document.create({
          student_id: studentProfile.id,
          application_id: app.id,
          document_type: 'sop',
          name: 'Personal Statement',
          status: 'pending',
        });
      }

      return app;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application started successfully!');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start application');
    },
  });

  const handleClose = () => {
    setStep(1);
    setFormData({ intake: '', essay: '', additional_info: '' });
    onClose();
  };

  if (!course || !university) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start Your Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Course Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-education-blue">{course.level}</Badge>
              <Badge variant="outline">{course.subject_area}</Badge>
            </div>
            <h3 className="font-bold text-lg text-slate-900">{course.course_title}</h3>
            <p className="text-sm text-slate-600">{university.university_name} • {university.country}</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-education-blue text-white' : 'bg-slate-200'}`}>
              1
            </div>
            <div className="flex-1 h-1 bg-slate-200">
              <div className={`h-full transition-all ${step >= 2 ? 'bg-education-blue' : ''}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-education-blue text-white' : 'bg-slate-200'}`}>
              2
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-4">Application Details</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Preferred Intake *</Label>
                    <Select value={formData.intake} onValueChange={(v) => setFormData({ ...formData, intake: v })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select intake" />
                      </SelectTrigger>
                      <SelectContent>
                        {course.intake?.split(',').map(intake => (
                          <SelectItem key={intake.trim()} value={intake.trim()}>
                            {intake.trim()}
                          </SelectItem>
                        ))}
                        <SelectItem value="January 2026">January 2026</SelectItem>
                        <SelectItem value="September 2026">September 2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Additional Information</Label>
                    <Textarea
                      value={formData.additional_info}
                      onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                      placeholder="Any additional details you'd like to share..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Pre-filled from Your Profile
                </h5>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>• Name: {studentProfile?.first_name} {studentProfile?.last_name}</p>
                  <p>• Email: {studentProfile?.email}</p>
                  <p>• Education: {studentProfile?.education_history?.length || 0} qualifications</p>
                  <p>• English: {studentProfile?.english_proficiency?.test_type || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!formData.intake}
                  className="bg-gradient-brand"
                >
                  Continue to Essay
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Statement */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Personal Statement / Essay</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateEssay.mutate()}
                    disabled={generateEssay.isPending}
                  >
                    {generateEssay.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />AI Generate</>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={formData.essay}
                  onChange={(e) => setFormData({ ...formData, essay: e.target.value })}
                  placeholder="Write or generate your personal statement..."
                  className="mt-2 min-h-[300px]"
                  rows={15}
                />
                <p className="text-xs text-slate-500 mt-2">
                  {formData.essay.length} characters • Recommended: 1500-2000
                </p>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFormData({ ...formData, essay: '' });
                      submitApplication.mutate();
                    }}
                  >
                    Skip Essay
                  </Button>
                  <Button 
                    onClick={() => submitApplication.mutate()}
                    disabled={submitApplication.isPending}
                    className="bg-gradient-brand"
                  >
                    {submitApplication.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />Start Application</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}