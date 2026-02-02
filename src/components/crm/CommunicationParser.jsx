import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Mail, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunicationParser({ student }) {
  const [communicationText, setCommunicationText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const queryClient = useQueryClient();

  const parseCommunication = useMutation({
    mutationFn: async (text) => {
      setParsing(true);

      const prompt = `Parse this communication log between a counselor and student. Extract key information:

Communication Text:
${text}

Student Context: ${student.first_name} ${student.last_name}
Current Status: ${student.status}

Extract and return JSON with:
1. "student_concerns": Array of main concerns or questions the student raised
2. "counselor_actions": Array of actions the counselor took or promised
3. "sentiment": Overall student sentiment (positive/neutral/negative/frustrated/excited)
4. "urgency_level": How urgent is this conversation? (low/medium/high/critical)
5. "follow_up_needed": Boolean - does this need follow-up?
6. "key_dates": Any mentioned dates or deadlines (array of objects with date and description)
7. "status_change_recommended": Should student status be updated? If yes, what status?
8. "action_items": Array of specific tasks that should be created
9. "communication_summary": One sentence summary of the conversation`;

      const parsed = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            student_concerns: {
              type: "array",
              items: { type: "string" }
            },
            counselor_actions: {
              type: "array",
              items: { type: "string" }
            },
            sentiment: { type: "string" },
            urgency_level: { type: "string" },
            follow_up_needed: { type: "boolean" },
            key_dates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            status_change_recommended: { type: "string" },
            action_items: {
              type: "array",
              items: { type: "string" }
            },
            communication_summary: { type: "string" }
          }
        }
      });

      // Auto-update student notes
      const currentNotes = student.notes || '';
      const newNote = `\n[${new Date().toLocaleDateString()}] ${parsed.communication_summary}`;
      
      await base44.entities.StudentProfile.update(student.id, {
        notes: currentNotes + newNote
      });

      // Create tasks for action items
      if (parsed.action_items?.length > 0) {
        for (const actionItem of parsed.action_items) {
          await base44.entities.Task.create({
            title: actionItem,
            description: `From conversation with ${student.first_name}`,
            student_id: student.id,
            assigned_to: student.counselor_id,
            status: 'pending',
            priority: parsed.urgency_level === 'critical' ? 'urgent' : 
                     parsed.urgency_level === 'high' ? 'high' : 'medium',
            type: 'follow_up',
            due_date: new Date().toISOString().split('T')[0]
          });
        }
      }

      // Update status if recommended
      if (parsed.status_change_recommended && parsed.status_change_recommended !== student.status) {
        await base44.entities.StudentProfile.update(student.id, {
          status: parsed.status_change_recommended
        });
      }

      return parsed;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      setParsedData(data);
      setParsing(false);
      toast.success(`Communication logged! Created ${data.action_items?.length || 0} tasks. ${data.status_change_recommended ? 'Status updated.' : ''}`);
    },
    onError: () => {
      setParsing(false);
      toast.error('Parsing failed');
    }
  });

  const getSentimentColor = (sentiment) => {
    const s = sentiment?.toLowerCase();
    if (s?.includes('positive') || s?.includes('excited')) return 'bg-green-600';
    if (s?.includes('negative') || s?.includes('frustrated')) return 'bg-red-600';
    return 'bg-blue-600';
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency?.toLowerCase()) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-900">
          <MessageSquare className="w-6 h-6 text-cyan-600" />
          AI Communication Parser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!parsedData ? (
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Paste email or message conversation
            </label>
            <Textarea 
              value={communicationText}
              onChange={(e) => setCommunicationText(e.target.value)}
              rows={8}
              placeholder="Paste the full conversation (email thread, chat messages, etc.)..."
              className="mb-4"
            />
            <Button 
              onClick={() => parseCommunication.mutate(communicationText)}
              disabled={parsing || !communicationText.trim()}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {parsing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing & Logging...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Parse Communication
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-lg p-4 border-2 border-cyan-200">
              <h4 className="font-semibold text-cyan-900 mb-2">Summary</h4>
              <p className="text-sm text-slate-700">{parsedData.communication_summary}</p>
            </div>

            {/* Metadata */}
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border text-center">
                <p className="text-xs text-slate-600 mb-1">Sentiment</p>
                <Badge className={getSentimentColor(parsedData.sentiment)}>
                  {parsedData.sentiment}
                </Badge>
              </div>
              <div className="bg-white rounded-lg p-3 border text-center">
                <p className="text-xs text-slate-600 mb-1">Urgency</p>
                <Badge className={getUrgencyColor(parsedData.urgency_level)}>
                  {parsedData.urgency_level}
                </Badge>
              </div>
              <div className="bg-white rounded-lg p-3 border text-center">
                <p className="text-xs text-slate-600 mb-1">Follow-up</p>
                <Badge className={parsedData.follow_up_needed ? 'bg-orange-600' : 'bg-green-600'}>
                  {parsedData.follow_up_needed ? 'Required' : 'Not Needed'}
                </Badge>
              </div>
            </div>

            {/* Student Concerns */}
            {parsedData.student_concerns?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Student Concerns</h4>
                <div className="space-y-2">
                  {parsedData.student_concerns.map((concern, idx) => (
                    <div key={idx} className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-sm">
                      <span className="text-amber-600 mr-2">•</span>
                      {concern}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Counselor Actions */}
            {parsedData.counselor_actions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Counselor Actions Taken</h4>
                <div className="space-y-2">
                  {parsedData.counselor_actions.map((action, idx) => (
                    <div key={idx} className="bg-green-50 rounded-lg p-3 border border-green-200 text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items Created */}
            {parsedData.action_items?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Tasks Auto-Created</h4>
                <div className="space-y-2">
                  {parsedData.action_items.map((item, idx) => (
                    <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-sm">
                      <span className="text-blue-600 mr-2">→</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Dates */}
            {parsedData.key_dates?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Important Dates</h4>
                <div className="space-y-2">
                  {parsedData.key_dates.map((dateItem, idx) => (
                    <div key={idx} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-sm font-medium text-purple-900">{dateItem.date}</p>
                      <p className="text-xs text-purple-700">{dateItem.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Change */}
            {parsedData.status_change_recommended && parsedData.status_change_recommended !== student.status && (
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-lg p-4 border-2 border-emerald-300">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Status Updated
                </h4>
                <p className="text-sm text-emerald-800">
                  Student status changed from <strong>{student.status}</strong> to <strong>{parsedData.status_change_recommended}</strong>
                </p>
              </div>
            )}

            <Button 
              onClick={() => {
                setParsedData(null);
                setCommunicationText('');
              }}
              variant="outline"
              className="w-full"
            >
              Parse Another Communication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}