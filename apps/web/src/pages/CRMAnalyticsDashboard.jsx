import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, TrendingUp, FileText, Award, MapPin, BookOpen, 
  Calendar, Target, ArrowUp, ArrowDown
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CRMLayout from '@/components/crm/CRMLayout';

const COLORS = ['#0066CC', '#F37021', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function CRMAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('30'); // days

  const { data: applications = [] } = useQuery({
    queryKey: ['analytics-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['analytics-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['analytics-courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['analytics-counselors'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  // KPI Calculations
  const totalApplications = applications.length;
  const enrolledApps = applications.filter(a => a.status === 'enrolled').length;
  const conversionRate = totalApplications > 0 ? ((enrolledApps / totalApplications) * 100).toFixed(1) : 0;
  
  const recentApplications = applications.filter(a => {
    const created = new Date(a.created_date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(timeframe));
    return created >= cutoff;
  });

  const previousPeriodApps = applications.filter(a => {
    const created = new Date(a.created_date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(timeframe) * 2);
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - parseInt(timeframe));
    return created >= cutoff && created < periodStart;
  });

  const appGrowth = previousPeriodApps.length > 0 
    ? (((recentApplications.length - previousPeriodApps.length) / previousPeriodApps.length) * 100).toFixed(1)
    : 0;

  // Course Popularity
  const courseCounts = {};
  applications.forEach(app => {
    const course = courses.find(c => c.id === app.course_id);
    if (course) {
      courseCounts[course.course_title] = (courseCounts[course.course_title] || 0) + 1;
    }
  });
  const popularCourses = Object.entries(courseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name: name.substring(0, 30) + '...', value }));

  // Destination Demand
  const countryCounts = {};
  applications.forEach(app => {
    const country = app.destination_country || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const topDestinations = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Monthly Trends
  const monthlyData = {};
  applications.forEach(app => {
    const month = new Date(app.created_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  const trendData = Object.entries(monthlyData)
    .slice(-6)
    .map(([month, applications]) => ({ month, applications }));

  // Counselor Performance
  const counselorStats = counselors.map(counselor => {
    const counselorApps = applications.filter(a => a.assigned_counsellor === counselor.user_id);
    const enrolled = counselorApps.filter(a => a.status === 'enrolled').length;
    return {
      name: counselor.name,
      applications: counselorApps.length,
      enrolled,
      conversion: counselorApps.length > 0 ? ((enrolled / counselorApps.length) * 100).toFixed(1) : 0
    };
  }).sort((a, b) => b.applications - a.applications).slice(0, 10);

  // Status Distribution
  const statusCounts = {};
  applications.forEach(app => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ 
    name: name.replace(/_/g, ' ').toUpperCase(), 
    value 
  }));

  return (
    <CRMLayout currentPage="Analytics Dashboard">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-slate-600">Comprehensive insights and performance metrics</p>
          </div>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#0066CC' }}>{totalApplications}</div>
              <div className="flex items-center gap-1 text-sm mt-1">
                {appGrowth >= 0 ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />}
                <span className={appGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(appGrowth)}% vs previous period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#F37021' }}>{conversionRate}%</div>
              <p className="text-sm text-slate-600 mt-1">{enrolledApps} enrolled students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{students.length}</div>
              <p className="text-sm text-slate-600 mt-1">Total registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Top Counselor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-600">
                {counselorStats[0]?.name || 'N/A'}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {counselorStats[0]?.applications || 0} applications
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="courses">Course Analysis</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="counselors">Counselor Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#0066CC" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={popularCourses} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={200} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#F37021" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations">
            <Card>
              <CardHeader>
                <CardTitle>Top Study Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topDestinations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0066CC" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counselors">
            <Card>
              <CardHeader>
                <CardTitle>Counselor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {counselorStats.map((counselor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{counselor.name}</p>
                          <p className="text-sm text-slate-600">
                            {counselor.applications} applications • {counselor.enrolled} enrolled
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: '#F37021' }}>
                          {counselor.conversion}%
                        </p>
                        <p className="text-xs text-slate-600">Conversion Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}