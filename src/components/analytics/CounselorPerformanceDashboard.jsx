import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CounselorPerformanceDashboard() {
  const [analysis, setAnalysis] = useState(null);

  const analyze = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('analyzeCounselorPerformance', {});
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Performance analysis complete');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              AI Counselor Performance Analytics
            </CardTitle>
            <Button
              onClick={() => analyze.mutate()}
              disabled={analyze.isPending}
              className="bg-yellow-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {analyze.isPending ? 'Analyzing...' : 'Analyze Performance'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="space-y-6">
              {/* Overall Insights */}
              {analysis.analysis?.overall_insights && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Overall Insights</h4>
                  <p className="text-sm text-blue-800">{analysis.analysis.overall_insights}</p>
                </div>
              )}

              {/* Counselor Metrics Table */}
              <div>
                <h4 className="font-semibold mb-3">Counselor Metrics</h4>
                <div className="grid gap-3">
                  {analysis.metrics?.map((metric, idx) => (
                    <Card key={metric.counselor_id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-lg">{metric.counselor_name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              {idx < 3 && <Badge className="bg-yellow-500">Top {idx + 1}</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-slate-600">Conversion Rate</span>
                            </div>
                            <p className="text-xl font-bold text-green-600">{metric.conversion_rate}%</p>
                            <p className="text-xs text-slate-500">{metric.converted_leads}/{metric.total_leads} converted</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-slate-600">Avg Response</span>
                            </div>
                            <p className="text-xl font-bold text-blue-600">{metric.avg_response_time}m</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-4 h-4 text-purple-600" />
                              <span className="text-xs text-slate-600">Task Completion</span>
                            </div>
                            <p className="text-xl font-bold text-purple-600">{metric.task_completion_rate}%</p>
                            <p className="text-xs text-slate-500">{metric.completed_tasks}/{metric.total_tasks} done</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="w-4 h-4 text-orange-600" />
                              <span className="text-xs text-slate-600">Active Students</span>
                            </div>
                            <p className="text-xl font-bold text-orange-600">{metric.active_students}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              {analysis.analysis?.top_performers?.length > 0 && (
                <Card className="border-yellow-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.analysis.top_performers.map((performer, i) => (
                      <div key={i} className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-yellow-500">#{i + 1}</Badge>
                          <h5 className="font-semibold">{performer.counselor_name}</h5>
                        </div>
                        <ul className="space-y-1">
                          {performer.strengths?.map((strength, j) => (
                            <li key={j} className="text-sm text-yellow-900">✓ {strength}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Improvement Areas */}
              {analysis.analysis?.improvement_areas?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.analysis.improvement_areas.map((item, i) => (
                      <div key={i} className="border-l-4 border-orange-400 pl-4 py-2">
                        <h5 className="font-semibold mb-2">{item.counselor_name}</h5>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-slate-600 mb-1">Areas to Improve:</p>
                            <ul className="space-y-1">
                              {item.areas?.map((area, j) => (
                                <li key={j} className="text-sm text-slate-700">• {area}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-600 mb-1">Recommendations:</p>
                            <ul className="space-y-1">
                              {item.recommendations?.map((rec, j) => (
                                <li key={j} className="text-sm text-green-800">→ {rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Best Practices */}
              {analysis.analysis?.best_practices?.length > 0 && (
                <Card className="border-green-300">
                  <CardHeader>
                    <CardTitle className="text-green-900">Best Practices from Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.analysis.best_practices.map((practice, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Click "Analyze Performance" to generate counselor insights</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}