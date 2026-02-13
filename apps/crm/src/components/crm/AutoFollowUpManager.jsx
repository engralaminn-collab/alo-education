import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Send, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

export default function AutoFollowUpManager({ outreaches, students, universities }) {
  const queryClient = useQueryClient();

  // Filter outreaches that need follow-up (sent 7+ days ago, no response)
  const needsFollowUp = outreaches.filter(o => {
    if (o.status !== 'sent' || o.response_received) return false;
    if (!o.sent_date) return false;
    const daysSince = differenceInDays(new Date(), new Date(o.sent_date));
    return daysSince >= 7;
  });

  const generateFollowUp = useMutation({
    mutationFn: async (outreach) => {
      const student = students.find(s => s.id === outreach.student_id);
      const university = universities.find(u => u.id === outreach.university_id);
      const daysSince = differenceInDays(new Date(), new Date(outreach.sent_date));

      const prompt = `Generate a professional follow-up email for a previous university inquiry.

Original Email Subject: ${outreach.email_subject}
Days Since Sent: ${daysSince}
University: ${university?.university_name || university?.name}

The follow-up should:
1. Be polite and non-pushy
2. Reference the original inquiry briefly
3. Reiterate interest
4. Gently request an update
5. Offer alternative contact methods
6. Be concise (150-200 words)

Return JSON with subject and body for the follow-up email.`;

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

      // Create new outreach entry for the follow-up
      await base44.entities.UniversityOutreach.create({
        student_id: outreach.student_id,
        university_id: outreach.university_id,
        course_id: outreach.course_id,
        outreach_type: outreach.outreach_type,
        email_subject: response.subject,
        email_body: response.body,
        status: 'draft',
        automated: true,
        counselor_notes: `Auto-generated follow-up to outreach from ${format(new Date(outreach.sent_date), 'MMM d, yyyy')}`
      });

      // Update original outreach status
      await base44.entities.UniversityOutreach.update(outreach.id, {
        status: 'follow_up_needed'
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Follow-up email generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate follow-up: ' + error.message);
    }
  });

  const markAsNoResponse = useMutation({
    mutationFn: async (outreachId) => {
      await base44.entities.UniversityOutreach.update(outreachId, {
        status: 'closed',
        counselor_notes: 'Closed - No response received'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Marked as closed');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Auto Follow-Up Manager
        </CardTitle>
        <CardDescription>
          Outreaches waiting 7+ days without response
        </CardDescription>
      </CardHeader>
      <CardContent>
        {needsFollowUp.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-slate-600">All caught up! No follow-ups needed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {needsFollowUp.map(outreach => {
              const student = students.find(s => s.id === outreach.student_id);
              const university = universities.find(u => u.id === outreach.university_id);
              const daysSince = differenceInDays(new Date(), new Date(outreach.sent_date));

              return (
                <Card key={outreach.id} className="border-l-4 border-orange-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <h4 className="font-semibold text-slate-900">
                            {university?.university_name || university?.name}
                          </h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Student: {student?.first_name} {student?.last_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          Sent {format(new Date(outreach.sent_date), 'MMM d, yyyy')} ({daysSince} days ago)
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">
                        {daysSince} days
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => generateFollowUp.mutate(outreach)}
                        disabled={generateFollowUp.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Generate Follow-Up
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsNoResponse.mutate(outreach.id)}
                        disabled={markAsNoResponse.isPending}
                      >
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}