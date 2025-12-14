import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { 
  Download, TrendingUp, Users, FileText, CheckCircle,
  Building2, GraduationCap, Globe
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CRMReports() {
  const [period, setPeriod] = useState('6months');

  const { data: students = [] } = useQuery({
    queryKey: ['report-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['report-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['report-inquiries'],
    queryFn: () => base44.entities.Inquiry.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['report-universities'],
    queryFn: () => base44.entities.University.list(),
  });

  // Monthly trends
  const months = period === '6months' ? 6 : 12;
  const monthRange = eachMonthOfInterval({
    start: subMonths(new Date(), months - 1),
    end: new Date()
  });

  const monthlyData = monthRange.map(month => {
    const monthStr = format(month, 'yyyy-MM');
    const monthLabel = format(month, 'MMM');
    
    const monthStudents = students.filter(s => 
      s.created_date?.startsWith(monthStr)
    ).length;
    
    const monthApplications = applications.filter(a => 
      a.created_date?.startsWith(monthStr)
    ).length;
    
    const monthInquiries = inquiries.filter(i => 
      i.created_date?.startsWith(monthStr)
    ).length;

    return {
      month: monthLabel,
      students: monthStudents,
      applications: monthApplications,
      inquiries: monthInquiries,
    };
  });

  // Country distribution
  const countryData = students.reduce((acc, student) => {
    const countries = student.preferred_countries || [];
    countries.forEach(country => {
      acc[country] = (acc[country] || 0) + 1;
    });
    return acc;
  }, {});

  const countryChartData = Object.entries(countryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Application status distribution
  const statusData = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  // Field of study distribution
  const fieldData = students.reduce((acc, student) => {
    const fields = student.preferred_fields || [];
    fields.forEach(field => {
      acc[field] = (acc[field] || 0) + 1;
    });
    return acc;
  }, {});

  const fieldChartData = Object.entries(fieldData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Conversion rates
  const conversionRate = inquiries.length > 0 
    ? Math.round((inquiries.filter(i => i.status === 'converted').length / inquiries.length) * 100)
    : 0;

  const enrollmentRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === 'enrolled').length / applications.length) * 100)
    : 0;

  return (
    <CRMLayout 
      title="Reports & Analytics"
      actions={
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{students.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Applications</p>
                <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Conversion Rate</p>
                <p className="text-3xl font-bold text-emerald-600">{conversionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Enrollment Rate</p>
                <p className="text-3xl font-bold text-green-600">{enrollmentRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trends */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="inquiries" stackId="1" stroke="#f59e0b" fill="#fef3c7" name="Inquiries" />
                <Area type="monotone" dataKey="students" stackId="1" stroke="#3b82f6" fill="#dbeafe" name="Students" />
                <Area type="monotone" dataKey="applications" stackId="1" stroke="#10b981" fill="#d1fae5" name="Applications" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Destinations */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Popular Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {countryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countryChartData} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fields of Study */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Popular Fields of Study
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fieldChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fieldChartData} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}