import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, TrendingUp, Target, Clock, CheckCircle, AlertTriangle, Star, Award, Users } from 'lucide-react';
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
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <TrendingUp className="w-4 h-4 text-green-600" />
                             <span className="text-xs text-slate-600">Conversion</span>
                           </div>
                           <p className="text-xl font-bold text-green-600">{metric.conversion_rate}%</p>
                           <p className="text-xs text-slate-500">{metric.converted_leads}/{metric.total_leads}</p>
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <Target className="w-4 h-4 text-blue-600" />
                             <span className="text-xs text-slate-600">App Success</span>
                           </div>
                           <p className="text-xl font-bold text-blue-600">{metric.application_success_rate}%</p>
                           <p className="text-xs text-slate-500">{metric.offers_received} offers</p>
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <Star className="w-4 h-4 text-yellow-600" />
                             <span className="text-xs text-slate-600">Satisfaction</span>
                           </div>
                           <p className="text-xl font-bold text-yellow-600">{metric.avg_satisfaction_rating}/5</p>
                           <p className="text-xs text-slate-500">{metric.total_feedback} reviews</p>
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <Clock className="w-4 h-4 text-purple-600" />
                             <span className="text-xs text-slate-600">Response</span>
                           </div>
                           <p className="text-xl font-bold text-purple-600">{metric.avg_response_time}m</p>
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <Users className="w-4 h-4 text-orange-600" />
                             <span className="text-xs text-slate-600">Students</span>
                           </div>
                           <p className="text-xl font-bold text-orange-600">{metric.active_students}</p>
                         </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Team Benchmarks */}
              {analysis.analysis?.team_benchmarks && (
                <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-slate-600" />
                      Team Benchmarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Avg Conversion</p>
                        <p className="text-2xl font-bold text-green-600">{analysis.analysis.team_benchmarks.avg_conversion_rate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Avg Response</p>
                        <p className="text-2xl font-bold text-blue-600">{analysis.analysis.team_benchmarks.avg_response_time}m</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Avg Satisfaction</p>
                        <p className="text-2xl font-bold text-yellow-600">{analysis.analysis.team_benchmarks.avg_satisfaction}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Top Quartile</p>
                        <p className="text-2xl font-bold text-purple-600">{analysis.analysis.team_benchmarks.top_quartile_threshold}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Red Flags */}
              {analysis.analysis?.red_flags?.length > 0 && (
                <Card className="border-red-300 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-900">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Immediate Attention Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.analysis.red_flags.map((flag, i) => (
                      <div key={i} className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-red-900">{flag.counselor_name}</h5>
                          <Badge variant="destructive">{flag.severity}</Badge>
                        </div>
                        <p className="text-sm text-red-800 mb-2"><strong>Issue:</strong> {flag.issue}</p>
                        <p className="text-sm text-red-700"><strong>Action:</strong> {flag.immediate_action}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

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
                      <div key={i} className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-yellow-500">#{performer.rank || (i + 1)}</Badge>
                          <h5 className="font-semibold text-lg">{performer.counselor_name}</h5>
                          {performer.overall_score && (
                            <Badge variant="outline" className="ml-auto">{performer.overall_score}/100</Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-semibold text-yellow-800 mb-1">Strengths:</p>
                            <ul className="space-y-1">
                              {performer.strengths?.map((strength, j) => (
                                <li key={j} className="text-sm text-yellow-900 flex items-start gap-2">
                                  <Star className="w-3 h-3 mt-0.5 text-yellow-600" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {performer.key_behaviors?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-amber-800 mb-1">Key Behaviors:</p>
                              <ul className="space-y-1">
                                {performer.key_behaviors.map((behavior, j) => (
                                  <li key={j} className="text-sm text-amber-900">→ {behavior}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Satisfaction Insights */}
              {analysis.analysis?.satisfaction_insights && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-green-600" />
                      Student Satisfaction Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.analysis.satisfaction_insights.highest_rated?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-green-900 mb-2">Highest Rated Counselors:</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.analysis.satisfaction_insights.highest_rated.map((name, i) => (
                            <Badge key={i} className="bg-green-500">{name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.analysis.satisfaction_insights.satisfaction_drivers?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-green-900 mb-2">What Drives Satisfaction:</p>
                        <ul className="space-y-1">
                          {analysis.analysis.satisfaction_insights.satisfaction_drivers.map((driver, i) => (
                            <li key={i} className="text-sm text-green-800">✓ {driver}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.analysis.satisfaction_insights.improvement_tips?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-green-900 mb-2">Tips to Improve:</p>
                        <ul className="space-y-1">
                          {analysis.analysis.satisfaction_insights.improvement_tips.map((tip, i) => (
                            <li key={i} className="text-sm text-green-700">→ {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Coaching Recommendations */}
              {analysis.analysis?.improvement_areas?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Coaching Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.analysis.improvement_areas.map((item, i) => (
                      <div key={i} className={`border-l-4 p-4 rounded-r-lg ${
                        item.priority_level === 'high' ? 'border-red-400 bg-red-50' :
                        item.priority_level === 'medium' ? 'border-orange-400 bg-orange-50' :
                        'border-yellow-400 bg-yellow-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-lg">{item.counselor_name}</h5>
                          <Badge variant={item.priority_level === 'high' ? 'destructive' : 'default'}>
                            {item.priority_level} priority
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-700 mb-2">Focus Areas:</p>
                            <ul className="space-y-1">
                              {item.areas?.map((area, j) => (
                                <li key={j} className="text-sm text-slate-700">• {area}</li>
                              ))}
                            </ul>
                          </div>
                          {item.coaching_recommendations?.length > 0 && (
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs font-semibold text-green-700 mb-2">Action Plan:</p>
                              {item.coaching_recommendations.map((rec, j) => (
                                <div key={j} className="mb-3 last:mb-0">
                                  <p className="text-sm font-medium text-slate-900">{rec.focus_area}</p>
                                  <p className="text-sm text-green-800 mt-1">→ {rec.specific_action}</p>
                                  <p className="text-xs text-slate-600 mt-1">Expected: {rec.expected_impact}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Best Practices */}
              {analysis.analysis?.best_practices?.length > 0 && (
                <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-green-900 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Best Practices from Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.analysis.best_practices.map((item, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="flex items-start gap-3">
                            <Badge className="bg-green-600 mt-0.5">{i + 1}</Badge>
                            <div className="flex-1">
                              <p className="font-semibold text-green-900 mb-1">{item.practice || item}</p>
                              {item.source && (
                                <p className="text-sm text-green-700 mb-1">
                                  <span className="font-medium">Source:</span> {item.source}
                                </p>
                              )}
                              {item.impact && (
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Impact:</span> {item.impact}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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