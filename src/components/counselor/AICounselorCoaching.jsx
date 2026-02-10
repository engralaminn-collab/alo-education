import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AICounselorCoaching() {
  const [coaching, setCoaching] = useState(null);

  const generateCoaching = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generatePersonalizedCoaching', {});
      return data;
    },
    onSuccess: (data) => {
      setCoaching(data);
      toast.success('AI coaching insights generated');
    }
  });

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Your AI Performance Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Get personalized coaching insights and skill development recommendations based on your performance data.
          </p>

          <Button
            onClick={() => generateCoaching.mutate()}
            disabled={generateCoaching.isPending}
            className="bg-indigo-600 w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateCoaching.isPending ? 'Analyzing...' : 'Get My Coaching Insights'}
          </Button>

          {coaching && (
            <div className="space-y-6 mt-6">
              {/* Performance Metrics Overview */}
              {coaching.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700">Conversion</p>
                    <p className="text-2xl font-bold text-blue-900">{coaching.metrics.conversion_rate}%</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-700">Success Rate</p>
                    <p className="text-2xl font-bold text-green-900">{coaching.metrics.success_rate}%</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-700">Response Time</p>
                    <p className="text-2xl font-bold text-purple-900">{coaching.metrics.avg_response_time}m</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-700">Task Completion</p>
                    <p className="text-2xl font-bold text-orange-900">{coaching.metrics.task_completion_rate}%</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-xs text-indigo-700">Sentiment</p>
                    <p className="text-2xl font-bold text-indigo-900">{coaching.metrics.sentiment_score}%</p>
                  </div>
                </div>
              )}

              {/* Performance Summary */}
              {coaching.coaching.performance_summary && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Performance Summary</h4>
                  <p className="text-sm text-indigo-800">{coaching.coaching.performance_summary}</p>
                </div>
              )}

              {/* Strengths */}
              {coaching.coaching.strengths?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Your Strengths
                  </h4>
                  <ul className="space-y-2">
                    {coaching.coaching.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skill Gaps */}
              {coaching.coaching.skill_gaps?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Skill Development Areas
                  </h4>
                  <div className="space-y-3">
                    {coaching.coaching.skill_gaps.map((gap, i) => (
                      <div key={i} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold">{gap.skill}</h5>
                          <Badge className={severityColors[gap.severity]}>
                            {gap.severity} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{gap.impact}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-600">
                            Current: <strong>{gap.current_level}</strong>
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-green-700">
                            Target: <strong>{gap.target_level}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coaching Exercises */}
              {coaching.coaching.coaching_exercises?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Personalized Coaching Exercises
                  </h4>
                  <div className="space-y-3">
                    {coaching.coaching.coaching_exercises.map((exercise, i) => (
                      <div key={i} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-semibold">{exercise.title}</h5>
                            <Badge variant="outline" className="mt-1">{exercise.focus_area}</Badge>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-600">{exercise.duration_minutes}min</Badge>
                            <p className="text-xs text-slate-500 mt-1">{exercise.difficulty}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">{exercise.description}</p>
                        
                        {exercise.steps?.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded mb-3">
                            <p className="text-xs font-semibold text-blue-900 mb-2">Steps:</p>
                            <ol className="space-y-1">
                              {exercise.steps.map((step, j) => (
                                <li key={j} className="text-xs text-blue-800">
                                  {j + 1}. {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-green-900">
                            <strong>Expected Outcome:</strong> {exercise.expected_outcome}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Training Recommendations */}
              {coaching.coaching.training_recommendations?.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">Recommended Training Modules</h4>
                  <div className="space-y-2">
                    {coaching.coaching.training_recommendations.map((rec, i) => (
                      <div key={i} className="bg-white p-3 rounded flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm">{rec.module_name}</h5>
                          <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                          <p className="text-xs text-purple-700 mt-1">
                            <strong>Expected improvement:</strong> {rec.expected_improvement}
                          </p>
                        </div>
                        <Badge className={priorityColors[rec.priority]}>
                          {rec.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Practices */}
              {coaching.coaching.daily_practices?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Daily Practices to Adopt</h4>
                  <ul className="space-y-1">
                    {coaching.coaching.daily_practices.map((practice, i) => (
                      <li key={i} className="text-sm text-blue-800">✓ {practice}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Goals */}
              <div className="grid md:grid-cols-2 gap-4">
                {coaching.coaching.short_term_goals?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">30-Day Goals</h4>
                    <ul className="space-y-1">
                      {coaching.coaching.short_term_goals.map((goal, i) => (
                        <li key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                          <span>□</span> {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {coaching.coaching.long_term_goals?.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-900 mb-2">90-Day Goals</h4>
                    <ul className="space-y-1">
                      {coaching.coaching.long_term_goals.map((goal, i) => (
                        <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                          <span>□</span> {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Benchmark Comparison */}
              {coaching.coaching.benchmark_comparison && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Performance vs. Benchmarks</h4>
                  <p className="text-sm text-slate-700">{coaching.coaching.benchmark_comparison}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}