import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Mail, MessageSquare, Phone, TrendingUp, Clock, AlertTriangle, Send, Copy, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CommunicationHub({ studentId }) {
  const [analysis, setAnalysis] = useState(null);
  const [outreach, setOutreach] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [editedContent, setEditedContent] = useState({});
  const queryClient = useQueryClient();

  const { data: communications = [] } = useQuery({
    queryKey: ['communication-logs', studentId],
    queryFn: () => base44.entities.CommunicationLog.filter({ student_id: studentId }, '-created_date'),
    enabled: !!studentId
  });

  const analyze = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('analyzeCommunications', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast.success('Communication analysis complete');
    }
  });

  const generateOutreach = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generatePersonalizedOutreach', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setOutreach(data.suggestions);
      toast.success('Outreach messages generated');
    }
  });

  const saveOutreach = useMutation({
    mutationFn: async (messageData) => {
      await base44.entities.OutreachSuggestion.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communications', studentId]);
      toast.success('Outreach saved successfully');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const channelIcons = {
    email: Mail,
    sms: MessageSquare,
    call: Phone,
    whatsapp: MessageSquare,
    chat: MessageSquare,
    meeting: Phone
  };

  const sentimentColors = {
    positive: 'text-green-600 bg-green-50',
    neutral: 'text-slate-600 bg-slate-50',
    negative: 'text-red-600 bg-red-50'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              AI Communication Hub
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateOutreach.mutate()}
                disabled={generateOutreach.isPending}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateOutreach.isPending ? 'Generating...' : 'Generate Outreach'}
              </Button>
              <Button
                size="sm"
                onClick={() => analyze.mutate()}
                disabled={analyze.isPending}
                className="bg-cyan-600"
              >
                {analyze.isPending ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">History ({communications.length})</TabsTrigger>
              <TabsTrigger value="outreach">AI Outreach</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 mt-4">
              {communications.slice(0, 20).map(comm => {
                const Icon = channelIcons[comm.channel] || MessageSquare;
                return (
                  <div key={comm.id} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-slate-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize">{comm.channel}</Badge>
                          <Badge variant={comm.direction === 'inbound' ? 'default' : 'secondary'}>
                            {comm.direction}
                          </Badge>
                          {comm.sentiment && (
                            <Badge className={sentimentColors[comm.sentiment]}>
                              {comm.sentiment}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 mb-1">{comm.subject || comm.content?.substring(0, 100)}</p>
                        <p className="text-xs text-slate-500">
                          {comm.created_date && format(new Date(comm.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="outreach" className="mt-4">
              {outreach ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Channel:</span>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="call">Phone Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedChannel === 'email' && outreach.email && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email Draft
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${outreach.email.subject}\n\n${editedContent.email || outreach.email.body}`)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button size="sm" onClick={() => saveOutreach.mutate({
                              student_id: studentId,
                              channel: 'email',
                              subject: outreach.email.subject,
                              content: editedContent.email || outreach.email.body,
                              urgency_level: outreach.urgency_level || 'medium',
                              best_time_to_contact: outreach.best_time_to_contact
                            })}>
                              <Send className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Subject:</label>
                          <p className="font-semibold">{outreach.email.subject}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Message:</label>
                          <Textarea
                            value={editedContent.email !== undefined ? editedContent.email : outreach.email.body}
                            onChange={(e) => setEditedContent({ ...editedContent, email: e.target.value })}
                            rows={10}
                            className="mt-1 bg-white"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedChannel === 'sms' && outreach.sms && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            SMS Draft
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(editedContent.sms || outreach.sms)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button size="sm" onClick={() => saveOutreach.mutate({
                              student_id: studentId,
                              channel: 'sms',
                              content: editedContent.sms || outreach.sms,
                              urgency_level: outreach.urgency_level || 'medium'
                            })}>
                              <Send className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={editedContent.sms !== undefined ? editedContent.sms : outreach.sms}
                          onChange={(e) => setEditedContent({ ...editedContent, sms: e.target.value })}
                          rows={4}
                          className="bg-white"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          {(editedContent.sms || outreach.sms).length} characters
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {selectedChannel === 'call' && outreach.call_script && (
                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Call Script
                          </CardTitle>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(
                            `Opening: ${outreach.call_script.opening}\n\nTalking Points:\n${outreach.call_script.talking_points?.join('\n')}\n\nQuestions:\n${outreach.call_script.questions?.join('\n')}`
                          )}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs font-medium text-purple-700 mb-2">Opening:</p>
                          <p className="text-sm">{outreach.call_script.opening}</p>
                        </div>
                        {outreach.call_script.talking_points && (
                          <div className="bg-white p-3 rounded border">
                            <p className="text-xs font-medium text-purple-700 mb-2">Key Talking Points:</p>
                            <ul className="space-y-1">
                              {outreach.call_script.talking_points.map((point, i) => (
                                <li key={i} className="text-sm">• {point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {outreach.call_script.questions && (
                          <div className="bg-white p-3 rounded border">
                            <p className="text-xs font-medium text-purple-700 mb-2">Questions to Ask:</p>
                            <ul className="space-y-1">
                              {outreach.call_script.questions.map((q, i) => (
                                <li key={i} className="text-sm">• {q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {(outreach.best_time_to_contact || outreach.urgency_level) && (
                    <div className="grid grid-cols-2 gap-4">
                      {outreach.best_time_to_contact && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Best Contact Time</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-lg font-semibold text-blue-600">{outreach.best_time_to_contact}</p>
                          </CardContent>
                        </Card>
                      )}
                      {outreach.urgency_level && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Urgency Level</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge className={
                              outreach.urgency_level === 'high' ? 'bg-red-500' :
                              outreach.urgency_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }>
                              {outreach.urgency_level}
                            </Badge>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Click "Generate Outreach" to create personalized messages</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              {analysis ? (
                <div className="space-y-4">
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <h4 className="font-semibold text-cyan-900 mb-2">Summary</h4>
                    <p className="text-sm text-cyan-800">{analysis.summary}</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Avg Response Time</span>
                        </div>
                        <p className="text-2xl font-bold">{analysis.patterns?.avg_response_time_hours || 0}h</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Preferred Channel</span>
                        </div>
                        <p className="text-lg font-bold capitalize">{analysis.patterns?.most_active_channel || 'N/A'}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Engagement</span>
                        </div>
                        <Badge className={
                          analysis.engagement_level === 'high' ? 'bg-green-500' :
                          analysis.engagement_level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }>
                          {analysis.engagement_level}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Recommended Channel</h4>
                      <p className="text-green-800 capitalize">{analysis.recommended_channel}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Best Time to Contact</h4>
                      <p className="text-blue-800">{analysis.recommended_timing}</p>
                    </div>
                  </div>

                  {analysis.key_topics?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Topics Discussed</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.key_topics.map((topic, i) => (
                          <Badge key={i} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.concerns?.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Concerns Detected
                      </h4>
                      <ul className="space-y-1">
                        {analysis.concerns.map((concern, i) => (
                          <li key={i} className="text-sm text-orange-800">• {concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Next Communication Strategy</h4>
                    <p className="text-sm text-purple-800">{analysis.next_strategy}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Click "Analyze" to generate communication insights</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}