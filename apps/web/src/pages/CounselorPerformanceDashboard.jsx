import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, FileText, TrendingUp, Star, Target, 
  Award, Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0066CC', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CounselorPerformanceDashboard() {
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-performance'],
    queryFn: () => base44.entities.Counselor.list()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-all'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-all'],
    queryFn: () => base44.entities.Task.list()
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials-all'],
    queryFn: () => base44.entities.Testimonial.filter({ status: 'approved' })
  });

  // Calculate metrics for each counselor
  const counselorMetrics = counselors.map(counselor => {
    const counselorStudents = students.filter(s => s.counselor_id === counselor.id);
    const counselorApplications = applications.filter(a => 
      counselorStudents.some(s => s.id === a.student_id)
    );
    const counselorTasks = tasks.filter(t => t.assigned_to === counselor.id);
    const counselorTestimonials = testimonials.filter(t => 
      counselorStudents.some(s => s.id === t.student_id)
    );

    const enrolledStudents = counselorStudents.filter(s => s.status === 'enrolled').length;
    const conversionRate = counselorStudents.length > 0 
      ? (enrolledStudents / counselorStudents.length * 100).toFixed(1) 
      : 0;

    const avgSatisfaction = counselorTestimonials.length > 0
      ? (counselorTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / counselorTestimonials.length).toFixed(1)
      : 0;

    const pendingTasks = counselorTasks.filter(t => t.status === 'pending').length;
    const completedTasks = counselorTasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = counselorTasks.length > 0
      ? (completedTasks / counselorTasks.length * 100).toFixed(1)
      : 0;

    return {
      id: counselor.id,
      name: counselor.name,
      email: counselor.email,
      totalStudents: counselorStudents.length,
      enrolledStudents,
      conversionRate: parseFloat(conversionRate),
      totalApplications: counselorApplications.length,
      avgSatisfaction: parseFloat(avgSatisfaction),
      pendingTasks,
      completedTasks,
      taskCompletionRate: parseFloat(taskCompletionRate),
      capacity: counselor.max_students || 50,
      currentLoad: counselor.current_students || counselorStudents.length
    };
  });

  // Sort by performance score
  const rankedCounselors = [...counselorMetrics].sort((a, b) => 
    (b.conversionRate + b.avgSatisfaction * 10 + b.taskCompletionRate) - 
    (a.conversionRate + a.avgSatisfaction * 10 + a.taskCompletionRate)
  );

  // Overall team metrics
  const totalStudents = students.length;
  const totalEnrolled = students.filter(s => s.status === 'enrolled').length;
  const teamConversionRate = totalStudents > 0 ? (totalEnrolled / totalStudents * 100).toFixed(1) : 0;
  const totalApplications = applications.length;
  const teamAvgSatisfaction = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)
    : 0;

  // Student status distribution
  const statusDistribution = [
    { name: 'New Lead', value: students.filter(s => s.status === 'new_lead').length },
    { name: 'In Progress', value: students.filter(s => s.status === 'in_progress').length },
    { name: 'Applied', value: students.filter(s => s.status === 'applied').length },
    { name: 'Enrolled', value: students.filter(s => s.status === 'enrolled').length },
    { name: 'Lost', value: students.filter(s => s.status === 'lost').length }
  ];

  return (
    <CRMLayout title="Performance Dashboard">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-800 shadow-sm">
          <TabsTrigger value="overview" className="select-none">Overview</TabsTrigger>
          <TabsTrigger value="counselors" className="select-none">Counselor Rankings</TabsTrigger>
          <TabsTrigger value="workload" className="select-none">Workload Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Team KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Students</p>
                    <h3 className="text-2xl font-bold dark:text-white mt-1">{totalStudents}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="w-6 h-6 text-education-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Conversion Rate</p>
                    <h3 className="text-2xl font-bold dark:text-white mt-1">{teamConversionRate}%</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Applications</p>
                    <h3 className="text-2xl font-bold dark:text-white mt-1">{totalApplications}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Avg Satisfaction</p>
                    <h3 className="text-2xl font-bold dark:text-white mt-1">{teamAvgSatisfaction}/5</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Conversion Chart */}
            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-base dark:text-white">Counselor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={counselorMetrics.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="conversionRate" fill="#0066CC" name="Conversion Rate %" />
                    <Bar dataKey="avgSatisfaction" fill="#10b981" name="Satisfaction (x10)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="border-0 shadow-sm dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-base dark:text-white">Student Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
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

        <TabsContent value="counselors" className="space-y-4">
          {/* Top Performers */}
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Counselor Rankings</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Based on conversion rate, satisfaction, and task completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rankedCounselors.map((counselor, index) => (
                <div 
                  key={counselor.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedCounselor(counselor)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-education-blue to-cyan-500 text-white font-semibold">
                          {counselor.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'
                        } flex items-center justify-center text-white text-xs font-bold`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold dark:text-white">{counselor.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{counselor.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Students</p>
                      <p className="text-lg font-bold dark:text-white">{counselor.totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Conv Rate</p>
                      <p className="text-lg font-bold text-emerald-600">{counselor.conversionRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Satisfaction</p>
                      <p className="text-lg font-bold text-amber-600">{counselor.avgSatisfaction}/5</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tasks</p>
                      <p className="text-lg font-bold text-blue-600">{counselor.taskCompletionRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {counselorMetrics.map(counselor => {
              const loadPercentage = (counselor.currentLoad / counselor.capacity * 100);
              const isOverloaded = loadPercentage > 80;
              
              return (
                <Card key={counselor.id} className="border-0 shadow-sm dark:bg-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base dark:text-white">{counselor.name}</CardTitle>
                      {isOverloaded && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Overloaded
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Capacity</span>
                        <span className="text-sm font-medium dark:text-white">
                          {counselor.currentLoad} / {counselor.capacity}
                        </span>
                      </div>
                      <Progress 
                        value={loadPercentage} 
                        className={isOverloaded ? '[&>div]:bg-red-500' : '[&>div]:bg-education-blue'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">Pending</span>
                        </div>
                        <p className="text-xl font-bold dark:text-white">{counselor.pendingTasks}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">Completed</span>
                        </div>
                        <p className="text-xl font-bold dark:text-white">{counselor.completedTasks}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t dark:border-slate-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Total Applications</span>
                        <span className="font-medium dark:text-white">{counselor.totalApplications}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recommendations */}
          <Card className="border-0 shadow-sm bg-blue-50 dark:bg-slate-800 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-education-blue dark:text-blue-400">
                <Target className="w-5 h-5" />
                Team Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {counselorMetrics.filter(c => c.currentLoad / c.capacity > 0.8).length > 0 && (
                <div className="flex items-start gap-3 bg-white dark:bg-slate-700 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold dark:text-white">Workload Distribution</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {counselorMetrics.filter(c => c.currentLoad / c.capacity > 0.8).length} counselor(s) are over 80% capacity. Consider redistributing students.
                    </p>
                  </div>
                </div>
              )}
              
              {counselorMetrics.filter(c => c.conversionRate < 20).length > 0 && (
                <div className="flex items-start gap-3 bg-white dark:bg-slate-700 p-4 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold dark:text-white">Conversion Rate Training</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Provide additional training to counselors with conversion rates below 20%.
                    </p>
                  </div>
                </div>
              )}

              {counselorMetrics.filter(c => c.avgSatisfaction > 0 && c.avgSatisfaction < 3.5).length > 0 && (
                <div className="flex items-start gap-3 bg-white dark:bg-slate-700 p-4 rounded-lg">
                  <Star className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold dark:text-white">Student Satisfaction</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Review counseling practices with team members receiving below 3.5 star ratings.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}