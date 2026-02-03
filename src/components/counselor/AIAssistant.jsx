import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAssistant({ student, communications, applications }) {
  const [summary, setSummary] = useState(null);

  const generateInsights = useMutation({
    mutationFn: async () => {
      const studentContext = `
Student: ${student.first_name} ${student.last_name}
Email: ${student.email}
Status: ${student.status}
Profile Completeness: ${student.profile_completeness || 0}%
Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}

Recent Communications (${communications.length}):
${communications.slice(0, 10).map(c => 
  `- ${c.communication_type} on ${new Date(c.created_date).toLocaleDateString()}: ${c.summary || c.subject || 'No summary'}`
).join('\n')}

Applications: ${applications.length} total
${applications.map(a => `- Status: ${a.status}`).join('\n')}
      `.trim();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant helping a study abroad counselor. Based on the following student information, provide:

${studentContext}

Please analyze this student's situation and provide:
1. A brief summary of their current status (2-3 sentences)
2. Key insights about their engagement level
3. 3-4 specific next steps the counselor should take
4. Any concerns or opportunities you notice

Format your response as JSON with these keys: summary, engagement_level (High/Medium/Low), next_steps (array), concerns (array), opportunities (array)`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            engagement_level: { type: "string" },
            next_steps: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setSummary(data);
      toast.success('AI insights generated');
    },
    onError: () => {
      toast.error('Failed to generate insights');
    }
  });

  const engagementColors = {
    High: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    Medium: 'bg-amber-100 text-amber-700 border-amber-300',
    Low: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!summary ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">
              Get AI-powered insights about this student's journey
            </p>
            <Button
              onClick={() => generateInsights.mutate()}
              disabled={generateInsights.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateInsights.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-slate-900">Summary</span>
                <Badge className={engagementColors[summary.engagement_level]}>
                  {summary.engagement_level} Engagement
                </Badge>
              </div>
              <p className="text-sm text-slate-700">{summary.summary}</p>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">Recommended Next Steps</span>
              </div>
              <ul className="space-y-2">
                {summary.next_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            {summary.concerns.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-slate-900">Concerns</span>
                </div>
                <ul className="space-y-1">
                  {summary.concerns.map((concern, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {summary.opportunities.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-900">Opportunities</span>
                </div>
                <ul className="space-y-1">
                  {summary.opportunities.map((opp, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => {
                setSummary(null);
                generateInsights.mutate();
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}