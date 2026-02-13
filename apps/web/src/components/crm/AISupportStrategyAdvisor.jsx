import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, Target, MessageSquare, Calendar, 
  FileText, TrendingUp, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AISupportStrategyAdvisor({ studentInsights }) {
  const [strategies, setStrategies] = useState(null);

  const generateStrategiesMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are an AI counseling advisor. Based on these student insights, provide personalized support strategies for the counselor.

STUDENT INSIGHTS:
- Performance Score: ${studentInsights.performance_score}/100
- Engagement Level: ${studentInsights.engagement_level}
- Risk Factors: ${studentInsights.risk_factors?.join(', ') || 'None'}
- Strengths: ${studentInsights.strengths?.join(', ') || 'None identified'}

Generate specific, actionable support strategies that the counselor can implement immediately. Consider:
1. Communication strategies (how and when to reach out)
2. Motivational techniques specific to this student
3. Action plan with timeline
4. Resources to recommend
5. Red flags to monitor

Provide strategies as JSON.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            immediate_actions: {
              type: 'array',
              items: { type: 'string' }
            },
            communication_strategy: {
              type: 'object',
              properties: {
                frequency: { type: 'string' },
                preferred_channel: { type: 'string' },
                tone: { type: 'string' },
                key_talking_points: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            motivation_techniques: {
              type: 'array',
              items: { type: 'string' }
            },
            weekly_plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  action: { type: 'string' }
                }
              }
            },
            resources_to_share: {
              type: 'array',
              items: { type: 'string' }
            },
            warning_signs: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setStrategies(data);
      toast.success('Support strategies generated');
    },
  });

  if (!studentInsights) {
    return (
      <Card className="border-2 border-slate-200">
        <CardContent className="p-6 text-center">
          <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">Generate AI insights first to get support strategies</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Lightbulb className="w-5 h-5" />
          AI Support Strategy Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!strategies ? (
          <Button
            onClick={() => generateStrategiesMutation.mutate()}
            disabled={generateStrategiesMutation.isPending}
            className="w-full"
            style={{ backgroundColor: '#0066CC' }}
          >
            <Target className="w-4 h-4 mr-2" />
            {generateStrategiesMutation.isPending ? 'Generating...' : 'Generate Support Strategies'}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Immediate Actions */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Immediate Actions
              </h4>
              <ul className="space-y-1">
                {strategies.immediate_actions?.map((action, i) => (
                  <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">▸</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Communication Strategy */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Communication Strategy
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700">
                    {strategies.communication_strategy?.frequency}
                  </Badge>
                  <span className="text-blue-800">via {strategies.communication_strategy?.preferred_channel}</span>
                </div>
                <p className="text-blue-800">
                  <strong>Tone:</strong> {strategies.communication_strategy?.tone}
                </p>
                {strategies.communication_strategy?.key_talking_points?.length > 0 && (
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Key Points:</p>
                    <ul className="space-y-1">
                      {strategies.communication_strategy.key_talking_points.map((point, i) => (
                        <li key={i} className="text-blue-800 flex items-start gap-1">
                          <span>•</span> {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Motivation Techniques */}
            {strategies.motivation_techniques?.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Motivation Techniques
                </h4>
                <ul className="space-y-1">
                  {strategies.motivation_techniques.map((technique, i) => (
                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {technique}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weekly Plan */}
            {strategies.weekly_plan?.length > 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Weekly Action Plan
                </h4>
                <div className="space-y-2">
                  {strategies.weekly_plan.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="border-purple-300 text-purple-700">
                        {item.day}
                      </Badge>
                      <span className="text-purple-800">{item.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {strategies.resources_to_share?.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resources to Share
                </h4>
                <ul className="space-y-1">
                  {strategies.resources_to_share.map((resource, i) => (
                    <li key={i} className="text-sm text-amber-800">
                      • {resource}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setStrategies(null)}
              variant="outline"
              className="w-full"
            >
              Generate New Strategies
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}