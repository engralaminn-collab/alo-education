import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, TrendingDown, AlertCircle, Lightbulb, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AIInsights({ studentId }) {
  const [analyzing, setAnalyzing] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: communications = [] } = useQuery({
    queryKey: ['student-comms', studentId],
    queryFn: () => base44.entities.CommunicationHistory.filter({ student_id: studentId }, '-created_date', 20),
    enabled: !!studentId
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-apps', studentId],
    queryFn: () => base44.entities.Application.filter({ student_id: studentId }),
    enabled: !!studentId
  });

  const analyzeSentiment = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      
      const recentComms = communications.slice(0, 10);
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this student's recent communication history and application status:

Recent Communications (${recentComms.length}):
${recentComms.map(c => `- ${c.communication_type}: ${c.summary || c.subject} (${format(new Date(c.created_date), 'MMM d')})\n  Sentiment: ${c.sentiment || 'neutral'}\n  Concerns: ${c.concerns?.join(', ') || 'none'}`).join('\n')}

Applications (${applications.length}):
${applications.map(a => `- Status: ${a.status}, Priority: ${a.priority || 'normal'}`).join('\n')}

Provide comprehensive insights:
1. Overall sentiment trend (positive/neutral/negative/mixed)
2. Key concerns or anxieties (array)
3. Engagement level (high/medium/low)
4. Recommended actions for counselor (array)
5. Student motivations and goals (array)
6. Risk factors (array - things that might cause student to drop out)
7. Strengths and positive signals (array)
8. Next best action for student (string)`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_trend: { 
              type: "string",
              enum: ["positive", "neutral", "negative", "mixed"]
            },
            key_concerns: { type: "array", items: { type: "string" } },
            engagement_level: { 
              type: "string",
              enum: ["high", "medium", "low"]
            },
            counselor_actions: { type: "array", items: { type: "string" } },
            student_motivations: { type: "array", items: { type: "string" } },
            risk_factors: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            next_best_action: { type: "string" }
          }
        }
      });

      setAnalyzing(false);
      return analysis;
    },
    onSuccess: (data) => {
      toast.success('AI analysis complete');
    },
    onError: () => {
      setAnalyzing(false);
      toast.error('Analysis failed');
    }
  });

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-300';
      case 'negative': return 'bg-red-100 text-red-700 border-red-300';
      case 'mixed': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getEngagementColor = (level) => {
    switch(level) {
      case 'high': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const insights = analyzeSentiment.data;

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI-Powered Insights
          </div>
          <Button
            size="sm"
            onClick={() => analyzeSentiment.mutate()}
            disabled={analyzing}
            variant="outline"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Now'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!insights && !analyzing && (
          <div className="text-center py-8 text-slate-500">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm">Click "Analyze Now" to get AI insights</p>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-slate-600">AI is analyzing your journey...</p>
          </div>
        )}

        {insights && (
          <>
            {/* Sentiment & Engagement */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${getSentimentColor(insights.sentiment_trend)}`}>
                <p className="text-xs font-semibold mb-1">Sentiment</p>
                <p className="font-bold capitalize">{insights.sentiment_trend}</p>
              </div>
              <div className={`p-3 rounded-lg ${getEngagementColor(insights.engagement_level)}`}>
                <p className="text-xs font-semibold mb-1">Engagement</p>
                <p className="font-bold capitalize">{insights.engagement_level}</p>
              </div>
            </div>

            {/* Next Best Action */}
            {insights.next_best_action && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Recommended Next Step</p>
                    <p className="text-sm text-blue-800">{insights.next_best_action}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Concerns */}
            {insights.key_concerns?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <h4 className="font-semibold text-slate-900 text-sm">Key Concerns</h4>
                </div>
                <div className="space-y-1">
                  {insights.key_concerns.map((concern, i) => (
                    <p key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">•</span>
                      {concern}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {insights.strengths?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-slate-900 text-sm">Positive Signals</h4>
                </div>
                <div className="space-y-1">
                  {insights.strengths.map((strength, i) => (
                    <p key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      {strength}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {insights.risk_factors?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <h4 className="font-semibold text-red-900 text-sm">Risk Factors</h4>
                </div>
                <div className="space-y-1">
                  {insights.risk_factors.map((risk, i) => (
                    <p key={i} className="text-sm text-red-800">⚠ {risk}</p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}