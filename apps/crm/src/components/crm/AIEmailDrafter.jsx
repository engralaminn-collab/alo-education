import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Send, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AIEmailDrafter({ students, universities, courses }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    student_id: '',
    university_id: '',
    course_id: '',
    purpose: 'course_inquiry',
    additional_context: ''
  });
  const [draftedEmail, setDraftedEmail] = useState(null);

  const draftEmail = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.id === formData.student_id);
      const university = universities.find(u => u.id === formData.university_id);
      const course = formData.course_id ? courses.find(c => c.id === formData.course_id) : null;

      if (!student || !university) throw new Error('Missing required data');

      const purposePrompts = {
        course_inquiry: 'inquiring about course details, admission requirements, and application process',
        scholarship_inquiry: 'inquiring about available scholarships, financial aid, and funding opportunities',
        partnership: 'proposing a partnership opportunity to refer qualified students',
        general_inquiry: 'seeking general information about the university and programs'
      };

      const prompt = `Draft a professional, compelling email from a study abroad consultancy to ${university.university_name || university.name}.

Purpose: ${purposePrompts[formData.purpose]}
${course ? `Specific Program: ${course.course_title} (${course.level})` : ''}

Student Context (do not mention student name, keep it general):
- Target Degree: ${student.preferred_degree_level || course?.level || 'Graduate studies'}
- Academic Background: ${student.education?.highest_degree || 'Bachelor degree'} in ${student.education?.field_of_study || 'relevant field'}
- GPA: ${student.education?.gpa || 'N/A'}/${student.education?.gpa_scale || 'N/A'}
- English Proficiency: ${student.english_proficiency?.test_type || 'preparing for test'} ${student.english_proficiency?.score || ''}
- Work Experience: ${student.work_experience_years || 0} years
- Country Interest: ${university.country}
${formData.additional_context ? `\nAdditional Context: ${formData.additional_context}` : ''}

Email should:
1. Be professional and concise (300-400 words)
2. Introduce our consultancy briefly
3. Express genuine interest in the university/program
4. Mention we represent a qualified candidate (without naming)
5. Ask specific, relevant questions based on purpose
6. Request next steps or meeting
7. Include a professional closing

Return JSON with: subject, body, suggested_follow_up_days (number of days to wait for response)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
            suggested_follow_up_days: { type: "number" }
          }
        }
      });

      return { ...response, student, university, course };
    },
    onSuccess: (data) => {
      setDraftedEmail(data);
      toast.success('Email drafted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to draft email: ' + error.message);
    }
  });

  const saveAsDraft = useMutation({
    mutationFn: async () => {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + draftedEmail.suggested_follow_up_days);

      await base44.entities.UniversityOutreach.create({
        student_id: formData.student_id,
        university_id: formData.university_id,
        course_id: formData.course_id || null,
        outreach_type: formData.purpose,
        email_subject: draftedEmail.subject,
        email_body: draftedEmail.body,
        status: 'draft',
        automated: false,
        counselor_notes: `AI-drafted. Suggested follow-up: ${draftedEmail.suggested_follow_up_days} days`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Draft saved!');
      setDraftedEmail(null);
      setFormData({
        student_id: '',
        university_id: '',
        course_id: '',
        purpose: 'course_inquiry',
        additional_context: ''
      });
    }
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${draftedEmail.subject}\n\n${draftedEmail.body}`);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Email Drafter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!draftedEmail ? (
          <>
            <div>
              <Label>Student</Label>
              <Select value={formData.student_id} onValueChange={(v) => setFormData({...formData, student_id: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select student..." />
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

            <div>
              <Label>University</Label>
              <Select value={formData.university_id} onValueChange={(v) => setFormData({...formData, university_id: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select university..." />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.university_name} - {u.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Course (Optional)</Label>
              <Select value={formData.course_id} onValueChange={(v) => setFormData({...formData, course_id: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select course or leave blank..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No specific course</SelectItem>
                  {courses
                    .filter(c => c.university_id === formData.university_id)
                    .map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.course_title} ({c.level})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Purpose</Label>
              <Select value={formData.purpose} onValueChange={(v) => setFormData({...formData, purpose: v})}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course_inquiry">Course Inquiry</SelectItem>
                  <SelectItem value="scholarship_inquiry">Scholarship Inquiry</SelectItem>
                  <SelectItem value="partnership">Partnership Proposal</SelectItem>
                  <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Additional Context (Optional)</Label>
              <Textarea
                value={formData.additional_context}
                onChange={(e) => setFormData({...formData, additional_context: e.target.value})}
                placeholder="Any specific details to include..."
                className="mt-2"
                rows={3}
              />
            </div>

            <Button
              onClick={() => draftEmail.mutate()}
              disabled={!formData.student_id || !formData.university_id || draftEmail.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {draftEmail.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Drafting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Draft Email
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <div className="mb-3">
                <Label className="text-xs text-slate-600">SUBJECT</Label>
                <p className="font-semibold text-slate-900">{draftedEmail.subject}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-600">EMAIL BODY</Label>
                <p className="text-sm text-slate-700 whitespace-pre-line mt-2">
                  {draftedEmail.body}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-slate-600">
                  💡 Suggested follow-up: {draftedEmail.suggested_follow_up_days} days after sending
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={() => draftEmail.mutate()}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>

            <Button
              onClick={() => saveAsDraft.mutate()}
              disabled={saveAsDraft.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {saveAsDraft.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>

            <Button
              onClick={() => setDraftedEmail(null)}
              variant="outline"
              className="w-full"
            >
              Start New Draft
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}