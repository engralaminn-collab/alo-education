import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Clock, Award, MessageSquare, Target, CheckCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { differenceInMinutes } from 'date-fns';

const COLORS = ['#F37021', '#0066CC', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CRMPerformanceDashboard() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['all-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.CommunicationHistory.list('-created_date', 1000),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  const metrics = useMemo(() => {
    const isCounselor = user?.role !== 'admin';
    const counselorEmail = user?.email;

    // Filter data by counselor if not admin
    const filteredStudents = isCounselor 
      ? students.filter(s => s.counselor_id === counselorEmail || s.created_by === counselorEmail)
      : students;

    const filteredApplications = isCounselor
      ? applications.filter(app => {
          const student = students.find(s => s.id === app.student_id);
          return student && (student.counselor_id === counselorEmail || student.created_by === counselorEmail);
        })
      : applications;

    const filteredCommunications = isCounselor
      ? communications.filter(c => c.counselor_id === counselorEmail)
      : communications;

    // Calculate metrics
    const totalStudents = filteredStudents.length;
    const totalApplications = filteredApplications.length;
    
    const offeredApps = filteredApplications.filter(a => 
      a.status === 'conditional_offer' || a.status === 'unconditional_offer'
    ).length;
    const successRate = totalApplications > 0 ? ((offeredApps / totalApplications) * 100).toFixed(1) : 0;

    // Response time calculation
    const responseTimes = filteredCommunications
      .filter(c => c.direction === 'inbound')
      .map(comm => {
        const responses = communications.filter(r => 
          r.student_id === comm.student_id && 
          r.direction === 'outbound' &&
          new Date(r.created_date) > new Date(comm.created_date)
        );
        if (responses.length > 0) {
          return differenceInMinutes(new Date(responses[0].created_date), new Date(comm.created_date));
        }
        return null;
      })
      .filter(t => t !== null);

    const avgResponseTime = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(0)
      : 0;

    // Application status breakdown
    const statusCounts = filteredApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace(/_/g, ' '),
      value: count
    }));

    // Monthly applications trend
    const monthlyData = filteredApplications.reduce((acc, app) => {
      if (app.applied_date) {
        const month = new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    const trendData = Object.entries(monthlyData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-6)
      .map(([month, count]) => ({ month, applications: count }));

    // Counselor leaderboard (admin only)
    const counselorStats = counselors.map(counselor => {
      const counselorStudents = students.filter(s => s.counselor_id === counselor.email);
      const counselorApps = applications.filter(app => {
        const student = students.find(s => s.id === app.student_id);
        return student && student.counselor_id === counselor.email;
      });
      const counselorOffers = counselorApps.filter(a => 
        a.status === 'conditional_offer' || a.status === 'unconditional_offer'
      ).length;

      return {
        name: counselor.name,
        students: counselorStudents.length,
        applications: counselorApps.length,
        offers: counselorOffers,
        successRate: counselorApps.length > 0 ? ((counselorOffers / counselorApps.length) * 100).toFixed(1) : 0
      };
    }).sort((a, b) => b.successRate - a.successRate);

    return {
      totalStudents,
      totalApplications,
      successRate,
      avgResponseTime,
      statusData,
      trendData,
      counselorStats,
      isCounselor
    };
  }, [students, applications, communications, counselors, user]);

  return (
    <CRMLayout currentPage="Performance">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your key metrics and performance indicators</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{metrics.totalStudents}</div>
              <p className="text-xs text-gray-500 mt-1">Active student profiles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{metrics.totalApplications}</div>
              <p className="text-xs text-gray-500 mt-1">Total submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              <Award className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.successRate}%</div>
              <p className="text-xs text-gray-500 mt-1">Offer acceptance rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.avgResponseTime} min</div>
              <p className="text-xs text-gray-500 mt-1">Average response time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Application Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Application Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="#F37021" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Application Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Counselor Leaderboard (Admin Only) */}
        {!metrics.isCounselor && metrics.counselorStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Counselor Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.counselorStats.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#0066CC" name="Students" />
                  <Bar dataKey="applications" fill="#F37021" name="Applications" />
                  <Bar dataKey="offers" fill="#10b981" name="Offers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </CRMLayout>
  );
}