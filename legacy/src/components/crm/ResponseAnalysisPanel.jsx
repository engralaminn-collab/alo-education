import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, AlertTriangle, Info, XCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ResponseAnalysisPanel({ outreach, student, university }) {
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeResponse = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyzeOutreachResponse', {
        outreachId: outreach.id,
        responseContent: responseText
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Response analyzed and categorized!');
      setShowAnalysis(true);
    },
    onError: (error) => {
      toast.error('Analysis failed: ' + error.message);
    }
  });

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'negative': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'neutral': return <Info className="w-5 h-5 text-blue-600" />;
      case 'informational': return <Info className="w-5 h-5 text-purple-600" />;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-300';
      case 'negative': return 'bg-red-100 text-red-800 border-red-300';
      case 'neutral': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'informational': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="w-5 h-5" />
          AI Response Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {!outreach.response_received ? (
          <>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Paste University Response
              </label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Copy and paste the university's email response here..."
                className="min-h-[150px]"
              />
            </div>
            <Button
              onClick={() => analyzeResponse.mutate()}
              disabled={!responseText || analyzeResponse.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {analyzeResponse.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Response
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            {/* Sentiment */}
            <div className="flex items-center gap-3">
              {getSentimentIcon(outreach.response_sentiment)}
              <div className="flex-1">
                <p className="text-xs text-slate-600 mb-1">Sentiment</p>
                <Badge className={`${getSentimentColor(outreach.response_sentiment)} border`}>
                  {outreach.response_sentiment}
                </Badge>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-1">📝 Summary</p>
              <p className="text-sm text-slate-700">{outreach.response_summary}</p>
            </div>

            {/* Action Required */}
            {outreach.action_required && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <p className="text-sm font-semibold text-amber-900">Action Required</p>
                </div>
                <ul className="space-y-1">
                  {outreach.action_items?.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Urgency */}
            {outreach.is_urgent && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                  <p className="text-sm font-bold text-red-900">URGENT</p>
                </div>
                <p className="text-sm text-red-800">{outreach.urgency_reason}</p>
              </div>
            )}

            {/* Response Content */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Full Response</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {outreach.response_content}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}