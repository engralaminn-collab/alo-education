import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, Sparkles, CheckCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CaseConferenceRoom({ studentId, currentCounselorId, currentCounselorName }) {
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedConference, setSelectedConference] = useState(null);
  const [message, setMessage] = useState('');

  const queryClient = useQueryClient();

  const { data: conferences = [] } = useQuery({
    queryKey: ['case-conferences', studentId],
    queryFn: async () => {
      try {
        return await base44.entities.CaseConference.filter({ student_id: studentId }, '-created_date');
      } catch {
        return [];
      }
    },
    enabled: !!studentId,
  });

  const createConferenceMutation = useMutation({
    mutationFn: (title) => base44.entities.CaseConference.create({
      student_id: studentId,
      title,
      initiated_by: currentCounselorId,
      participants: [currentCounselorId],
      discussion_points: [],
      action_items: [],
      status: 'active',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-conferences'] });
      setShowNew(false);
      setNewTitle('');
      toast.success('Conference started');
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ conferenceId, message }) => {
      const conference = conferences.find(c => c.id === conferenceId);
      const discussionPoints = conference.discussion_points || [];
      
      return await base44.entities.CaseConference.update(conferenceId, {
        discussion_points: [
          ...discussionPoints,
          {
            counselor_id: currentCounselorId,
            counselor_name: currentCounselorName,
            message,
            timestamp: new Date().toISOString(),
          }
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-conferences'] });
      setMessage('');
    },
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async (conference) => {
      const discussionText = conference.discussion_points
        .map(dp => `${dp.counselor_name}: ${dp.message}`)
        .join('\n\n');

      const prompt = `Summarize this case conference discussion about a student. Extract key points, decisions made, and action items.

DISCUSSION:
${discussionText}

Provide a concise summary highlighting:
1. Main concerns or topics discussed
2. Key decisions or consensus reached
3. Recommended action items

Return as plain text summary.`;

      const summary = await base44.integrations.Core.InvokeLLM({ prompt });

      await base44.entities.CaseConference.update(conference.id, {
        ai_summary: summary,
      });

      return summary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-conferences'] });
      toast.success('AI summary generated');
    },
  });

  const activeConferences = conferences.filter(c => c.status === 'active');

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
            <MessageCircle className="w-5 h-5" />
            Case Conferences ({activeConferences.length})
          </CardTitle>
          <Button size="sm" onClick={() => setShowNew(!showNew)} style={{ backgroundColor: '#0066CC' }}>
            Start Conference
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showNew && (
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Conference title (e.g., 'Visa Rejection Discussion')..."
            />
            <div className="flex gap-2">
              <Button
                onClick={() => createConferenceMutation.mutate(newTitle)}
                disabled={!newTitle.trim() || createConferenceMutation.isPending}
                style={{ backgroundColor: '#0066CC' }}
              >
                Start
              </Button>
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {selectedConference ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{selectedConference.title}</h3>
              <Button size="sm" variant="outline" onClick={() => setSelectedConference(null)}>
                Back
              </Button>
            </div>

            {/* Discussion */}
            <div className="border rounded-lg p-3 space-y-3 max-h-64 overflow-y-auto">
              {selectedConference.discussion_points?.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No messages yet</p>
              ) : (
                selectedConference.discussion_points?.map((point, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{point.counselor_name}</span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(point.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{point.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* AI Summary */}
            {selectedConference.ai_summary ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">AI Summary</span>
                </div>
                <p className="text-sm text-blue-800 whitespace-pre-line">{selectedConference.ai_summary}</p>
              </div>
            ) : (
              selectedConference.discussion_points?.length > 2 && (
                <Button
                  size="sm"
                  onClick={() => generateSummaryMutation.mutate(selectedConference)}
                  disabled={generateSummaryMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Generate AI Summary
                </Button>
              )
            )}

            {/* Add Message */}
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts..."
                rows={2}
              />
              <Button
                onClick={() => addMessageMutation.mutate({ conferenceId: selectedConference.id, message })}
                disabled={!message.trim() || addMessageMutation.isPending}
                style={{ backgroundColor: '#F37021' }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activeConferences.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No active conferences</p>
            ) : (
              activeConferences.map((conf) => (
                <div
                  key={conf.id}
                  className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedConference(conf)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{conf.title}</p>
                      <p className="text-xs text-slate-600">
                        {conf.discussion_points?.length || 0} messages
                      </p>
                    </div>
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {conf.participants?.length || 1}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}