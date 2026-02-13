import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CRMApplicationDashboard() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-all'],
    queryFn: () => base44.entities.Application.list('-created_date', 500)
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 500)
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-all'],
    queryFn: () => base44.entities.University.list('university_name')
  });

  // Status distribution
  const statusData = [
    { name: 'Draft', value: applications.filter(a => a.status === 'draft').length, color: '#94a3b8' },
    { name: 'Documents Pending', value: applications.filter(a => a.status === 'documents_pending').length, color: '#f59e0b' },
    { name: 'Under Review', value: applications.filter(a => a.status === 'under_review').length, color: '#3b82f6' },
    { name: 'Submitted', value: applications.filter(a => a.status === 'submitted_to_university').length, color: '#8b5cf6' },
    { name: 'Conditional Offer', value: applications.filter(a => a.status === 'conditional_offer').length, color: '#06b6d4' },
    { name: 'Unconditional Offer', value: applications.filter(a => a.status === 'unconditional_offer').length, color: '#10b981' },
    { name: 'Enrolled', value: applications.filter(a => a.status === 'enrolled').length, color: '#22c55e' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Applications by month
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  });

  const applicationTrend = last6Months.map(month => {
    const monthApplications = applications.filter(a => {
      if (!a.applied_date) return false;
      const appDate = new Date(a.applied_date);
      return appDate.toLocaleString('default', { month: 'short', year: 'numeric' }) === month;
    });
    return {
      month,
      submitted: monthApplications.filter(a => ['submitted_to_university', 'conditional_offer', 'unconditional_offer', 'enrolled'].includes(a.status)).length,
      offers: monthApplications.filter(a => ['conditional_offer', 'unconditional_offer', 'enrolled'].includes(a.status)).length
    };
  });

  // Top universities
  const universityStats = universities.map(uni => ({
    name: uni.university_name,
    applications: applications.filter(a => a.university_id === uni.id).length,
    offers: applications.filter(a => a.university_id === uni.id && ['conditional_offer', 'unconditional_offer'].includes(a.status)).length,
    enrolled: applications.filter(a => a.university_id === uni.id && a.status === 'enrolled').length
  })).sort((a, b) => b.applications - a.applications).slice(0, 10);

  // Processing time analysis
  const processingTimes = applications
    .filter(a => a.applied_date && a.offer_date)
    .map(a => {
      const applied = new Date(a.applied_date);
      const offer = new Date(a.offer_date);
      return Math.floor((offer - applied) / (1000 * 60 * 60 * 24));
    });
  
  const avgProcessingTime = processingTimes.length > 0 
    ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
    : 0;

  // Bottleneck detection
  const bottlenecks = [
    {
      stage: 'Documents Pending',
      count: applications.filter(a => a.status === 'documents_pending').length,
      avgDays: 7,
      severity: 'high'
    },
    {
      stage: 'Under Review',
      count: applications.filter(a => a.status === 'under_review').length,
      avgDays: 14,
      severity: 'medium'
    }
  ].filter(b => b.count > 5);

  // Conversion metrics
  const totalSubmitted = applications.filter(a => 
    ['submitted_to_university', 'conditional_offer', 'unconditional_offer', 'enrolled', 'rejected'].includes(a.status)
  ).length;
  
  const offersReceived = applications.filter(a => 
    ['conditional_offer', 'unconditional_offer', 'enrolled'].includes(a.status)
  ).length;
  
  const conversionRate = totalSubmitted > 0 ? ((offersReceived / totalSubmitted) * 100).toFixed(1) : 0;

  return (
    <CRMLayout title="Application Progress Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Applications</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{applications.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Offers Received</p>
                  <p className="text-3xl font-bold text-green-600">{offersReceived}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Processing</p>
                  <p className="text-3xl font-bold text-purple-600">{avgProcessingTime}d</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Conversion Rate</p>
                  <p className="text-3xl font-bold text-cyan-600">{conversionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottlenecks Alert */}
        {bottlenecks.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-200">
                <AlertCircle className="w-5 h-5" />
                Bottlenecks Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bottlenecks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-semibold dark:text-white">{b.stage}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{b.count} applications stuck</p>
                    </div>
                    <Badge variant={b.severity === 'high' ? 'destructive' : 'default'}>
                      {b.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="status" className="space-y-4">
          <TabsList>
            <TabsTrigger value="status">Status Distribution</TabsTrigger>
            <TabsTrigger value="trends">Application Trends</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={applicationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="submitted" stroke="#3b82f6" name="Submitted" strokeWidth={2} />
                    <Line type="monotone" dataKey="offers" stroke="#10b981" name="Offers" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="universities">
            <Card>
              <CardHeader>
                <CardTitle>Top Universities by Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={universityStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                    <Bar dataKey="offers" fill="#10b981" name="Offers" />
                    <Bar dataKey="enrolled" fill="#22c55e" name="Enrolled" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}