import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Users, CheckCircle, Clock, Target, 
  Award, MessageSquare, Zap, TrendingDown, Star,
  Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { differenceInHours, subDays, isAfter, format } from 'date-fns';
import { motion } from 'framer-motion';

export default function CRMPerformance() {
  const [selectedCounselor, setSelectedCounselor] = useState('all');
  const [timePeriod, setTimePeriod] = useState('30');

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-performance'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries-performance'],
    queryFn: () => base44.entities.Inquiry.list('-created_date', 500),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-performance'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 500),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-performance'],
    queryFn: () => base44.entities.Application.list('-created_date', 500),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-performance'],
    queryFn: () => base44.entities.Task.list('-created_date', 500),
  });

  // Filter by time period
  const cutoffDate = subDays(new Date(), parseInt(timePeriod));
  const filteredInquiries = inquiries.filter(i => 
    i.created_date && isAfter(new Date(i.created_date), cutoffDate)
  );
  const filteredStudents = students.filter(s => 
    s.created_date && isAfter(new Date(s.created_date), cutoffDate)
  );
  const filteredApplications = applications.filter(a => 
    a.created_date && isAfter(new Date(a.created_date), cutoffDate)
  );

  // Calculate counselor-specific metrics
  const counselorMetrics = counselors.map(counselor => {
    const counselorInquiries = selectedCounselor === 'all' 
      ? filteredInquiries.filter(i => i.assigned_to === counselor.id)
      : selectedCounselor === counselor.id ? filteredInquiries.filter(i => i.assigned_to === counselor.id) : [];
    
    const counselorStudents = selectedCounselor === 'all'
      ? filteredStudents.filter(s => s.counselor_id === counselor.id)
      : selectedCounselor === counselor.id ? filteredStudents.filter(s => s.counselor_id === counselor.id) : [];
    
    const counselorApplications = filteredApplications.filter(a => 
      counselorStudents.some(s => s.id === a.student_id)
    );

    const counselorTasks = tasks.filter(t => t.assigned_to === counselor.id);
    const completedTasks = counselorTasks.filter(t => t.status === 'completed');

    const converted = counselorInquiries.filter(i => i.status === 'converted').length;
    const conversionRate = counselorInquiries.length > 0 
      ? (converted / counselorInquiries.length) * 100 
      : 0;

    const enrolled = counselorApplications.filter(a => a.status === 'enrolled').length;
    
    // Calculate average response time
    const contactedInquiries = counselorInquiries.filter(i => 
      i.status === 'contacted' && i.created_date && i.updated_date
    );
    const avgResponseTime = contactedInquiries.length > 0
      ? contactedInquiries.reduce((sum, i) => 
          sum + differenceInHours(new Date(i.updated_date), new Date(i.created_date)), 0
        ) / contactedInquiries.length
      : 0;

    return {
      id: counselor.id,
      name: counselor.name,
      inquiriesHandled: counselorInquiries.length,
      studentsManaged: counselorStudents.length,
      conversions: converted,
      conversionRate: Math.round(conversionRate),
      enrollments: enrolled,
      tasksCompleted: completedTasks.length,
      taskCompletionRate: counselorTasks.length > 0 
        ? Math.round((completedTasks.length / counselorTasks.length) * 100)
        : 0,
      avgResponseTime: Math.round(avgResponseTime),
    };
  });

  // Overall metrics
  const totalInquiries = filteredInquiries.length;
  const totalConversions = filteredInquiries.filter(i => i.status === 'converted').length;
  const overallConversionRate = totalInquiries > 0 
    ? Math.round((totalConversions / totalInquiries) * 100)
    : 0;
  const totalEnrollments = filteredApplications.filter(a => a.status === 'enrolled').length;
  const avgResponseTime = counselorMetrics.length > 0
    ? Math.round(counselorMetrics.reduce((sum, c) => sum + c.avgResponseTime, 0) / counselorMetrics.length)
    : 0;

  // Filter metrics for selected counselor
  const displayMetrics = selectedCounselor === 'all' 
    ? counselorMetrics 
    : counselorMetrics.filter(c => c.id === selectedCounselor);

  // Top performers
  const topPerformer = counselorMetrics.length > 0 
    ? counselorMetrics.reduce((prev, current) => 
        (prev.conversionRate > current.conversionRate) ? prev : current
      )
    : null;

  const fastestResponder = counselorMetrics.length > 0
    ? counselorMetrics.reduce((prev, current) => 
        (prev.avgResponseTime < current.avgResponseTime && prev.avgResponseTime > 0) ? prev : current
      )
    : null;

  return (
    <CRMLayout title="Performance Dashboard">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-700">Filter by:</span>
              </div>
              <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                <SelectTrigger className="w-full md:w-64 bg-white">
                  <SelectValue placeholder="Select counselor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counselors</SelectItem>
                  {counselors.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-full md:w-48 bg-white">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <MessageSquare className="w-10 h-10 opacity-80" />
                  <Badge className="bg-white text-blue-600">Total</Badge>
                </div>
                <p className="text-4xl font-bold mb-1">{totalInquiries}</p>
                <p className="text-sm opacity-90">Inquiries Handled</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <ArrowUp className="w-4 h-4" />
                  <span>+12% vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <TrendingUp className="w-10 h-10 opacity-80" />
                  <Badge className="bg-white text-emerald-600">{overallConversionRate}%</Badge>
                </div>
                <p className="text-4xl font-bold mb-1">{totalConversions}</p>
                <p className="text-sm opacity-90">Conversions</p>
                <div className="mt-3">
                  <Progress value={overallConversionRate} className="h-2 bg-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <Award className="w-10 h-10 opacity-80" />
                  <Badge className="bg-white text-purple-600">Success</Badge>
                </div>
                <p className="text-4xl font-bold mb-1">{totalEnrollments}</p>
                <p className="text-sm opacity-90">Enrollments</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Star className="w-4 h-4" />
                  <span>Top milestone achieved</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <Clock className="w-10 h-10 opacity-80" />
                  <Badge className="bg-white text-amber-600">Avg</Badge>
                </div>
                <p className="text-4xl font-bold mb-1">{avgResponseTime}h</p>
                <p className="text-sm opacity-90">Response Time</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  {avgResponseTime < 24 ? (
                    <><CheckCircle className="w-4 h-4" /><span>Excellent</span></>
                  ) : (
                    <><Clock className="w-4 h-4" /><span>Needs improvement</span></>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Performers */}
        {topPerformer && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  Top Converter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-900">{topPerformer.name}</p>
                    <p className="text-sm text-yellow-700 mt-1">{topPerformer.conversionRate}% conversion rate</p>
                  </div>
                  <Award className="w-16 h-16 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            {fastestResponder && (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Fastest Responder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{fastestResponder.name}</p>
                      <p className="text-sm text-blue-700 mt-1">{fastestResponder.avgResponseTime}h avg response</p>
                    </div>
                    <Clock className="w-16 h-16 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Counselor Performance Details */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: '#0B5ED7' }} />
                  Counselor Performance Overview
                </CardTitle>
                <CardDescription>Quick performance snapshot for each counselor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayMetrics.map((counselor, index) => (
                    <motion.div 
                      key={counselor.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                            {counselor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{counselor.name}</h3>
                            <p className="text-sm text-slate-500">{counselor.inquiriesHandled} inquiries handled</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            counselor.conversionRate >= 70 ? 'bg-green-100 text-green-700 border-green-300' :
                            counselor.conversionRate >= 50 ? 'bg-amber-100 text-amber-700 border-amber-300' :
                            'bg-slate-100 text-slate-700 border-slate-300'
                          }>
                            {counselor.conversionRate}% Conversion
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                          <MessageSquare className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                          <p className="text-2xl font-bold text-slate-900">{counselor.inquiriesHandled}</p>
                          <p className="text-xs text-slate-500">Inquiries</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                          <Users className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                          <p className="text-2xl font-bold text-slate-900">{counselor.studentsManaged}</p>
                          <p className="text-xs text-slate-500">Students</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                          <Award className="w-5 h-5 mx-auto mb-1 text-green-500" />
                          <p className="text-2xl font-bold text-slate-900">{counselor.enrollments}</p>
                          <p className="text-xs text-slate-500">Enrollments</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                          <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                          <p className="text-2xl font-bold text-slate-900">{counselor.taskCompletionRate}%</p>
                          <p className="text-xs text-slate-500">Tasks Done</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>Overall Performance</span>
                          <span className="font-semibold">
                            {Math.round((counselor.conversionRate + counselor.taskCompletionRate) / 2)}%
                          </span>
                        </div>
                        <Progress 
                          value={(counselor.conversionRate + counselor.taskCompletionRate) / 2} 
                          className="h-2"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {displayMetrics.map((counselor) => (
                <Card key={counselor.id} className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{counselor.name}</CardTitle>
                    <CardDescription>Detailed performance breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Conversion Rate</span>
                        <span className="font-semibold">{counselor.conversionRate}%</span>
                      </div>
                      <Progress value={counselor.conversionRate} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Task Completion</span>
                        <span className="font-semibold">{counselor.taskCompletionRate}%</span>
                      </div>
                      <Progress value={counselor.taskCompletionRate} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Avg Response Time</span>
                        <Badge variant="outline">{counselor.avgResponseTime}h</Badge>
                      </div>
                      
                      <div className="pt-3 border-t grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-slate-500">Conversions</p>
                          <p className="text-lg font-bold">{counselor.conversions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Students</p>
                          <p className="text-lg font-bold">{counselor.studentsManaged}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Enrolled</p>
                          <p className="text-lg font-bold">{counselor.enrollments}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            {/* Performance Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Conversion Rate Comparison</CardTitle>
                  <CardDescription>Higher is better</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={displayMetrics}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="conversionRate" fill="#10b981" name="Conversion Rate %" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Task Completion Performance</CardTitle>
                  <CardDescription>Efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={displayMetrics}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="taskCompletionRate" fill="#0B5ED7" name="Completion Rate %" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Response Time Analysis</CardTitle>
                  <CardDescription>Lower is better</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={displayMetrics}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgResponseTime" fill="#f59e0b" name="Avg Response (hours)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Workload Distribution</CardTitle>
                  <CardDescription>Inquiries per counselor</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={displayMetrics}
                        dataKey="inquiriesHandled"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {displayMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0B5ED7', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>


      </div>
    </CRMLayout>
  );
}