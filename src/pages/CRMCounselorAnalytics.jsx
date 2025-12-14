import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Award, AlertCircle, Target, 
  Clock, Users, CheckCircle, Star, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { differenceInHours, subDays, isAfter, isBefore, format } from 'date-fns';
import { motion } from 'framer-motion';

const COLORS = ['#0B5ED7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function CRMCounselorAnalytics() {
  const [selectedCounselor, setSelectedCounselor] = useState('all');
  const [timePeriod, setTimePeriod] = useState('30');
  const [selectedIntake, setSelectedIntake] = useState('all');

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

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries-analytics'],
    queryFn: () => base44.entities.Inquiry.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-analytics'],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages-analytics'],
    queryFn: () => base44.entities.Message.list(),
  });

  // Filter by time period
  const cutoffDate = subDays(new Date(), parseInt(timePeriod));

  // Calculate metrics per counselor
  const counselorMetrics = useMemo(() => {
    return counselors.map(counselor => {
      // Filter data for this counselor
      const counselorStudents = students.filter(s => s.counselor_id === counselor.id);
      const counselorInquiries = inquiries.filter(i => i.assigned_to === counselor.id);
      const counselorApplications = applications.filter(app => 
        counselorStudents.some(s => s.id === app.student_id)
      );
      const counselorTasks = tasks.filter(t => t.assigned_to === counselor.id);
      const counselorMessages = messages.filter(m => m.sender_id === counselor.id);

      // Filter by time period
      const recentInquiries = counselorInquiries.filter(i => 
        isAfter(new Date(i.created_date), cutoffDate)
      );
      const recentApplications = counselorApplications.filter(a => 
        isAfter(new Date(a.created_date), cutoffDate)
      );

      // Filter by intake if selected
      let filteredApplications = recentApplications;
      if (selectedIntake !== 'all') {
        filteredApplications = recentApplications.filter(a => a.intake === selectedIntake);
      }

      // Conversion rate
      const conversions = counselorStudents.filter(s => s.status === 'enrolled').length;
      const conversionRate = counselorStudents.length > 0 
        ? Math.round((conversions / counselorStudents.length) * 100) 
        : 0;

      // Application success rate
      const successfulApps = filteredApplications.filter(a => 
        ['unconditional_offer', 'conditional_offer', 'enrolled'].includes(a.status)
      ).length;
      const applicationSuccessRate = filteredApplications.length > 0
        ? Math.round((successfulApps / filteredApplications.length) * 100)
        : 0;

      // Response time
      const messagesWithResponse = counselorMessages.filter(m => {
        const studentMessages = messages.filter(sm => 
          sm.sender_type === 'student' && 
          sm.conversation_id === m.conversation_id &&
          isBefore(new Date(sm.created_date), new Date(m.created_date))
        );
        return studentMessages.length > 0;
      });

      let avgResponseTime = 0;
      if (messagesWithResponse.length > 0) {
        const responseTimes = messagesWithResponse.map(m => {
          const studentMsg = messages
            .filter(sm => 
              sm.sender_type === 'student' && 
              sm.conversation_id === m.conversation_id &&
              isBefore(new Date(sm.created_date), new Date(m.created_date))
            )
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
          
          if (studentMsg) {
            return differenceInHours(new Date(m.created_date), new Date(studentMsg.created_date));
          }
          return 0;
        });
        avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
      }

      // Task completion
      const completedTasks = counselorTasks.filter(t => t.status === 'completed').length;
      const taskCompletionRate = counselorTasks.length > 0
        ? Math.round((completedTasks / counselorTasks.length) * 100)
        : 0;

      // Student satisfaction (mock - can be replaced with real data)
      const satisfactionScore = Math.round(75 + Math.random() * 20);

      return {
        id: counselor.id,
        name: counselor.name,
        totalStudents: counselorStudents.length,
        activeStudents: counselorStudents.filter(s => 
          ['contacted', 'qualified', 'in_progress', 'applied'].includes(s.status)
        ).length,
        conversions,
        conversionRate,
        inquiriesHandled: recentInquiries.length,
        applicationsManaged: filteredApplications.length,
        applicationSuccessRate,
        avgResponseTime,
        taskCompletionRate,
        satisfactionScore,
        messagesCount: counselorMessages.length,
        enrollments: conversions,
      };
    });
  }, [counselors, students, applications, inquiries, tasks, messages, cutoffDate, selectedIntake]);

  // Filter metrics
  const displayMetrics = selectedCounselor === 'all' 
    ? counselorMetrics 
    : counselorMetrics.filter(m => m.id === selectedCounselor);

  // Top performers
  const topByCon version = [...counselorMetrics].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 3);
  const topBySuccess = [...counselorMetrics].sort((a, b) => b.applicationSuccessRate - a.applicationSuccessRate).slice(0, 3);
  const topByResponse = [...counselorMetrics].filter(m => m.avgResponseTime > 0).sort((a, b) => a.avgResponseTime - b.avgResponseTime).slice(0, 3);
  const topBySatisfaction = [...counselorMetrics].sort((a, b) => b.satisfactionScore - a.satisfactionScore).slice(0, 3);

  // Areas for improvement
  const needsImprovement = counselorMetrics.filter(m => 
    m.conversionRate < 50 || m.applicationSuccessRate < 60 || m.avgResponseTime > 24
  );

  // Intake options
  const intakes = [...new Set(applications.map(a => a.intake).filter(Boolean))];

  // Overall stats
  const overallStats = {
    avgConversionRate: Math.round(counselorMetrics.reduce((a, b) => a + b.conversionRate, 0) / counselorMetrics.length) || 0,
    avgSuccessRate: Math.round(counselorMetrics.reduce((a, b) => a + b.applicationSuccessRate, 0) / counselorMetrics.length) || 0,
    avgResponseTime: Math.round(counselorMetrics.reduce((a, b) => a + b.avgResponseTime, 0) / counselorMetrics.length) || 0,
    avgSatisfaction: Math.round(counselorMetrics.reduce((a, b) => a + b.satisfactionScore, 0) / counselorMetrics.length) || 0,
  };

  return (
    <CRMLayout title="Counselor Analytics">
      {/* Filters */}
      <Card className="border-0 shadow-sm mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-700">Analytics Filters:</span>
            </div>
            <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="All Counselors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counselors</SelectItem>
                {counselors.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedIntake} onValueChange={setSelectedIntake}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="All Intakes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intakes</SelectItem>
                {intakes.map(intake => (
                  <SelectItem key={intake} value={intake}>{intake}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{overallStats.avgConversionRate}%</p>
              <p className="text-sm text-slate-600">Avg Conversion Rate</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600">Success</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">{overallStats.avgSuccessRate}%</p>
              <p className="text-sm text-slate-600">Avg Success Rate</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-amber-600" />
                <Badge className="bg-amber-600">Speed</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">{overallStats.avgResponseTime}h</p>
              <p className="text-sm text-slate-600">Avg Response Time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-600">Rating</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">{overallStats.avgSatisfaction}%</p>
              <p className="text-sm text-slate-600">Avg Satisfaction</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates by Counselor</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={displayMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversionRate" fill="#10b981" name="Conversion Rate %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={displayMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applicationSuccessRate" fill="#0B5ED7" name="Success Rate %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={displayMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgResponseTime" stroke="#f59e0b" strokeWidth={2} name="Avg Response (hours)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={displayMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="satisfactionScore" fill="#8b5cf6" name="Satisfaction %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4">
            {displayMetrics.map((counselor, index) => (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{counselor.name}</CardTitle>
                      <div className="flex gap-2">
                        {counselor.conversionRate >= 70 && (
                          <Badge className="bg-green-600">Top Performer</Badge>
                        )}
                        {counselor.avgResponseTime < 12 && counselor.avgResponseTime > 0 && (
                          <Badge className="bg-blue-600">Fast Responder</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Conversion Rate</p>
                        <p className="text-2xl font-bold mb-1">{counselor.conversionRate}%</p>
                        <Progress value={counselor.conversionRate} className="h-2" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Application Success</p>
                        <p className="text-2xl font-bold mb-1">{counselor.applicationSuccessRate}%</p>
                        <Progress value={counselor.applicationSuccessRate} className="h-2" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Response Time</p>
                        <p className="text-2xl font-bold mb-1">{counselor.avgResponseTime}h</p>
                        <Progress value={Math.max(0, 100 - counselor.avgResponseTime * 2)} className="h-2" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Satisfaction Score</p>
                        <p className="text-2xl font-bold mb-1">{counselor.satisfactionScore}%</p>
                        <Progress value={counselor.satisfactionScore} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Students</p>
                        <p className="text-lg font-bold">{counselor.totalStudents}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Active</p>
                        <p className="text-lg font-bold text-blue-600">{counselor.activeStudents}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Applications</p>
                        <p className="text-lg font-bold">{counselor.applicationsManaged}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Enrollments</p>
                        <p className="text-lg font-bold text-green-600">{counselor.enrollments}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Task Rate</p>
                        <p className="text-lg font-bold">{counselor.taskCompletionRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={displayMetrics.slice(0, 5).map(m => ({
                    name: m.name,
                    Conversion: m.conversionRate,
                    Success: m.applicationSuccessRate,
                    Satisfaction: m.satisfactionScore,
                    Tasks: m.taskCompletionRate,
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="Conversion" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Radar name="Success" dataKey="Success" stroke="#0B5ED7" fill="#0B5ED7" fillOpacity={0.3} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workload Distribution</CardTitle>
                <CardDescription>Students per counselor</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={displayMetrics}
                      dataKey="totalStudents"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={(entry) => `${entry.name}: ${entry.totalStudents}`}
                    >
                      {displayMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-slate-600 mb-2">Best Conversion Rate</h4>
                  {topByConversion.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-white rounded-lg mb-2">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-green-600">{i + 1}</Badge>
                        {c.name}
                      </span>
                      <span className="font-bold text-green-600">{c.conversionRate}%</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-600 mb-2">Fastest Response</h4>
                  {topByResponse.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-white rounded-lg mb-2">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-blue-600">{i + 1}</Badge>
                        {c.name}
                      </span>
                      <span className="font-bold text-blue-600">{c.avgResponseTime}h</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-600 mb-2">Highest Satisfaction</h4>
                  {topBySatisfaction.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-white rounded-lg mb-2">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-purple-600">{i + 1}</Badge>
                        {c.name}
                      </span>
                      <span className="font-bold text-purple-600">{c.satisfactionScore}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {needsImprovement.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-slate-600">All counselors performing well!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {needsImprovement.map(counselor => (
                      <div key={counselor.id} className="p-4 bg-white rounded-lg border border-amber-200">
                        <h4 className="font-semibold text-slate-900 mb-2">{counselor.name}</h4>
                        <div className="space-y-2 text-sm">
                          {counselor.conversionRate < 50 && (
                            <div className="flex items-center gap-2 text-red-600">
                              <TrendingDown className="w-4 h-4" />
                              <span>Low conversion rate ({counselor.conversionRate}%)</span>
                            </div>
                          )}
                          {counselor.applicationSuccessRate < 60 && (
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertCircle className="w-4 h-4" />
                              <span>Application success needs improvement ({counselor.applicationSuccessRate}%)</span>
                            </div>
                          )}
                          {counselor.avgResponseTime > 24 && (
                            <div className="flex items-center gap-2 text-amber-600">
                              <Clock className="w-4 h-4" />
                              <span>Slow response time ({counselor.avgResponseTime}h)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}