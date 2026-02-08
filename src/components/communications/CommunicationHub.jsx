import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Mail, MessageSquare, Phone, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CommunicationHub({ studentId }) {
  const [analysis, setAnalysis] = useState(null);
  const [outreachSuggestions, setOutreachSuggestions] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [editingMessage, setEditingMessage] = useState(null);
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
            <Button
              size="sm"
              onClick={() => analyze.mutate()}
              disabled={analyze.isPending}
              className="bg-cyan-600"
            >
              {analyze.isPending ? 'Analyzing...' : 'Analyze Communications'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analysis && (
            <div className="space-y-4 mb-6">
              {/* Summary */}
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <h4 className="font-semibold text-cyan-900 mb-2">Summary</h4>
                <p className="text-sm text-cyan-800">{analysis.summary}</p>
              </div>

              {/* Metrics */}
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

              {/* Recommendations */}
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

              {/* Key Topics */}
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

              {/* Concerns */}
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

              {/* Strategy */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Next Communication Strategy</h4>
                <p className="text-sm text-purple-800">{analysis.next_strategy}</p>
              </div>
            </div>
          )}

          {/* Communication History */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({communications.length})</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="call">Calls</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}