import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AIEmailDrafter({ student, application, type = 'status_update' }) {
  const [draftEmail, setDraftEmail] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateEmail = useMutation({
    mutationFn: async () => {
      const context = {
        studentName: `${student?.first_name || ''} ${student?.last_name || ''}`,
        email: student?.email,
        applicationStatus: application?.status,
        courseName: application?.course_title,
        universityName: application?.university_name,
        destination: application?.destination_country
      };

      let prompt = '';
      if (type === 'status_update') {
        prompt = `Draft a professional email to ${context.studentName} updating them about their application status.
        Current status: ${context.applicationStatus}
        Course: ${context.courseName}
        University: ${context.universityName}
        
        Make it friendly, informative, and professional. Include next steps.`;
      } else if (type === 'document_request') {
        prompt = `Draft a polite email to ${context.studentName} requesting missing documents for their application.
        Course: ${context.courseName}
        
        List common documents: passport copy, transcripts, English test results, SOP, LORs.
        Be professional but friendly. Include deadline.`;
      } else if (type === 'deadline_reminder') {
        prompt = `Draft a gentle reminder email to ${context.studentName} about upcoming deadlines.
        Application: ${context.courseName} at ${context.universityName}
        
        Be encouraging and offer help. Professional tone.`;
      }

      if (customInstructions) {
        prompt += `\n\nAdditional instructions: ${customInstructions}`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setDraftEmail(`Subject: ${data.subject}\n\n${data.body}`);
      toast.success('Email draft generated!');
      setGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate email');
      setGenerating(false);
    }
  });

  const handleGenerate = () => {
    setGenerating(true);
    generateEmail.mutate();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftEmail);
    toast.success('Email copied to clipboard!');
  };

  const sendEmail = async () => {
    if (!student?.email || !draftEmail) return;
    
    try {
      const [subject, ...bodyParts] = draftEmail.split('\n\n');
      const body = bodyParts.join('\n\n');
      
      await base44.integrations.Core.SendEmail({
        to: student.email,
        subject: subject.replace('Subject: ', ''),
        body
      });
      toast.success('Email sent successfully!');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#F37021' }} />
          AI Email Drafter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Type</Label>
          <p className="text-sm text-slate-600 capitalize">{type.replace(/_/g, ' ')}</p>
        </div>

        <div>
          <Label>Custom Instructions (Optional)</Label>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Mention scholarship deadline, use formal tone..."
            rows={2}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full"
          style={{ backgroundColor: '#0066CC' }}
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Email
            </>
          )}
        </Button>

        {draftEmail && (
          <>
            <div>
              <Label>Generated Email</Label>
              <Textarea
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                rows={12}
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={sendEmail} className="flex-1" style={{ backgroundColor: '#F37021' }}>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}