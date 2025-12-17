import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Users, Clock, Award, 
  Sparkles, Target, Zap, Bell, CheckCircle2
} from 'lucide-react';
import { toast } from "sonner";

export default function CounselorPerformanceAI() {
  const [insights, setInsights] = useState(null);

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-perf'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['apps-perf'],
    queryFn: () => base44.entities.Application.list('-created_date', 100),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-perf'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze counselor performance and provide insights:

Counselors: ${counselors.length} total
Applications: ${applications.length} total (${applications.filter(a => a.status === 'enrolled').length} enrolled)
Tasks: ${tasks.length} total (${tasks.filter(t => t.status === 'completed').length} completed)

Counselor Data:
${counselors.map(c => `- ${c.name}: ${c.current_students}/${c.max_students} students, ${c.success_rate || 0}% success rate`).join('\n')}

Provide:
1. Top performers (2-3 counselors with reasons)
2. Best practices identified from top performers
3. Workload balance recommendations
4. Areas needing improvement across team
5. Suggested follow-up priorities (by counselor)
6. Performance improvement tips`,
        response_json_schema: {
          type: "object",
          properties: {
            team_summary: { type: "string" },
            top_performers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            best_practices: {
              type: "array",
              items: { type: "string" }
            },
            workload_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  counselor: { type: "string" },
                  recommendation: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            improvement_areas: {
              type: "array",
              items: { type: "string" }
            },
            automated_reminders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  priority_level: { type: "string" },
                  suggested_time: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setInsights(data);
      toast.success('Performance analysis complete!');
    },
  });

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            AI Performance Insights
          </CardTitle>
          <Button
            size="sm"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
          >
            {analyzeMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Team
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights ? (
          <div className="text-center py-8 text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click "Analyze Team" to get AI-powered performance insights</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Team Summary */}
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Team Overview</h4>
              <p className="text-sm text-slate-700">{insights.team_summary}</p>
            </div>

            {/* Top Performers */}
            {insights.top_performers?.length > 0 && (
              <div>
                <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Top Performers
                </h4>
                <div className="space-y-3">
                  {insights.top_performers.map((performer, idx) => (
                    <div key={idx} className="bg-emerald-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-900">{performer.name}</span>
                      </div>
                      <p className="text-sm text-slate-700">{performer.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Practices */}
            {insights.best_practices?.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Identified Best Practices
                </h4>
                <ul className="space-y-2">
                  {insights.best_practices.map((practice, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-blue-50 p-3 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {practice}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Workload Recommendations */}
            {insights.workload_recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Workload Balance Recommendations
                </h4>
                <div className="space-y-2">
                  {insights.workload_recommendations.map((rec, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{rec.counselor}</span>
                        <Badge className={priorityColors[rec.priority]}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{rec.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Areas */}
            {insights.improvement_areas?.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Team Improvement Areas
                </h4>
                <ul className="space-y-2">
                  {insights.improvement_areas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-500">•</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Automated Reminders */}
            {insights.automated_reminders?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  AI-Generated Follow-up Priorities
                </h4>
                <div className="space-y-2">
                  {insights.automated_reminders.map((reminder, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{reminder.task}</div>
                          <div className="text-xs text-slate-500">{reminder.suggested_time}</div>
                        </div>
                      </div>
                      <Badge className={priorityColors[reminder.priority_level]}>
                        {reminder.priority_level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button className="w-full" variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Create Automated Reminders
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}