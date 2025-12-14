import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Users, CheckCircle, Clock, Target, 
  Award, MessageSquare, Zap
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { differenceInHours, subDays, isAfter } from 'date-fns';

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

  return (
    <CRMLayout title="Performance Dashboard">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                <SelectTrigger className="w-full md:w-64">
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
                <SelectTrigger className="w-full md:w-48">
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
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-600">Total</Badge>
              </div>
              <p className="text-3xl font-bold text-blue-900">{totalInquiries}</p>
              <p className="text-sm text-blue-700">Inquiries Handled</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600">{overallConversionRate}%</Badge>
              </div>
              <p className="text-3xl font-bold text-green-900">{totalConversions}</p>
              <p className="text-sm text-green-700">Conversions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-600">Success</Badge>
              </div>
              <p className="text-3xl font-bold text-purple-900">{totalEnrollments}</p>
              <p className="text-sm text-purple-700">Enrollments</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-amber-600" />
                <Badge className="bg-amber-600">Avg</Badge>
              </div>
              <p className="text-3xl font-bold text-amber-900">{avgResponseTime}h</p>
              <p className="text-sm text-amber-700">Response Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Counselor Performance Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: '#0B5ED7' }} />
              Counselor Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayMetrics.map(counselor => (
                <div key={counselor.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{counselor.name}</h3>
                    <Badge className={
                      counselor.conversionRate >= 70 ? 'bg-green-100 text-green-700' :
                      counselor.conversionRate >= 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {counselor.conversionRate}% Conversion
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{counselor.inquiriesHandled}</p>
                      <p className="text-xs text-slate-500">Inquiries</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{counselor.studentsManaged}</p>
                      <p className="text-xs text-slate-500">Students</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{counselor.enrollments}</p>
                      <p className="text-xs text-slate-500">Enrollments</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{counselor.taskCompletionRate}%</p>
                      <p className="text-xs text-slate-500">Tasks Done</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Conversion Rate Comparison</CardTitle>
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
        </div>
      </div>
    </CRMLayout>
  );
}