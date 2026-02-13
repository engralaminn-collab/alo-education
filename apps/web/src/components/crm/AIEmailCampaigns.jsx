import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, Sparkles, Clock, TrendingUp, Send, 
  Eye, MousePointer, Calendar, Zap
} from 'lucide-react';
import { toast } from "sonner";

export default function AIEmailCampaigns({ studentId }) {
  const [emailSequence, setEmailSequence] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const { data: student } = useQuery({
    queryKey: ['student-email', studentId],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ id: studentId });
      return profiles[0];
    },
    enabled: !!studentId,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-apps-email', studentId],
    queryFn: () => base44.entities.Application.filter({ student_id: studentId }),
    enabled: !!studentId,
  });

  const generateSequenceMutation = useMutation({
    mutationFn: async (context) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a personalized email sequence for a student with:

Student Name: ${student?.first_name} ${student?.last_name}
Profile Status: ${student?.status}
Applications: ${applications.map(a => a.status).join(', ')}
Context: ${context}

Create a 3-email sequence with:
1. Initial outreach email (warm, engaging)
2. Follow-up email (value-driven, helpful resources)
3. Final check-in email (action-oriented)

For each email provide:
- subject line
- body (personalized, 2-3 paragraphs)
- call_to_action
- optimal_send_time (format: "Day X, HH:00" e.g., "Day 0, 10:00", "Day 3, 14:00")
- expected_engagement_rate (percentage)`,
        response_json_schema: {
          type: "object",
          properties: {
            sequence_name: { type: "string" },
            emails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  email_number: { type: "number" },
                  subject: { type: "string" },
                  body: { type: "string" },
                  call_to_action: { type: "string" },
                  optimal_send_time: { type: "string" },
                  expected_engagement_rate: { type: "number" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setEmailSequence(data);
      toast.success('Email sequence generated!');
    },
    onError: () => {
      toast.error('Failed to generate sequence');
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (emailData) => {
      await base44.integrations.Core.SendEmail({
        to: student.email,
        subject: emailData.subject,
        body: emailData.body,
        from_name: 'ALO Education Team'
      });
    },
    onSuccess: () => {
      toast.success('Email sent successfully!');
    },
  });

  const templates = [
    { value: 'application_reminder', label: 'Application Reminder' },
    { value: 'document_request', label: 'Document Request' },
    { value: 'scholarship_opportunity', label: 'Scholarship Opportunity' },
    { value: 'interview_prep', label: 'Interview Preparation' },
    { value: 'visa_guidance', label: 'Visa Guidance' },
    { value: 'general_checkin', label: 'General Check-in' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            AI Email Campaigns
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div>
          <Label>Campaign Type</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {templates.map(template => (
              <Button
                key={template.value}
                variant={selectedTemplate === template.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedTemplate(template.value);
                  generateSequenceMutation.mutate(template.label);
                }}
                disabled={generateSequenceMutation.isPending}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {!emailSequence && (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-slate-600 mb-4">Select a campaign type to generate personalized email sequence</p>
          </div>
        )}

        {/* Email Sequence */}
        {emailSequence && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">{emailSequence.sequence_name}</h3>
              <p className="text-sm text-blue-700">
                {emailSequence.emails.length}-email automated sequence with AI-optimized send times
              </p>
            </div>

            {/* Email Cards */}
            {emailSequence.emails.map((email, idx) => (
              <Card key={idx} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="mb-2">Email {email.email_number}</Badge>
                      <h4 className="font-semibold text-slate-900">{email.subject}</h4>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3" />
                        {email.optimal_send_time}
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        {email.expected_engagement_rate}% engagement
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm text-slate-700">
                      {email.body}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <strong>CTA:</strong> {email.call_to_action}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendEmailMutation.mutate(email)}
                      disabled={sendEmailMutation.isPending}
                    >
                      <Send className="w-3 h-3 mr-2" />
                      Send Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Schedule All */}
            <Button className="w-full" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Entire Sequence
            </Button>
          </div>
        )}

        {/* Tracking Metrics */}
        {emailSequence && (
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-sm">Campaign Analytics (Coming Soon)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Eye className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <div className="text-xs text-slate-600">Opens</div>
                </div>
                <div className="text-center">
                  <MousePointer className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <div className="text-xs text-slate-600">Clicks</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                  <div className="text-2xl font-bold text-slate-900">0%</div>
                  <div className="text-xs text-slate-600">Response Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}