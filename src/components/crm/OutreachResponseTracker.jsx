import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function OutreachResponseTracker({ outreaches, students, universities }) {
  const [selectedOutreach, setSelectedOutreach] = useState(null);
  const [responseText, setResponseText] = useState('');
  const queryClient = useQueryClient();

  const logResponse = useMutation({
    mutationFn: async ({ outreachId, response }) => {
      // Update outreach with response
      await base44.entities.UniversityOutreach.update(outreachId, {
        response_received: true,
        response_date: new Date().toISOString(),
        response_content: response,
        status: 'responded'
      });

      // Use AI to analyze response and suggest next steps
      const analysisPrompt = `Analyze this university response and suggest next steps:

University Response: ${response}

Determine:
1. Is it positive, neutral, or negative?
2. What are the key action items?
3. Should we create any follow-up tasks?

Return JSON with sentiment, action_items (array), needs_follow_up (boolean)`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { type: "string" },
            action_items: {
              type: "array",
              items: { type: "string" }
            },
            needs_follow_up: { type: "boolean" }
          }
        }
      });

      // Create task if needed
      if (analysis.needs_follow_up) {
        const outreach = outreaches.find(o => o.id === outreachId);
        await base44.entities.Task.create({
          title: `Follow up on ${universities.find(u => u.id === outreach.university_id)?.university_name} response`,
          description: `Action items: ${analysis.action_items.join(', ')}`,
          type: 'follow_up',
          student_id: outreach.student_id,
          assigned_to: students.find(s => s.id === outreach.student_id)?.counselor_id,
          status: 'pending',
          priority: 'high',
          due_date: format(new Date(), 'yyyy-MM-dd')
        });
      }

      return analysis;
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-ai'] });
      setSelectedOutreach(null);
      setResponseText('');
      toast.success(`Response logged! Sentiment: ${analysis.sentiment}. ${analysis.needs_follow_up ? 'Follow-up task created.' : ''}`);
    }
  });

  const flagUrgent = useMutation({
    mutationFn: ({ outreachId, reason }) => {
      return base44.entities.UniversityOutreach.update(outreachId, {
        is_urgent: true,
        urgency_reason: reason,
        status: 'follow_up_needed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Marked as urgent');
    }
  });

  return (
    <div className="space-y-4">
      {outreaches.map((outreach) => {
        const student = students.find(s => s.id === outreach.student_id);
        const university = universities.find(u => u.id === outreach.university_id);
        
        return (
          <Card key={outreach.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900">{university?.university_name}</h4>
                    {outreach.is_urgent && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    Student: {student?.first_name} {student?.last_name}
                  </p>
                  {outreach.response_date && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Responded {format(new Date(outreach.response_date), 'PPP')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!outreach.response_received && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOutreach(outreach)}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Log Response
                    </Button>
                  )}
                  {!outreach.is_urgent && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => flagUrgent.mutate({ 
                        outreachId: outreach.id, 
                        reason: 'Deadline approaching' 
                      })}
                    >
                      Flag Urgent
                    </Button>
                  )}
                </div>
              </div>
              
              {outreach.response_content && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {outreach.response_content}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Log Response Dialog */}
      <Dialog open={!!selectedOutreach} onOpenChange={(open) => !open && setSelectedOutreach(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log University Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                University Response
              </label>
              <Textarea 
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                placeholder="Paste the university's email response here..."
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedOutreach(null);
                  setResponseText('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => logResponse.mutate({ 
                  outreachId: selectedOutreach.id, 
                  response: responseText 
                })}
                disabled={!responseText.trim() || logResponse.isPending}
                className="flex-1 bg-green-600"
              >
                {logResponse.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Response
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}