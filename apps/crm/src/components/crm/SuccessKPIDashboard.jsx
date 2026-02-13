import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Target, Clock,
  CheckCircle, Users, FileText, Award
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SuccessKPIDashboard({ students, applications, tasks }) {
  // Calculate KPIs
  const totalStudents = students.length;
  const totalApplications = applications.length;
  
  const enrolledCount = applications.filter(app => app.status === 'enrolled').length;
  const successRate = totalApplications > 0 ? Math.round((enrolledCount / totalApplications) * 100) : 0;
  
  const acceptanceRate = totalApplications > 0 
    ? Math.round((applications.filter(app => 
        ['conditional_offer', 'unconditional_offer', 'enrolled'].includes(app.status)
      ).length / totalApplications) * 100) 
    : 0;

  const avgProfileCompleteness = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.profile_completeness || 0), 0) / students.length)
    : 0;

  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const taskCompletionRate = (pendingTasks + completedTasks) > 0
    ? Math.round((completedTasks / (pendingTasks + completedTasks)) * 100)
    : 0;

  // Application status breakdown
  const statusBreakdown = [
    { name: 'Draft', value: applications.filter(a => a.status === 'draft').length, color: '#94a3b8' },
    { name: 'Submitted', value: applications.filter(a => a.status === 'submitted_to_university').length, color: '#3b82f6' },
    { name: 'Offers', value: applications.filter(a => ['conditional_offer', 'unconditional_offer'].includes(a.status)).length, color: '#10b981' },
    { name: 'Enrolled', value: applications.filter(a => a.status === 'enrolled').length, color: '#8b5cf6' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Student status funnel
  const studentFunnel = [
    { stage: 'New Leads', count: students.filter(s => s.status === 'new_lead').length },
    { stage: 'Qualified', count: students.filter(s => s.status === 'qualified').length },
    { stage: 'In Progress', count: students.filter(s => s.status === 'in_progress').length },
    { stage: 'Applied', count: students.filter(s => s.status === 'applied').length },
    { stage: 'Enrolled', count: students.filter(s => s.status === 'enrolled').length }
  ];

  // Timeline data (mock monthly data)
  const timelineData = [
    { month: 'Jan', applications: 12, offers: 8, enrolled: 5 },
    { month: 'Feb', applications: 18, offers: 14, enrolled: 9 },
    { month: 'Mar', applications: 15, offers: 11, enrolled: 7 },
    { month: 'Apr', applications: 22, offers: 18, enrolled: 12 },
    { month: 'May', applications: 25, offers: 20, enrolled: 15 },
    { month: 'Jun', applications: 20, offers: 16, enrolled: 11 }
  ];

  const COLORS = ['#94a3b8', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-medium text-slate-700">Success Rate</p>
              </div>
              {successRate >= 70 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900">{successRate}%</p>
            <Progress value={successRate} className="mt-2 h-2" />
            <p className="text-xs text-slate-500 mt-1">{enrolledCount} enrolled / {totalApplications} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-slate-700">Acceptance Rate</p>
              </div>
              {acceptanceRate >= 60 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900">{acceptanceRate}%</p>
            <Progress value={acceptanceRate} className="mt-2 h-2" />
            <p className="text-xs text-slate-500 mt-1">Offers received from universities</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-slate-700">Avg Profile</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{avgProfileCompleteness}%</p>
            <Progress value={avgProfileCompleteness} className="mt-2 h-2" />
            <p className="text-xs text-slate-500 mt-1">Profile completeness</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <p className="text-sm font-medium text-slate-700">Task Completion</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{taskCompletionRate}%</p>
            <Progress value={taskCompletionRate} className="mt-2 h-2" />
            <p className="text-xs text-slate-500 mt-1">{completedTasks} completed / {pendingTasks} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {statusBreakdown.map((item, index) => (
                <Badge key={index} style={{ backgroundColor: item.color }} className="text-white">
                  {item.name}: {item.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Student Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Application Timeline (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" name="Applications" />
              <Line type="monotone" dataKey="offers" stroke="#10b981" name="Offers" />
              <Line type="monotone" dataKey="enrolled" stroke="#8b5cf6" name="Enrolled" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Milestone Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Application Milestone Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { milestone: 'Documents Submitted', count: applications.filter(a => a.milestones?.documents_submitted?.completed).length },
              { milestone: 'Application Submitted', count: applications.filter(a => a.milestones?.application_submitted?.completed).length },
              { milestone: 'Offer Received', count: applications.filter(a => a.milestones?.offer_received?.completed).length },
              { milestone: 'Visa Applied', count: applications.filter(a => a.milestones?.visa_applied?.completed).length },
              { milestone: 'Visa Approved', count: applications.filter(a => a.milestones?.visa_approved?.completed).length },
              { milestone: 'Enrolled', count: applications.filter(a => a.milestones?.enrolled?.completed).length }
            ].map((item, index) => {
              const percentage = totalApplications > 0 ? Math.round((item.count / totalApplications) * 100) : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.milestone}</span>
                    <span className="text-sm text-slate-500">{item.count} / {totalApplications} ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}