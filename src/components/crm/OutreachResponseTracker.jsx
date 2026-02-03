import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function OutreachResponseTracker({ outreaches, students, universities }) {
  const queryClient = useQueryClient();
  const [selectedOutreach, setSelectedOutreach] = React.useState(null);
  const [responseData, setResponseData] = React.useState({ content: '', followUpNeeded: false });

  const logResponse = useMutation({
    mutationFn: async ({ outreachId, content, followUpNeeded }) => {
      await base44.entities.UniversityOutreach.update(outreachId, {
        response_received: true,
        response_date: new Date().toISOString(),
        response_content: content,
        status: followUpNeeded ? 'follow_up_needed' : 'responded'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Response logged successfully');
      setSelectedOutreach(null);
      setResponseData({ content: '', followUpNeeded: false });
    }
  });

  const flagUrgent = useMutation({
    mutationFn: async ({ outreachId, reason }) => {
      await base44.entities.UniversityOutreach.update(outreachId, {
        is_urgent: true,
        urgency_reason: reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Marked as urgent');
    }
  });

  return (
    <div className="space-y-4">
      {outreaches.map(outreach => {
        const student = students.find(s => s.id === outreach.student_id);
        const university = universities.find(u => u.id === outreach.university_id);

        return (
          <Card key={outreach.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {university?.university_name || university?.name}
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Student: {student?.first_name} {student?.last_name}
                  </p>
                  <Badge className="bg-green-100 text-green-700">
                    Responded {outreach.response_date && format(new Date(outreach.response_date), 'MMM d, yyyy')}
                  </Badge>
                </div>
              </div>

              {outreach.response_content && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {outreach.response_content}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Log Response
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log University Response</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Response Content</Label>
                        <Textarea
                          value={responseData.content}
                          onChange={(e) => setResponseData({ ...responseData, content: e.target.value })}
                          placeholder="Paste university's response..."
                          rows={6}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="followup"
                          checked={responseData.followUpNeeded}
                          onChange={(e) => setResponseData({ ...responseData, followUpNeeded: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="followup" className="cursor-pointer">
                          Follow-up needed
                        </Label>
                      </div>
                      <Button
                        onClick={() => logResponse.mutate({ 
                          outreachId: outreach.id, 
                          content: responseData.content,
                          followUpNeeded: responseData.followUpNeeded
                        })}
                        disabled={!responseData.content || logResponse.isPending}
                        className="w-full"
                      >
                        Log Response
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {!outreach.is_urgent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => flagUrgent.mutate({ 
                      outreachId: outreach.id, 
                      reason: 'Requires immediate action based on response' 
                    })}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Flag Urgent
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}