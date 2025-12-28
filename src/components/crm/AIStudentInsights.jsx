import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, TrendingUp, AlertTriangle, CheckCircle,
  Target, Lightbulb, Activity
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIStudentInsights({ student, applications = [], documents = [] }) {
  const [insights, setInsights] = useState(null);

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const completedApps = applications.filter(a => a.student_id === student.id && a.status === 'enrolled').length;
      const pendingApps = applications.filter(a => a.student_id === student.id && !['enrolled', 'rejected', 'withdrawn'].includes(a.status)).length;
      const approvedDocs = documents.filter(d => d.student_id === student.id && d.status === 'approved').length;
      const totalDocs = documents.filter(d => d.student_id === student.id).length;

      const prompt = `Analyze student performance and generate insights:

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Profile Completeness: ${student.profile_completeness || 0}%
- Nationality: ${student.nationality}
- Study Destination: ${student.preferred_study_destinations?.[0] || 'Not specified'}
- Counselor Assigned: ${student.counselor_id ? 'Yes' : 'No'}

Activity Metrics:
- Total Applications: ${applications.filter(a => a.student_id === student.id).length}
- Pending Applications: ${pendingApps}
- Successful Enrollments: ${completedApps}
- Documents Approved: ${approvedDocs}/${totalDocs}
- Created: ${student.created_date}
- Last Active: ${student.updated_date}

Language Test:
- IELTS Overall: ${student.language_proficiency?.ielts?.overall || 'Not taken'}

Analyze and provide:
1. Performance score (0-100)
2. Engagement level (high/medium/low)
3. Risk factors (array of concerns)
4. Strengths (array of positive points)
5. Recommendations for counselor (array of actionable suggestions)

Return JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            performance_score: { type: 'number' },
            engagement_level: { type: 'string' },
            risk_factors: { type: 'array', items: { type: 'string' } },
            strengths: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setInsights(data);
      toast.success('AI insights generated');
    }
  });

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
          <Brain className="w-5 h-5" />
          AI Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generateInsightsMutation.isPending}
          className="w-full"
          style={{ backgroundColor: '#F37021' }}
        >
          <Brain className="w-4 h-4 mr-2" />
          {generateInsightsMutation.isPending ? 'Analyzing...' : 'Generate AI Insights'}
        </Button>

        {insights && (
          <div className="space-y-4">
            {/* Performance Score */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Performance Score</span>
                <span className="text-2xl font-bold" style={{ 
                  color: insights.performance_score >= 70 ? '#10B981' : 
                         insights.performance_score >= 40 ? '#F59E0B' : '#EF4444' 
                }}>
                  {insights.performance_score}
                </span>
              </div>
              <Progress value={insights.performance_score} className="h-2" />
            </div>

            {/* Engagement Level */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-700">Engagement Level</span>
              <Badge className={
                insights.engagement_level === 'high' ? 'bg-green-100 text-green-700' :
                insights.engagement_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }>
                {insights.engagement_level.toUpperCase()}
              </Badge>
            </div>

            {/* Risk Factors */}
            {insights.risk_factors?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Risk Factors
                </h4>
                <div className="space-y-2">
                  {insights.risk_factors.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {insights.strengths?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {insights.strengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" style={{ color: '#F37021' }} />
                  Recommended Actions
                </h4>
                <div className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                      <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}