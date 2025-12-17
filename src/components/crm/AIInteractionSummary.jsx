import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, MessageSquare, Clock, TrendingUp, 
  Send, Copy, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';

export default function AIInteractionSummary({ studentId }) {
  const [summary, setSummary] = useState(null);
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [outreachMessage, setOutreachMessage] = useState('');

  // Fetch messages for this student
  const { data: messages = [] } = useQuery({
    queryKey: ['student-messages', studentId],
    queryFn: () => base44.entities.Message.filter({ 
      recipient_id: studentId 
    }, '-created_date', 50),
    enabled: !!studentId,
  });

  // Fetch applications for context
  const { data: applications = [] } = useQuery({
    queryKey: ['student-apps', studentId],
    queryFn: () => base44.entities.Application.filter({ student_id: studentId }),
    enabled: !!studentId,
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the following student interaction history and provide insights:

Messages: ${messages.slice(0, 20).map(m => `${m.sender_type}: ${m.content}`).join('\n')}

Applications: ${applications.map(a => `${a.status} - Priority: ${a.priority || 'N/A'}`).join('\n')}

Provide a JSON response with:
{
  "summary": "Brief overview of student engagement and communication patterns",
  "sentiment": "positive/neutral/negative",
  "engagement_level": "high/medium/low",
  "last_interaction": "Description of last meaningful interaction",
  "suggested_actions": ["action 1", "action 2", "action 3"],
  "priority_level": "high/medium/low",
  "key_concerns": ["concern 1", "concern 2"],
  "next_steps": ["step 1", "step 2"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            sentiment: { type: "string" },
            engagement_level: { type: "string" },
            last_interaction: { type: "string" },
            suggested_actions: { type: "array", items: { type: "string" } },
            priority_level: { type: "string" },
            key_concerns: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setSummary(data);
      toast.success('AI summary generated');
    },
    onError: () => {
      toast.error('Failed to generate summary');
    },
  });

  const generateOutreachMutation = useMutation({
    mutationFn: async (context) => {
      setGeneratingOutreach(true);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a personalized outreach message for a student based on:

Recent Summary: ${summary?.summary || 'No recent activity'}
Sentiment: ${summary?.sentiment || 'neutral'}
Key Concerns: ${summary?.key_concerns?.join(', ') || 'None'}
Applications: ${applications.map(a => a.status).join(', ')}

Context: ${context}

Generate a warm, professional, and personalized message (2-3 paragraphs) that:
- Acknowledges their current situation
- Addresses any concerns
- Provides clear next steps
- Encourages engagement

Keep it conversational and helpful.`
      });
      return response;
    },
    onSuccess: (data) => {
      setOutreachMessage(data);
      setGeneratingOutreach(false);
      toast.success('Outreach message generated');
    },
    onError: () => {
      setGeneratingOutreach(false);
      toast.error('Failed to generate message');
    },
  });

  const sentimentColors = {
    positive: 'bg-emerald-100 text-emerald-700',
    neutral: 'bg-slate-100 text-slate-700',
    negative: 'bg-red-100 text-red-700',
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
  };

  const engagementColors = {
    high: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Interaction Summary
            </CardTitle>
            <Button
              size="sm"
              onClick={() => generateSummaryMutation.mutate()}
              disabled={generateSummaryMutation.isPending}
            >
              {generateSummaryMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!summary ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click "Generate Summary" to analyze student interactions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overview */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700">{summary.summary}</p>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap gap-2">
                <Badge className={sentimentColors[summary.sentiment]}>
                  Sentiment: {summary.sentiment}
                </Badge>
                <Badge className={engagementColors[summary.engagement_level]}>
                  Engagement: {summary.engagement_level}
                </Badge>
                <Badge className={priorityColors[summary.priority_level]}>
                  Priority: {summary.priority_level}
                </Badge>
              </div>

              {/* Last Interaction */}
              {summary.last_interaction && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last Interaction
                  </h4>
                  <p className="text-sm text-slate-600">{summary.last_interaction}</p>
                </div>
              )}

              {/* Key Concerns */}
              {summary.key_concerns?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Key Concerns
                  </h4>
                  <ul className="space-y-1">
                    {summary.key_concerns.map((concern, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Actions */}
              {summary.suggested_actions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Suggested Actions
                  </h4>
                  <ul className="space-y-1">
                    {summary.suggested_actions.map((action, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {summary.next_steps?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Next Steps</h4>
                  <ul className="space-y-1">
                    {summary.next_steps.map((step, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-blue-500 font-bold">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outreach Generator */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              AI Outreach Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateOutreachMutation.mutate('Follow up on pending application')}
                disabled={generatingOutreach}
              >
                Application Follow-up
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateOutreachMutation.mutate('Check in on document submission')}
                disabled={generatingOutreach}
              >
                Document Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateOutreachMutation.mutate('General check-in and support')}
                disabled={generatingOutreach}
              >
                General Check-in
              </Button>
            </div>

            {outreachMessage && (
              <div className="space-y-3">
                <Textarea
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                  rows={6}
                  className="font-sans"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(outreachMessage);
                      toast.success('Copied to clipboard');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOutreachMessage('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}