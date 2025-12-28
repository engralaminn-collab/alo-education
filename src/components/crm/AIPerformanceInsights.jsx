import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPerformanceInsights({ counselor, metrics, students, applications }) {
  const [insights, setInsights] = React.useState(null);

  const generateInsights = useMutation({
    mutationFn: async () => {
      const counselorStudents = students.filter(s => s.counselor_id === counselor.id);
      const counselorApplications = applications.filter(a => 
        counselorStudents.some(s => s.id === a.student_id)
      );

      const enrolledCount = counselorApplications.filter(a => a.status === 'enrolled').length;
      const rejectedCount = counselorApplications.filter(a => a.status === 'rejected').length;
      const processingCount = counselorApplications.filter(a => 
        a.status === 'submitted' || a.status === 'under_review'
      ).length;

      const prompt = `Analyze this counselor's performance and provide actionable insights.

COUNSELOR: ${counselor.user_name || counselor.email}
EXPERIENCE: ${counselor.experience_years || 'Not specified'} years
SPECIALIZATION: ${counselor.specialization || 'General'}

PERFORMANCE METRICS:
- Total Students: ${counselorStudents.length}
- Enrolled: ${enrolledCount}
- Processing: ${processingCount}
- Rejected: ${rejectedCount}
- Conversion Rate: ${metrics.conversionRate}%
- Task Completion: ${metrics.taskCompletionRate}%
- Student Satisfaction: ${metrics.studentSatisfaction}/5.0

STUDENT DETAILS:
- Average Profile Completeness: ${Math.round(counselorStudents.reduce((sum, s) => sum + (s.profile_completeness || 0), 0) / counselorStudents.length || 0)}%
- New Leads: ${counselorStudents.filter(s => s.status === 'new_lead').length}
- Qualified: ${counselorStudents.filter(s => s.status === 'qualified').length}
- Lost: ${counselorStudents.filter(s => s.status === 'lost').length}

Analyze and provide:
1. strengths: Array of 3-4 specific strengths with evidence
2. areas_for_improvement: Array of 3-4 specific areas that need improvement
3. patterns: Array of 2-3 notable patterns or trends observed
4. training_recommendations: Array of 3-5 specific training topics that would help
5. action_items: Array of 3-4 immediate actionable steps
6. performance_score: Overall score 0-100
7. performance_level: "excellent", "good", "needs_improvement", or "critical"
8. comparison_to_benchmark: How they compare to typical benchmarks (brief text)

Be specific, data-driven, and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            strengths: { type: 'array', items: { type: 'string' } },
            areas_for_improvement: { type: 'array', items: { type: 'string' } },
            patterns: { type: 'array', items: { type: 'string' } },
            training_recommendations: { type: 'array', items: { type: 'string' } },
            action_items: { type: 'array', items: { type: 'string' } },
            performance_score: { type: 'number' },
            performance_level: { type: 'string' },
            comparison_to_benchmark: { type: 'string' }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setInsights(data);
      toast.success('AI insights generated!');
    }
  });

  const performanceLevelColors = {
    excellent: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    good: { bg: 'bg-blue-100', text: 'text-blue-800', icon: TrendingUp },
    needs_improvement: { bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertTriangle },
    critical: { bg: 'bg-red-100', text: 'text-red-800', icon: TrendingDown }
  };

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Sparkles className="w-5 h-5" />
          AI Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!insights ? (
          <div className="text-center py-6">
            <p className="text-slate-600 mb-4">
              Let AI analyze performance data and generate personalized insights
            </p>
            <Button
              onClick={() => generateInsights.mutate()}
              disabled={generateInsights.isPending}
              style={{ backgroundColor: '#F37021' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateInsights.isPending ? 'Analyzing...' : 'Generate AI Insights'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Performance Score */}
            <div className="text-center p-6 bg-slate-50 rounded-lg">
              <div className="text-5xl font-bold mb-2" style={{ 
                color: insights.performance_score >= 80 ? '#10B981' : 
                       insights.performance_score >= 60 ? '#F59E0B' : '#EF4444'
              }}>
                {insights.performance_score}
              </div>
              <p className="text-sm text-slate-600 mb-3">Performance Score</p>
              <Badge className={`${performanceLevelColors[insights.performance_level]?.bg} ${performanceLevelColors[insights.performance_level]?.text}`}>
                {insights.performance_level.replace(/_/g, ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-slate-600 mt-3">{insights.comparison_to_benchmark}</p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </h4>
              <div className="space-y-2">
                {insights.strengths.map((strength, i) => (
                  <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                    ✓ {strength}
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Areas for Improvement
              </h4>
              <div className="space-y-2">
                {insights.areas_for_improvement.map((area, i) => (
                  <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                    ⚠ {area}
                  </div>
                ))}
              </div>
            </div>

            {/* Patterns */}
            <div>
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Notable Patterns
              </h4>
              <div className="space-y-2">
                {insights.patterns.map((pattern, i) => (
                  <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                    📊 {pattern}
                  </div>
                ))}
              </div>
            </div>

            {/* Training Recommendations */}
            <div>
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Training Recommendations
              </h4>
              <div className="space-y-2">
                {insights.training_recommendations.map((rec, i) => (
                  <div key={i} className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-900">
                    💡 {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Immediate Action Items</h4>
              <div className="space-y-2">
                {insights.action_items.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 border rounded-lg text-sm text-slate-900">
                    <span className="font-bold text-slate-600">{i + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => generateInsights.mutate()}
              variant="outline"
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