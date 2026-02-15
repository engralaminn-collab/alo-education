import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Mail, MessageSquare, Phone, Clock, TrendingUp, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AIOutreachAssistant({ studentId }) {
  const [followUpMessages, setFollowUpMessages] = useState(null);
  const [outreachTiming, setOutreachTiming] = useState(null);
  const [reengagementPlan, setReengagementPlan] = useState(null);

  // Generate personalized follow-ups
  const generateFollowUpMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generatePersonalizedFollowUp', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setFollowUpMessages(data);
      toast.success('Follow-up messages generated!');
    }
  });

  // Get optimal timing suggestions
  const getTimingSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('suggestOptimalOutreach', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setOutreachTiming(data);
      toast.success('Timing suggestions loaded!');
    }
  });

  // Create re-engagement sequence
  const createSequenceMutation = useMutation({
    mutationFn: async (inactiveDays) => {
      const { data } = await base44.functions.invoke('createReengagementSequence', {
        student_id: studentId,
        inactive_days: inactiveDays
      });
      return data;
    },
    onSuccess: (data) => {
      setReengagementPlan(data);
      toast.success('Re-engagement sequence created!');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Outreach Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="followup" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followup">Follow-Up Messages</TabsTrigger>
            <TabsTrigger value="timing">Optimal Timing</TabsTrigger>
            <TabsTrigger value="reengagement">Re-engagement</TabsTrigger>
          </TabsList>

          {/* Follow-Up Messages Tab */}
          <TabsContent value="followup" className="space-y-4">
            <Button
              onClick={() => generateFollowUpMutation.mutate()}
              disabled={generateFollowUpMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generateFollowUpMutation.isPending ? 'Generating...' : 'Generate Personalized Messages'}
            </Button>

            {followUpMessages && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Badge className="bg-blue-100 text-blue-800">
                    {followUpMessages.application_stage}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {followUpMessages.engagement_level} engagement
                  </Badge>
                  <span>{followUpMessages.days_since_contact} days since contact</span>
                </div>

                {/* Email Message */}
                <Card className="border-2 border-blue-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Email</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(followUpMessages.messages.email.body)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-600">Subject:</span>
                      <p className="font-medium">{followUpMessages.messages.email.subject}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-600">Body:</span>
                      <p className="text-sm whitespace-pre-wrap">{followUpMessages.messages.email.body}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* SMS Message */}
                <Card className="border-2 border-green-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">SMS</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(followUpMessages.messages.sms.body)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{followUpMessages.messages.sms.body}</p>
                  </CardContent>
                </Card>

                {/* WhatsApp Message */}
                <Card className="border-2 border-emerald-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">WhatsApp</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(followUpMessages.messages.whatsapp.body)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{followUpMessages.messages.whatsapp.body}</p>
                  </CardContent>
                </Card>

                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                  <strong>AI Reasoning:</strong> {followUpMessages.messages.reasoning}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Optimal Timing Tab */}
          <TabsContent value="timing" className="space-y-4">
            <Button
              onClick={() => getTimingSuggestionsMutation.mutate()}
              disabled={getTimingSuggestionsMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {getTimingSuggestionsMutation.isPending ? 'Analyzing...' : 'Analyze Optimal Timing'}
            </Button>

            {outreachTiming && (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Recommended Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Best Channel</p>
                        <p className="font-bold text-lg capitalize">
                          {outreachTiming.ai_recommendations.recommended_channel}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Best Time</p>
                        <p className="font-bold text-lg">
                          {outreachTiming.ai_recommendations.best_time_hour}:00
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Best Day</p>
                        <p className="font-bold text-lg">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][outreachTiming.ai_recommendations.best_day_of_week]}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Contact Every</p>
                        <p className="font-bold text-lg">
                          {outreachTiming.ai_recommendations.optimal_frequency_days} days
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Engagement Tips:</p>
                      <ul className="text-sm space-y-1">
                        {outreachTiming.ai_recommendations.engagement_tips?.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-2">AI Reasoning:</p>
                      <p className="text-sm">{outreachTiming.ai_recommendations.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Channel Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Channel Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(outreachTiming.channel_performance).map(([channel, stats]) => (
                        <div key={channel} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <span className="capitalize font-medium">{channel}</span>
                          <div className="text-sm text-slate-600">
                            {stats.sent > 0 && (
                              <span>{stats.replied}/{stats.sent} replied ({Math.round((stats.replied/stats.sent)*100)}%)</span>
                            )}
                            {stats.sent === 0 && <span className="text-slate-400">No data</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Re-engagement Tab */}
          <TabsContent value="reengagement" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Days Since Last Contact</label>
              <div className="flex gap-2">
                <Button onClick={() => createSequenceMutation.mutate(30)} variant="outline">30 days</Button>
                <Button onClick={() => createSequenceMutation.mutate(60)} variant="outline">60 days</Button>
                <Button onClick={() => createSequenceMutation.mutate(90)} variant="outline">90+ days</Button>
              </div>
            </div>

            {reengagementPlan && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="font-semibold text-green-900 mb-2">✓ Automated Sequence Created</p>
                  <p className="text-sm text-green-800">{reengagementPlan.sequence_details.strategy_notes}</p>
                </div>

                <div className="space-y-3">
                  {reengagementPlan.sequence_details.sequence.map((step, idx) => (
                    <Card key={idx} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge>Day {step.day}</Badge>
                            <Badge variant="outline" className="capitalize">{step.channel}</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(step.message)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <h4 className="font-semibold mb-1">{step.subject}</h4>
                        <p className="text-sm text-slate-600 mb-2">{step.message}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-600">CTA:</span>
                          <span className="font-medium">{step.call_to_action}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Expected Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {reengagementPlan.sequence_details.expected_outcomes?.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}