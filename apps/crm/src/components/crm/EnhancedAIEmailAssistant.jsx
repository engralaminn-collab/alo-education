import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Loader2, Send, Copy, RefreshCw, 
  Clock, Target, MessageSquare, TrendingUp, Mail
} from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedAIEmailAssistant({ students, universities, courses }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('new'); // 'new' or 'followup'
  const [formData, setFormData] = useState({
    student_id: '',
    university_id: '',
    course_id: '',
    purpose: 'course_inquiry',
    followup_type: 'gentle_reminder',
    days_since_last: 7,
    additional_context: ''
  });
  const [draftedEmail, setDraftedEmail] = useState(null);

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-for-email'],
    queryFn: () => base44.entities.Application.list(),
    enabled: mode === 'followup'
  });

  // Draft new outreach email
  const draftNewEmail = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.id === formData.student_id);
      const university = universities.find(u => u.id === formData.university_id);
      const course = formData.course_id ? courses.find(c => c.id === formData.course_id) : null;

      if (!student || !university) throw new Error('Missing required data');

      const prompt = `Draft a professional, compelling email from a study abroad consultancy to ${university.university_name}.

Purpose: ${formData.purpose === 'course_inquiry' ? 'inquiring about course details, admission requirements' :
           formData.purpose === 'scholarship_inquiry' ? 'inquiring about scholarships and financial aid' :
           formData.purpose === 'partnership' ? 'proposing partnership to refer students' : 'general inquiry'}
${course ? `Program: ${course.course_title} (${course.level})` : ''}

Student Profile (keep anonymous):
- Degree Level: ${student.preferred_degree_level || course?.level || 'Graduate'}
- Academic Background: ${student.education?.highest_degree || 'Bachelor'} in ${student.education?.field_of_study || 'relevant field'}
- GPA: ${student.education?.gpa || 'N/A'}/${student.education?.gpa_scale || 'N/A'}
- English: ${student.english_proficiency?.test_type || 'Preparing'} ${student.english_proficiency?.score || ''}
- Experience: ${student.work_experience_years || 0} years
${formData.additional_context ? `\nContext: ${formData.additional_context}` : ''}

Requirements:
- Professional, concise (300-400 words)
- Introduce consultancy briefly
- Express genuine interest
- Mention qualified candidate (anonymous)
- Ask relevant questions
- Request next steps
- Professional closing

Return JSON: subject, body, suggested_follow_up_days`;

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

      return { ...response, student, university, course, type: 'new' };
    },
    onSuccess: (data) => {
      setDraftedEmail(data);
      toast.success('Email drafted!');
    },
    onError: () => toast.error('Failed to draft email')
  });

  // Draft follow-up email
  const draftFollowUp = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.id === formData.student_id);
      const application = applications.find(a => a.student_id === formData.student_id);
      const university = universities.find(u => u.id === application?.university_id);
      const course = courses.find(c => c.id === application?.course_id);

      if (!student || !application) throw new Error('Missing data');

      const followupPrompts = {
        gentle_reminder: 'A polite reminder about pending application status',
        urgent_deadline: 'Urgent follow-up regarding approaching deadline',
        document_request: 'Follow-up requesting missing documents or information',
        offer_acceptance: 'Follow-up to encourage accepting conditional/unconditional offer',
        visa_support: 'Follow-up requesting visa support letter or CAS',
        general_update: 'General check-in requesting application status update'
      };

      const prompt = `Draft a professional follow-up email from study abroad consultancy to ${university?.university_name}.

Context:
- Previous application for: ${course?.course_title}
- Application status: ${application.status}
- Days since last contact: ${formData.days_since_last}
- Follow-up type: ${followupPrompts[formData.followup_type]}

Student details (anonymous):
- Application ID: ${application.id}
- Status: ${application.status}
- Priority: ${application.priority || 'standard'}
${application.offer_deadline ? `- Offer deadline: ${application.offer_deadline}` : ''}
${formData.additional_context ? `\nContext: ${formData.additional_context}` : ''}

Requirements:
- Professional, concise (200-300 words)
- Reference previous communication
- Be polite and respectful
- Clearly state what's needed
- Express continued interest
- Provide specific timeline if urgent
- Professional closing

Tone: ${formData.followup_type === 'urgent_deadline' ? 'Urgent but polite' : 
       formData.followup_type === 'gentle_reminder' ? 'Friendly and patient' : 'Professional and direct'}

Return JSON: subject, body, suggested_follow_up_days`;

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

      return { ...response, student, university, course, application, type: 'followup' };
    },
    onSuccess: (data) => {
      setDraftedEmail(data);
      toast.success('Follow-up email drafted!');
    },
    onError: () => toast.error('Failed to draft follow-up')
  });

  const saveEmail = useMutation({
    mutationFn: async () => {
      await base44.entities.UniversityOutreach.create({
        student_id: formData.student_id,
        university_id: draftedEmail.university.id,
        course_id: draftedEmail.course?.id || null,
        outreach_type: mode === 'followup' ? 'follow_up' : formData.purpose,
        email_subject: draftedEmail.subject,
        email_body: draftedEmail.body,
        status: 'draft',
        automated: false,
        counselor_notes: `AI-drafted ${mode}. Suggested follow-up: ${draftedEmail.suggested_follow_up_days} days`
      });

      // Also create a task for counselor
      await base44.entities.Task.create({
        title: `Review and send: ${draftedEmail.subject}`,
        description: `AI-drafted email ready for review and sending`,
        type: 'follow_up',
        student_id: formData.student_id,
        assigned_to: draftedEmail.student.counselor_id,
        priority: mode === 'followup' && formData.followup_type === 'urgent_deadline' ? 'urgent' : 'medium',
        due_date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Email saved as draft!');
      resetForm();
    }
  });

  const resetForm = () => {
    setDraftedEmail(null);
    setFormData({
      student_id: '',
      university_id: '',
      course_id: '',
      purpose: 'course_inquiry',
      followup_type: 'gentle_reminder',
      days_since_last: 7,
      additional_context: ''
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${draftedEmail.subject}\n\n${draftedEmail.body}`);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Email Assistant
        </CardTitle>
        <p className="text-sm text-slate-600">Generate personalized emails based on student profiles</p>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new" className="gap-2">
              <Mail className="w-4 h-4" />
              New Outreach
            </TabsTrigger>
            <TabsTrigger value="followup" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Follow-up
            </TabsTrigger>
          </TabsList>

          {!draftedEmail ? (
            <>
              {/* New Outreach Form */}
              <TabsContent value="new" className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <Select value={formData.student_id} onValueChange={(v) => setFormData({...formData, student_id: v})}>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select course..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>General inquiry</SelectItem>
                      {courses.filter(c => c.university_id === formData.university_id).map(c => (
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
                    <SelectTrigger>
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
                  <Label>Additional Context</Label>
                  <Textarea
                    value={formData.additional_context}
                    onChange={(e) => setFormData({...formData, additional_context: e.target.value})}
                    placeholder="Any specific details to include..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => draftNewEmail.mutate()}
                  disabled={!formData.student_id || !formData.university_id || draftNewEmail.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {draftNewEmail.isPending ? (
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
              </TabsContent>

              {/* Follow-up Form */}
              <TabsContent value="followup" className="space-y-4">
                <div>
                  <Label>Student with Application</Label>
                  <Select value={formData.student_id} onValueChange={(v) => setFormData({...formData, student_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.filter(s => applications.some(a => a.student_id === s.id)).map(s => {
                        const app = applications.find(a => a.student_id === s.id);
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            {s.first_name} {s.last_name} - {app?.status}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Follow-up Type</Label>
                  <Select value={formData.followup_type} onValueChange={(v) => setFormData({...formData, followup_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle_reminder">Gentle Reminder</SelectItem>
                      <SelectItem value="urgent_deadline">Urgent Deadline</SelectItem>
                      <SelectItem value="document_request">Document Request</SelectItem>
                      <SelectItem value="offer_acceptance">Offer Acceptance</SelectItem>
                      <SelectItem value="visa_support">Visa Support Request</SelectItem>
                      <SelectItem value="general_update">General Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Days Since Last Contact</Label>
                  <Select value={formData.days_since_last.toString()} onValueChange={(v) => setFormData({...formData, days_since_last: parseInt(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 7, 14, 21, 30].map(days => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} days ago
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Additional Context</Label>
                  <Textarea
                    value={formData.additional_context}
                    onChange={(e) => setFormData({...formData, additional_context: e.target.value})}
                    placeholder="Specific issues or urgency details..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => draftFollowUp.mutate()}
                  disabled={!formData.student_id || draftFollowUp.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {draftFollowUp.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Drafting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Draft Follow-up
                    </>
                  )}
                </Button>
              </TabsContent>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-700">
                  {draftedEmail.type === 'followup' ? 'Follow-up Email' : 'New Outreach'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  Follow up in {draftedEmail.suggested_follow_up_days} days
                </Badge>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="mb-3">
                  <Label className="text-xs text-purple-600 font-semibold">SUBJECT</Label>
                  <p className="font-semibold text-slate-900 mt-1">{draftedEmail.subject}</p>
                </div>
                <div>
                  <Label className="text-xs text-purple-600 font-semibold">EMAIL BODY</Label>
                  <p className="text-sm text-slate-700 whitespace-pre-line mt-2 leading-relaxed">
                    {draftedEmail.body}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  onClick={() => mode === 'followup' ? draftFollowUp.mutate() : draftNewEmail.mutate()} 
                  variant="outline" 
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>

              <Button
                onClick={() => saveEmail.mutate()}
                disabled={saveEmail.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {saveEmail.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Save as Draft & Create Task
                  </>
                )}
              </Button>

              <Button onClick={resetForm} variant="outline" className="w-full">
                Start New Draft
              </Button>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}