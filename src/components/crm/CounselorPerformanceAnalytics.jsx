import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Loader2, Trophy, TrendingUp, Target, 
  MessageSquare, CheckCircle, Users, BarChart3, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function CounselorPerformanceAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-analytics'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-analytics'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-analytics'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-analytics'],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: commLogs = [] } = useQuery({
    queryKey: ['comm-logs-analytics'],
    queryFn: () => base44.entities.CommunicationLog.list('-created_date', 500),
  });

  const generateAnalytics = useMutation({
    mutationFn: async () => {
      setLoading(true);

      const counselorAnalytics = await Promise.all(counselors.map(async (counselor) => {
        const counselorStudents = students.filter(s => s.counselor_id === counselor.user_id);
        const counselorApps = applications.filter(app => 
          counselorStudents.some(s => s.id === app.student_id)
        );
        const counselorTasks = tasks.filter(t => t.assigned_to === counselor.user_id);
        const counselorComms = commLogs.filter(c => c.counselor_id === counselor.user_id);

        const enrolledApps = counselorApps.filter(a => a.status === 'enrolled');
        const successRate = counselorApps.length > 0 
          ? ((enrolledApps.length / counselorApps.length) * 100).toFixed(1)
          : 0;

        const completedTasks = counselorTasks.filter(t => t.status === 'completed').length;
        const taskCompletionRate = counselorTasks.length > 0 
          ? ((completedTasks / counselorTasks.length) * 100).toFixed(1)
          : 0;

        const avgSentiment = counselorComms.length > 0 ? (() => {
          const sentimentScores = counselorComms.map(c => {
            if (c.sentiment?.includes('positive') || c.sentiment?.includes('excited')) return 5;
            if (c.sentiment?.includes('neutral')) return 3;
            if (c.sentiment?.includes('anxious')) return 2;
            return 1;
          });
          return (sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length).toFixed(1);
        })() : 0;

        const urgentIssues = counselorComms.filter(c => 
          c.urgency_level === 'critical' || c.urgency_level === 'high'
        ).length;

        const prompt = `Analyze this counselor's performance:

COUNSELOR: ${counselor.name}
Specializations: ${counselor.specializations?.join(', ') || 'General'}

METRICS:
- Total Students: ${counselorStudents.length}
- Total Applications: ${counselorApps.length}
- Enrollment Success Rate: ${successRate}%
- Tasks Completed: ${completedTasks}/${counselorTasks.length} (${taskCompletionRate}%)
- Communications Logged: ${counselorComms.length}
- Average Student Sentiment: ${avgSentiment}/5
- Urgent Issues Handled: ${urgentIssues}

COMMUNICATION PATTERNS:
${counselorComms.slice(0, 10).map(c => `- ${c.summary} (Sentiment: ${c.sentiment})`).join('\n')}

Provide comprehensive analysis:
1. "overall_score": Performance score 1-100
2. "effectiveness_rating": (excellent/good/average/needs_improvement)
3. "strengths": Array of 3-5 key strengths
4. "weaknesses": Array of 3-5 areas for improvement
5. "training_needs": Specific training modules recommended
6. "communication_quality": Score 1-100 for communication effectiveness
7. "student_satisfaction": Estimated student satisfaction 1-100
8. "efficiency": How efficient are they? (1-100)
9. "empathy_score": Empathy level based on communication logs (1-100)
10. "proactive_score": How proactive are they? (1-100)
11. "insights": Detailed performance insights and patterns
12. "recommendations": Specific actions to improve performance`;

        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              overall_score: { type: "number" },
              effectiveness_rating: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              training_needs: { type: "array", items: { type: "string" } },
              communication_quality: { type: "number" },
              student_satisfaction: { type: "number" },
              efficiency: { type: "number" },
              empathy_score: { type: "number" },
              proactive_score: { type: "number" },
              insights: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        });

        return {
          counselor,
          metrics: {
            totalStudents: counselorStudents.length,
            totalApplications: counselorApps.length,
            enrollments: enrolledApps.length,
            successRate: parseFloat(successRate),
            tasksCompleted: completedTasks,
            totalTasks: counselorTasks.length,
            taskCompletionRate: parseFloat(taskCompletionRate),
            communications: counselorComms.length,
            urgentIssues
          },
          analysis
        };
      }));

      return counselorAnalytics;
    },
    onSuccess: (data) => {
      setAnalytics(data);
      setLoading(false);
      toast.success('Performance analytics generated!');
    },
    onError: () => {
      setLoading(false);
      toast.error('Analytics generation failed');
    }
  });

  const getRatingColor = (rating) => {
    switch(rating?.toLowerCase()) {
      case 'excellent': return 'bg-green-600';
      case 'good': return 'bg-blue-600';
      case 'average': return 'bg-amber-600';
      default: return 'bg-red-600';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const topPerformers = analytics?.sort((a, b) => b.analysis.overall_score - a.analysis.overall_score).slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-purple-900">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Counselor Performance Analytics
            </span>
            <Button 
              onClick={() => generateAnalytics.mutate()}
              disabled={loading || counselors.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Analytics
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!analytics ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-sm text-purple-700">
                Generate AI-powered performance analytics for all counselors
              </p>
            </div>
          ) : (
            <Tabs defaultValue="leaderboard">
              <TabsList className="w-full">
                <TabsTrigger value="leaderboard" className="flex-1">
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="detailed" className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  Detailed Analysis
                </TabsTrigger>
                <TabsTrigger value="training" className="flex-1">
                  <Target className="w-4 h-4 mr-2" />
                  Training Needs
                </TabsTrigger>
              </TabsList>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  {topPerformers?.map((item, idx) => (
                    <Card key={item.counselor.id} className={idx === 0 ? 'border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Rank */}
                          <div className="text-center">
                            {idx === 0 ? (
                              <Trophy className="w-10 h-10 text-amber-500" />
                            ) : idx === 1 ? (
                              <Trophy className="w-8 h-8 text-slate-400" />
                            ) : idx === 2 ? (
                              <Trophy className="w-8 h-8 text-orange-400" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                {idx + 1}
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-slate-900">{item.counselor.name}</h4>
                                <p className="text-xs text-slate-600">{item.counselor.specializations?.join(', ') || 'General'}</p>
                              </div>
                              <Badge className={getRatingColor(item.analysis.effectiveness_rating)}>
                                {item.analysis.effectiveness_rating}
                              </Badge>
                            </div>

                            {/* Score */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-slate-600">Overall Performance</p>
                                <p className={`text-xl font-bold ${getScoreColor(item.analysis.overall_score)}`}>
                                  {item.analysis.overall_score}
                                </p>
                              </div>
                              <Progress value={item.analysis.overall_score} className="h-2" />
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div className="bg-white rounded p-2 border">
                                <p className="text-lg font-bold text-slate-900">{item.metrics.totalStudents}</p>
                                <p className="text-xs text-slate-600">Students</p>
                              </div>
                              <div className="bg-white rounded p-2 border">
                                <p className="text-lg font-bold text-green-600">{item.metrics.successRate}%</p>
                                <p className="text-xs text-slate-600">Success</p>
                              </div>
                              <div className="bg-white rounded p-2 border">
                                <p className="text-lg font-bold text-blue-600">{item.metrics.taskCompletionRate}%</p>
                                <p className="text-xs text-slate-600">Tasks Done</p>
                              </div>
                              <div className="bg-white rounded p-2 border">
                                <p className="text-lg font-bold text-purple-600">{item.metrics.communications}</p>
                                <p className="text-xs text-slate-600">Comms</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Detailed Analysis Tab */}
              <TabsContent value="detailed" className="space-y-4 mt-4">
                {analytics.map((item) => {
                  const radarData = [
                    { skill: 'Communication', score: item.analysis.communication_quality },
                    { skill: 'Empathy', score: item.analysis.empathy_score },
                    { skill: 'Efficiency', score: item.analysis.efficiency },
                    { skill: 'Proactive', score: item.analysis.proactive_score },
                    { skill: 'Satisfaction', score: item.analysis.student_satisfaction }
                  ];

                  return (
                    <Card key={item.counselor.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-slate-900">{item.counselor.name}</CardTitle>
                            <p className="text-sm text-slate-600">{item.counselor.email}</p>
                          </div>
                          <Badge className={getRatingColor(item.analysis.effectiveness_rating)} className="text-sm">
                            {item.analysis.effectiveness_rating}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Radar Chart */}
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-slate-900 mb-3 text-center">Performance Radar</p>
                          <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={radarData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="skill" />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} />
                              <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                            <p className={`text-2xl font-bold ${getScoreColor(item.analysis.communication_quality)}`}>
                              {item.analysis.communication_quality}
                            </p>
                            <p className="text-xs text-blue-800">Communication</p>
                          </div>
                          <div className="bg-rose-50 rounded-lg p-3 text-center border border-rose-200">
                            <p className={`text-2xl font-bold ${getScoreColor(item.analysis.empathy_score)}`}>
                              {item.analysis.empathy_score}
                            </p>
                            <p className="text-xs text-rose-800">Empathy</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                            <p className={`text-2xl font-bold ${getScoreColor(item.analysis.efficiency)}`}>
                              {item.analysis.efficiency}
                            </p>
                            <p className="text-xs text-green-800">Efficiency</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                            <p className={`text-2xl font-bold ${getScoreColor(item.analysis.proactive_score)}`}>
                              {item.analysis.proactive_score}
                            </p>
                            <p className="text-xs text-purple-800">Proactive</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                            <p className={`text-2xl font-bold ${getScoreColor(item.analysis.student_satisfaction)}`}>
                              {item.analysis.student_satisfaction}
                            </p>
                            <p className="text-xs text-amber-800">Satisfaction</p>
                          </div>
                        </div>

                        {/* Insights */}
                        <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                          <h5 className="text-sm font-semibold text-indigo-900 mb-2">Performance Insights</h5>
                          <p className="text-sm text-indigo-800">{item.analysis.insights}</p>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Strengths
                            </h5>
                            <div className="space-y-1">
                              {item.analysis.strengths?.map((strength, i) => (
                                <div key={i} className="bg-green-50 rounded p-2 border border-green-200 text-xs text-green-800">
                                  ✓ {strength}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Areas for Growth
                            </h5>
                            <div className="space-y-1">
                              {item.analysis.weaknesses?.map((weakness, i) => (
                                <div key={i} className="bg-amber-50 rounded p-2 border border-amber-200 text-xs text-amber-800">
                                  → {weakness}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                          <h5 className="text-sm font-semibold text-blue-900 mb-2">Recommendations</h5>
                          <div className="space-y-1">
                            {item.analysis.recommendations?.map((rec, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-blue-800">
                                <span className="text-blue-600 font-bold">{i + 1}.</span>
                                <p>{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Training Needs Tab */}
              <TabsContent value="training" className="space-y-4 mt-4">
                <Card className="border-2 border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">Team Training Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analytics?.map((item) => (
                      item.analysis.training_needs?.length > 0 && (
                        <div key={item.counselor.id} className="bg-white rounded-lg border-2 border-emerald-200 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-slate-900">{item.counselor.name}</h5>
                              <Badge className={getRatingColor(item.analysis.effectiveness_rating)}>
                                {item.analysis.effectiveness_rating}
                              </Badge>
                            </div>
                            <p className={`text-2xl font-bold ${getScoreColor(item.analysis.overall_score)}`}>
                              {item.analysis.overall_score}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-semibold text-emerald-900 mb-2">Recommended Training Modules:</p>
                            <div className="space-y-1">
                              {item.analysis.training_needs.map((need, i) => (
                                <div key={i} className="bg-emerald-50 rounded p-2 border border-emerald-200 text-xs text-emerald-800">
                                  <Award className="w-3 h-3 inline mr-2" />
                                  {need}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </CardContent>
                </Card>

                {/* Performance Comparison Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics?.map(item => ({
                        name: item.counselor.name.split(' ')[0],
                        overall: item.analysis.overall_score,
                        communication: item.analysis.communication_quality,
                        empathy: item.analysis.empathy_score,
                        efficiency: item.analysis.efficiency
                      }))}>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="overall" fill="#8b5cf6" name="Overall" />
                        <Bar dataKey="communication" fill="#3b82f6" name="Communication" />
                        <Bar dataKey="empathy" fill="#ec4899" name="Empathy" />
                        <Bar dataKey="efficiency" fill="#10b981" name="Efficiency" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}