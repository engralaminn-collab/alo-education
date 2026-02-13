import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedCommunicationHub({ studentId }) {
  const [messageText, setMessageText] = useState('');
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch recent communications
  const { data: recentComms } = useQuery({
    queryKey: ['communications', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const comms = await base44.entities.CommunicationLog.filter(
        { student_id: studentId },
        '-created_date',
        20
      );
      return comms;
    },
    enabled: !!studentId
  });

  // Analyze sentiment
  const analyzeSentiment = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('analyzeSentiment', {
        message_text: messageText,
        student_id: studentId,
        context: 'real_time_draft'
      });
      return data;
    },
    onSuccess: (data) => {
      setSentimentAnalysis(data);
      setShowSuggestions(true);
      toast.success('Message analyzed');
    }
  });

  // Apply suggestion
  const applySuggestion = (suggestion) => {
    // Simple implementation - in production, this would be more sophisticated
    setMessageText(prev => {
      const improved = prev + '\n\n' + suggestion.suggestion;
      return improved;
    });
    toast.success('Suggestion applied');
  };

  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-blue-100 text-blue-800',
    negative: 'bg-red-100 text-red-800'
  };

  const urgencyColors = {
    low: 'bg-slate-100 text-slate-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      {/* Message Composer with Real-time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            AI-Enhanced Message Composer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-32"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => analyzeSentiment.mutate()}
              disabled={!messageText || analyzeSentiment.isPending}
              className="bg-blue-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {analyzeSentiment.isPending ? 'Analyzing...' : 'Analyze & Suggest'}
            </Button>
            <Button variant="outline">Send Message</Button>
          </div>

          {/* Sentiment Analysis Results */}
          {sentimentAnalysis?.analysis && showSuggestions && (
            <div className="space-y-4 mt-6">
              {/* Sentiment Overview */}
              <div className="grid md:grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg ${sentimentColors[sentimentAnalysis.analysis.sentiment]}`}>
                  <p className="text-xs font-medium mb-1">Sentiment</p>
                  <p className="font-bold capitalize">{sentimentAnalysis.analysis.sentiment}</p>
                  <p className="text-xs mt-1">Score: {sentimentAnalysis.analysis.sentiment_score}/100</p>
                </div>

                <div className={`p-3 rounded-lg ${urgencyColors[sentimentAnalysis.analysis.urgency_level]}`}>
                  <p className="text-xs font-medium mb-1">Urgency</p>
                  <p className="font-bold capitalize">{sentimentAnalysis.analysis.urgency_level}</p>
                </div>

                <div className="p-3 rounded-lg bg-purple-100 text-purple-800">
                  <p className="text-xs font-medium mb-1">Recommended Tone</p>
                  <p className="font-bold text-sm">{sentimentAnalysis.analysis.recommended_response_tone}</p>
                </div>
              </div>

              {/* Emotional Indicators */}
              {sentimentAnalysis.analysis.emotional_indicators && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h5 className="text-sm font-semibold mb-3">Emotional Indicators</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(sentimentAnalysis.analysis.emotional_indicators).map(([emotion, score]) => (
                      <div key={emotion} className="text-center">
                        <p className="text-xs text-slate-600 capitalize mb-1">{emotion}</p>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <p className="text-xs font-medium mt-1">{score}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Topics & Entities */}
              <div className="grid md:grid-cols-2 gap-4">
                {sentimentAnalysis.analysis.key_topics?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Key Topics Detected</h5>
                    <div className="flex flex-wrap gap-2">
                      {sentimentAnalysis.analysis.key_topics.map((topic, i) => (
                        <Badge key={i} variant="outline">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {sentimentAnalysis.analysis.entities_mentioned?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Entities Mentioned</h5>
                    <div className="flex flex-wrap gap-2">
                      {sentimentAnalysis.analysis.entities_mentioned.map((entity, i) => (
                        <Badge key={i} className="bg-indigo-500">
                          {entity.entity_type}: {entity.entity_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Items & Concerns */}
              {(sentimentAnalysis.analysis.action_items?.length > 0 || 
                sentimentAnalysis.analysis.concerns_raised?.length > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {sentimentAnalysis.analysis.action_items?.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Action Items Identified
                      </h5>
                      <ul className="space-y-1">
                        {sentimentAnalysis.analysis.action_items.map((item, i) => (
                          <li key={i} className="text-sm text-green-800">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sentimentAnalysis.analysis.concerns_raised?.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Concerns Detected
                      </h5>
                      <ul className="space-y-1">
                        {sentimentAnalysis.analysis.concerns_raised.map((concern, i) => (
                          <li key={i} className="text-sm text-orange-800">⚠️ {concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Improvement Suggestions */}
              {sentimentAnalysis.analysis.improvement_suggestions?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    AI Suggestions to Improve Your Message
                  </h5>
                  <div className="space-y-3">
                    {sentimentAnalysis.analysis.improvement_suggestions.map((suggestion, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">{suggestion.suggestion}</p>
                        <p className="text-xs text-blue-700 mb-2">{suggestion.reason}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applySuggestion(suggestion)}
                          className="text-xs"
                        >
                          Apply Suggestion
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sentimentAnalysis.profile_enriched && (
                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                  ✓ Student profile automatically enriched with detected topics
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication History with Sentiment */}
      {recentComms && recentComms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Communication History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentComms.slice(0, 10).map((comm) => (
                <div key={comm.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{comm.channel}</Badge>
                      {comm.sentiment && (
                        <Badge className={sentimentColors[comm.sentiment]}>
                          {comm.sentiment}
                        </Badge>
                      )}
                      <Badge variant="outline">{comm.direction}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(comm.created_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {comm.subject && (
                    <p className="font-semibold text-sm mb-1">{comm.subject}</p>
                  )}
                  
                  <p className="text-sm text-slate-700 line-clamp-2">{comm.content}</p>
                  
                  {comm.key_topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {comm.key_topics.slice(0, 3).map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}