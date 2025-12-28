import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bell, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export default function AutoFollowUpScheduler() {
  const queryClient = useQueryClient();

  const { data: outreaches = [] } = useQuery({
    queryKey: ['pending-outreaches-followup'],
    queryFn: () => base44.entities.UniversityOutreach.filter({ 
      status: 'sent',
      response_received: false 
    }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-followup'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-followup'],
    queryFn: () => base44.entities.University.list(),
  });

  const scheduleFollowUp = useMutation({
    mutationFn: async (outreach) => {
      const student = students.find(s => s.id === outreach.student_id);
      const university = universities.find(u => u.id === outreach.university_id);

      const daysSinceSent = Math.floor(
        (Date.now() - new Date(outreach.sent_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      const prompt = `Generate a follow-up email for this university inquiry that was sent ${daysSinceSent} days ago.

ORIGINAL EMAIL SUBJECT: ${outreach.email_subject}
ORIGINAL EMAIL BODY: ${outreach.email_body}

UNIVERSITY: ${university?.university_name}
STUDENT: ${student?.first_name} ${student?.last_name}

Follow-up should:
1. Politely reference the original inquiry
2. Express continued interest
3. Inquire if they need any additional information
4. Be brief and professional (3-4 paragraphs max)

Return JSON with subject and body.`;

      const followUpContent = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            body: { type: 'string' }
          }
        }
      });

      // Create new follow-up outreach
      await base44.entities.UniversityOutreach.create({
        student_id: outreach.student_id,
        university_id: outreach.university_id,
        course_id: outreach.course_id,
        outreach_type: 'follow_up',
        email_subject: followUpContent.subject,
        email_body: followUpContent.body,
        status: 'draft',
        automated: true
      });

      // Update original outreach
      await base44.entities.UniversityOutreach.update(outreach.id, {
        status: 'follow_up_needed'
      });

      return followUpContent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-outreaches-followup']);
      queryClient.invalidateQueries(['university-outreaches']);
      toast.success('Follow-up email drafted!');
    }
  });

  // Filter outreaches that need follow-up (7+ days, no response)
  const needsFollowUp = outreaches.filter(o => {
    if (!o.sent_date) return false;
    const daysSince = Math.floor(
      (Date.now() - new Date(o.sent_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= 7;
  });

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Bell className="w-5 h-5" />
          Auto Follow-Up Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900 mb-1">
            <strong>{needsFollowUp.length}</strong> outreaches need follow-up
          </p>
          <p className="text-xs text-amber-700">
            Emails sent 7+ days ago without response
          </p>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {needsFollowUp.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">All outreaches are up to date!</p>
            </div>
          ) : (
            needsFollowUp.map(outreach => {
              const student = students.find(s => s.id === outreach.student_id);
              const university = universities.find(u => u.id === outreach.university_id);
              const daysSince = Math.floor(
                (Date.now() - new Date(outreach.sent_date).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div key={outreach.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {university?.university_name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Student: {student?.first_name} {student?.last_name}
                      </p>
                    </div>
                    <Badge className={
                      daysSince >= 14 ? 'bg-red-100 text-red-700' :
                      daysSince >= 10 ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {daysSince} days
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>Sent: {format(new Date(outreach.sent_date), 'MMM d')}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => scheduleFollowUp.mutate(outreach)}
                    disabled={scheduleFollowUp.isPending}
                    className="w-full"
                    style={{ backgroundColor: '#0066CC' }}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {scheduleFollowUp.isPending ? 'Generating...' : 'Generate Follow-Up'}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}