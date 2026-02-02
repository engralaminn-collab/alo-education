import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Send, Clock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function AIOutreachEmailDrafter({ student, university, course }) {
  const [email, setEmail] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const generateEmail = async () => {
    setGenerating(true);
    
    try {
      const prompt = `Draft a professional outreach email to ${university.university_name}'s admissions office regarding a student inquiry.

Student Details:
- Name: ${student.first_name} ${student.last_name}
- Nationality: ${student.nationality || 'Not specified'}
- Academic Background: ${student.education?.highest_degree || 'Not specified'} in ${student.education?.field_of_study || 'Not specified'}
- GPA: ${student.education?.gpa || 'Not specified'}
- English Proficiency: ${student.english_proficiency?.test_type || 'Not specified'} ${student.english_proficiency?.score || ''}
- Work Experience: ${student.work_experience_years || 0} years

Course of Interest:
- ${course?.course_title || 'General inquiry about programs'}
- Level: ${course?.level || student.preferred_degree_level || 'Not specified'}
- Subject: ${course?.subject_area || student.preferred_fields?.[0] || 'Not specified'}

The email should:
1. Be professional and concise
2. Introduce the student and their qualifications
3. Express interest in the specific course/program
4. Ask about admission requirements, deadlines, and scholarship opportunities
5. Request information about the application process
6. Include a polite closing

Also suggest:
- Best time to send (morning/afternoon/evening in university's timezone)
- Best channel (email/phone/admissions portal)
- Follow-up timeline (days to wait before following up)

Return JSON with email_subject, email_body, suggested_send_time, suggested_channel, follow_up_days.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            email_subject: { type: "string" },
            email_body: { type: "string" },
            suggested_send_time: { type: "string" },
            suggested_channel: { type: "string" },
            follow_up_days: { type: "number" }
          }
        }
      });

      setEmail(response);
      toast.success('Email drafted successfully!');
    } catch (error) {
      toast.error('Failed to generate email');
    }
    
    setGenerating(false);
  };

  const saveOutreach = useMutation({
    mutationFn: async () => {
      const outreach = await base44.entities.UniversityOutreach.create({
        student_id: student.id,
        university_id: university.id,
        course_id: course?.id,
        outreach_type: course ? 'course_inquiry' : 'general_inquiry',
        email_subject: email.email_subject,
        email_body: email.email_body,
        status: 'draft',
        automated: true,
        counselor_notes: `AI-suggested send time: ${email.suggested_send_time}\nAI-suggested channel: ${email.suggested_channel}\nFollow-up in ${email.follow_up_days} days`
      });

      // Create follow-up task
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + (email.follow_up_days || 7));
      
      await base44.entities.Task.create({
        title: `Follow up on ${university.university_name} outreach`,
        description: `Check for response from ${university.university_name} regarding ${student.first_name}'s inquiry`,
        type: 'follow_up',
        student_id: student.id,
        assigned_to: student.counselor_id,
        status: 'pending',
        priority: 'medium',
        due_date: followUpDate.toISOString().split('T')[0]
      });

      return outreach;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Outreach saved! Follow-up task created.');
      setEmail(null);
    }
  });

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Email Drafter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!email ? (
          <div className="text-center py-6">
            <Mail className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
            <p className="text-sm text-indigo-700 mb-4">
              Generate a personalized outreach email to {university.university_name}
            </p>
            <Button 
              onClick={generateEmail}
              disabled={generating}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Drafting Email...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Draft Email
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Suggestions */}
            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
              <h4 className="font-semibold text-sm text-indigo-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Recommendations
              </h4>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="text-center p-2 bg-indigo-50 rounded-lg">
                  <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-indigo-900">Send Time</p>
                  <p className="text-xs text-indigo-700">{email.suggested_send_time}</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <Mail className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-purple-900">Channel</p>
                  <p className="text-xs text-purple-700">{email.suggested_channel}</p>
                </div>
                <div className="text-center p-2 bg-pink-50 rounded-lg">
                  <Clock className="w-4 h-4 text-pink-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-pink-900">Follow-up</p>
                  <p className="text-xs text-pink-700">{email.follow_up_days} days</p>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Subject</label>
              {editing ? (
                <input 
                  type="text"
                  value={email.email_subject}
                  onChange={(e) => setEmail({ ...email, email_subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <div className="bg-white p-3 rounded-lg border font-medium text-slate-900">
                  {email.email_subject}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Email Body</label>
              {editing ? (
                <Textarea 
                  value={email.email_body}
                  onChange={(e) => setEmail({ ...email, email_body: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="bg-white p-4 rounded-lg border whitespace-pre-wrap text-sm text-slate-700">
                  {email.email_body}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setEditing(!editing)}
                className="flex-1"
              >
                {editing ? 'Preview' : 'Edit'}
              </Button>
              <Button 
                onClick={() => saveOutreach.mutate()}
                disabled={saveOutreach.isPending}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {saveOutreach.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Save & Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}