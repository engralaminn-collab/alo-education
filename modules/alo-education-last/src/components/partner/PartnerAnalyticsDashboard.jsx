import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, Users, DollarSign, Target, Download, 
  Calendar, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PartnerAnalyticsDashboard({ partnerId }) {
  const [timeRange, setTimeRange] = useState('30');

  const { data: referrals = [] } = useQuery({
    queryKey: ['partner-referrals-analytics', partnerId],
    queryFn: () => base44.entities.PartnerReferral.filter({ partner_id: partnerId }),
    enabled: !!partnerId
  });

  const { data: students = [] } = useQuery({
    queryKey: ['partner-students-analytics', partnerId],
    queryFn: () => base44.entities.StudentProfile.filter({ source: `partner_${partnerId}` }),
    enabled: !!partnerId
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['partner-commissions-analytics', partnerId],
    queryFn: () => base44.entities.Commission.filter({ partner_id: partnerId }),
    enabled: !!partnerId
  });

  // Filter data by time range
  const filterByTimeRange = (data, dateField = 'created_date') => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return data.filter(item => new Date(item[dateField]) >= cutoffDate);
  };

  const filteredReferrals = filterByTimeRange(referrals);
  const filteredStudents = filterByTimeRange(students);
  const filteredCommissions = filterByTimeRange(commissions);

  // Calculate key metrics
  const totalReferrals = filteredReferrals.length;
  const convertedLeads = filteredReferrals.filter(r => r.status === 'converted' || r.status === 'enrolled').length;
  const conversionRate = totalReferrals > 0 ? ((convertedLeads / totalReferrals) * 100).toFixed(1) : 0;
  const totalEarnings = filteredCommissions.reduce((sum, c) => sum + (c.amount || 0), 0);

  // Previous period comparison
  const prevPeriodCutoff = new Date();
  prevPeriodCutoff.setDate(prevPeriodCutoff.getDate() - (parseInt(timeRange) * 2));
  const prevPeriodData = referrals.filter(r => {
    const date = new Date(r.created_date);
    return date >= prevPeriodCutoff && date < new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
  });
  const prevConversionRate = prevPeriodData.length > 0 ? 
    ((prevPeriodData.filter(r => r.status === 'converted' || r.status === 'enrolled').length / prevPeriodData.length) * 100) : 0;
  const conversionChange = conversionRate - prevConversionRate;

  // Lead submission trends (daily)
  const trendData = {};
  filteredReferrals.forEach(r => {
    const date = new Date(r.created_date).toLocaleDateString();
    trendData[date] = (trendData[date] || 0) + 1;
  });
  const leadTrendData = Object.entries(trendData)
    .map(([date, count]) => ({ date, leads: count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14); // Last 14 days

  // Status distribution
  const statusCounts = filteredReferrals.reduce((acc, r) => {
    acc[r.status || 'submitted'] = (acc[r.status || 'submitted'] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Monthly performance
  const monthlyData = {};
  filteredReferrals.forEach(r => {
    const month = new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, leads: 0, converted: 0 };
    }
    monthlyData[month].leads++;
    if (r.status === 'converted' || r.status === 'enrolled') {
      monthlyData[month].converted++;
    }
  });
  const monthlyChartData = Object.values(monthlyData).slice(-6);

  // Export functionality
  const exportToCSV = () => {
    const csvData = [
      ['Date', 'Lead Name', 'Email', 'Country', 'Status', 'Commission'],
      ...filteredReferrals.map(r => [
        new Date(r.created_date).toLocaleDateString(),
        `${r.lead_data?.first_name} ${r.lead_data?.last_name}`,
        r.lead_data?.email || '',
        r.lead_data?.country_of_interest || '',
        r.status,
        commissions.find(c => c.student_id === r.student_id)?.amount || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partner-performance-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h2>
          <p className="text-slate-600 dark:text-slate-400">Track your referral performance and earnings</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Leads</p>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalReferrals}</p>
            <p className="text-xs text-slate-500 mt-1">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Conversion Rate</p>
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{conversionRate}%</p>
              {conversionChange !== 0 && (
                <span className={`text-sm flex items-center ${conversionChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {conversionChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(conversionChange).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">vs previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Converted Leads</p>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{convertedLeads}</p>
            <p className="text-xs text-slate-500 mt-1">Successfully enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Earnings</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Commission earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Submission Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Submission Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Performance & Status Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#3B82F6" name="Total Leads" />
                <Bar dataKey="converted" fill="#10B981" name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
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
      </div>
    </div>
  );
}