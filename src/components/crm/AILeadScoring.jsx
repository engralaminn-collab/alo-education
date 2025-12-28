import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AILeadScoring({ inquiry, onScoreUpdate }) {
  const queryClient = useQueryClient();

  const scoreLeadMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Analyze this inquiry and calculate a lead score (0-100) with conversion probability.

INQUIRY DATA:
- Name: ${inquiry.name}
- Email: ${inquiry.email}
- Phone: ${inquiry.phone || 'Not provided'}
- Country of Interest: ${inquiry.country_of_interest || 'Not specified'}
- Degree Level: ${inquiry.degree_level || 'Not specified'}
- Field of Study: ${inquiry.field_of_study || 'Not specified'}
- Message: ${inquiry.message || 'No message'}
- Source: ${inquiry.source || 'Unknown'}

SCORING FACTORS:
1. Completeness (30%): How much information did they provide?
2. Specificity (25%): Are their interests specific or vague?
3. Urgency (20%): Do they seem ready to proceed soon?
4. Engagement (15%): Quality of message/questions
5. Contact Info (10%): Phone provided = higher engagement

Based on the score, classify as:
- 0-30: Cold Lead
- 31-60: Warm Lead
- 61-85: Hot Lead
- 86-100: Qualified Lead

Return JSON with:
- lead_score: 0-100
- conversion_probability: 0-100
- lead_quality: "cold"/"warm"/"hot"/"qualified"
- urgency_level: "low"/"medium"/"high"
- readiness_to_proceed: text explanation
- key_interests: array of identified interests
- recommended_action: what counselor should do first`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            lead_score: { type: 'number' },
            conversion_probability: { type: 'number' },
            lead_quality: { type: 'string' },
            urgency_level: { type: 'string' },
            readiness_to_proceed: { type: 'string' },
            key_interests: {
              type: 'array',
              items: { type: 'string' }
            },
            recommended_action: { type: 'string' }
          }
        }
      });

      // Update inquiry with score
      await base44.entities.Inquiry.update(inquiry.id, {
        lead_score: result.lead_score,
        lead_quality: result.lead_quality,
        conversion_probability: result.conversion_probability,
        ai_insights: {
          urgency: result.urgency_level,
          readiness: result.readiness_to_proceed,
          key_interests: result.key_interests
        }
      });

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-inquiries'] });
      if (onScoreUpdate) onScoreUpdate(data);
      toast.success('Lead scored successfully');
    },
  });

  const qualityColors = {
    cold: 'bg-slate-100 text-slate-700',
    warm: 'bg-blue-100 text-blue-700',
    hot: 'bg-amber-100 text-amber-700',
    qualified: 'bg-green-100 text-green-700',
  };

  const urgencyColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700',
  };

  const hasScore = inquiry.lead_score !== undefined;

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Target className="w-5 h-5" />
          AI Lead Scoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasScore ? (
          <Button
            onClick={() => scoreLeadMutation.mutate()}
            disabled={scoreLeadMutation.isPending}
            className="w-full"
            style={{ backgroundColor: '#0066CC' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {scoreLeadMutation.isPending ? 'Analyzing...' : 'Calculate Lead Score'}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Lead Score */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Lead Score</span>
                <span className="text-3xl font-bold" style={{ 
                  color: inquiry.lead_score >= 80 ? '#10B981' : 
                         inquiry.lead_score >= 60 ? '#F59E0B' : 
                         inquiry.lead_score >= 30 ? '#3B82F6' : '#6B7280'
                }}>
                  {inquiry.lead_score}
                </span>
              </div>
              <Progress value={inquiry.lead_score} className="h-2" />
            </div>

            {/* Quality & Probability */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Lead Quality</p>
                <Badge className={qualityColors[inquiry.lead_quality] || qualityColors.warm}>
                  {inquiry.lead_quality?.toUpperCase()}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Conversion Probability</p>
                <p className="text-lg font-bold text-slate-900">{inquiry.conversion_probability}%</p>
              </div>
            </div>

            {/* AI Insights */}
            {inquiry.ai_insights && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Urgency Level</p>
                  <Badge className={urgencyColors[inquiry.ai_insights.urgency]}>
                    {inquiry.ai_insights.urgency?.toUpperCase()}
                  </Badge>
                </div>

                {inquiry.ai_insights.readiness && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-900 mb-1">Readiness Assessment</p>
                    <p className="text-sm text-green-800">{inquiry.ai_insights.readiness}</p>
                  </div>
                )}

                {inquiry.ai_insights.key_interests?.length > 0 && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs font-semibold text-purple-900 mb-2">Key Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {inquiry.ai_insights.key_interests.map((interest, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-purple-300 text-purple-700">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => scoreLeadMutation.mutate()}
              disabled={scoreLeadMutation.isPending}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Re-calculate Score
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}