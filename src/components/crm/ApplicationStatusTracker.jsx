import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, Clock, CheckCircle, AlertCircle, 
  Mail, RefreshCw, Eye, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ApplicationStatusTracker({ applicationId }) {
  const [showParseEmail, setShowParseEmail] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', body: '', from: '' });
  const queryClient = useQueryClient();

  const { data: statusHistory = [] } = useQuery({
    queryKey: ['status-history', applicationId],
    queryFn: () => base44.entities.ApplicationStatusUpdate.filter({ 
      application_id: applicationId 
    }, '-created_date'),
    enabled: !!applicationId
  });

  const { data: application } = useQuery({
    queryKey: ['application-detail', applicationId],
    queryFn: async () => {
      const apps = await base44.entities.Application.filter({ id: applicationId });
      return apps[0];
    },
    enabled: !!applicationId
  });

  const { data: student } = useQuery({
    queryKey: ['student-for-app', application?.student_id],
    queryFn: async () => {
      const students = await base44.entities.StudentProfile.filter({ id: application.student_id });
      return students[0];
    },
    enabled: !!application?.student_id
  });

  const parseEmail = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('parseApplicationStatusEmail', {
        emailSubject: emailData.subject,
        emailBody: emailData.body,
        emailFrom: emailData.from,
        studentEmail: student.email
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Status updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['status-history'] });
        queryClient.invalidateQueries({ queryKey: ['application-detail'] });
        setShowParseEmail(false);
        setEmailData({ subject: '', body: '', from: '' });
      } else {
        toast.error(data.message || 'Could not parse email');
      }
    },
    onError: () => {
      toast.error('Failed to parse email');
    }
  });

  const getSourceBadge = (source) => {
    const colors = {
      email: 'bg-blue-100 text-blue-700',
      manual: 'bg-slate-100 text-slate-700',
      webhook: 'bg-purple-100 text-purple-700',
      portal_scrape: 'bg-green-100 text-green-700',
      counselor: 'bg-orange-100 text-orange-700'
    };
    return colors[source] || 'bg-slate-100 text-slate-700';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Status Tracking History
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowParseEmail(true)}
              className="bg-blue-600"
            >
              <Mail className="w-4 h-4 mr-2" />
              Parse Email Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statusHistory.map((update, index) => (
              <div 
                key={update.id} 
                className="p-4 border rounded-lg bg-slate-50 relative"
              >
                {update.auto_detected && (
                  <Sparkles className="w-4 h-4 text-purple-500 absolute top-3 right-3" />
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSourceBadge(update.update_source)}>
                        {update.update_source}
                      </Badge>
                      {update.confidence_score && (
                        <Badge variant="outline" className="text-xs">
                          {update.confidence_score}% confidence
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="text-slate-400">{update.previous_status?.replace(/_/g, ' ')}</span>
                      {' → '}
                      <span className="font-semibold text-slate-900">{update.new_status?.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    {format(new Date(update.created_date), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>

                {update.university_reference && (
                  <p className="text-xs text-slate-500 mb-2">
                    Ref: {update.university_reference}
                  </p>
                )}

                {update.extracted_details && Object.keys(update.extracted_details).length > 0 && (
                  <div className="mt-2 p-2 bg-white rounded border text-xs">
                    <p className="font-semibold text-slate-700 mb-1">Extracted Details:</p>
                    {Object.entries(update.extracted_details).map(([key, value]) => (
                      <p key={key} className="text-slate-600">
                        <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  {update.notification_sent_student && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Student notified
                    </span>
                  )}
                  {update.notification_sent_counselor && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Counselor notified
                    </span>
                  )}
                </div>
              </div>
            ))}

            {statusHistory.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm">No status updates yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parse Email Dialog */}
      <Dialog open={showParseEmail} onOpenChange={setShowParseEmail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Parse University Email</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="text-blue-900 font-medium mb-1">📧 How it works:</p>
              <p className="text-blue-700">
                Paste the email content from the university below. Our AI will automatically detect the application status 
                and update the system.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Email Subject
              </label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Your Application to University Name"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                From (Email Address)
              </label>
              <Input
                value={emailData.from}
                onChange={(e) => setEmailData({ ...emailData, from: e.target.value })}
                placeholder="admissions@university.edu"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Email Body
              </label>
              <Textarea
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                placeholder="Paste the full email content here..."
                rows={10}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowParseEmail(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => parseEmail.mutate()}
                disabled={!emailData.subject || !emailData.body || parseEmail.isPending}
                className="bg-blue-600"
              >
                {parseEmail.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Parse & Update Status
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}