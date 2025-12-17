import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Award, Users, Globe, Target } from 'lucide-react';

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
};

export default function PartnerAnalytics({ partner, applications, inquiries }) {
  // Calculate monthly referral trends
  const monthlyTrends = useMemo(() => {
    const monthsData = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthsData[key] = { month: key, referrals: 0, enrollments: 0, conversions: 0 };
    }

    // Count applications by month
    applications.forEach(app => {
      const appDate = new Date(app.created_date);
      const key = appDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthsData[key]) {
        monthsData[key].referrals++;
        if (app.status === 'enrolled') {
          monthsData[key].enrollments++;
        }
      }
    });

    // Calculate conversion rates
    Object.keys(monthsData).forEach(key => {
      if (monthsData[key].referrals > 0) {
        monthsData[key].conversions = Math.round((monthsData[key].enrollments / monthsData[key].referrals) * 100);
      }
    });

    return Object.values(monthsData);
  }, [applications]);

  // Application status distribution
  const statusDistribution = useMemo(() => {
    const statuses = {};
    applications.forEach(app => {
      const status = app.status.replace('_', ' ');
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [applications]);

  // Success rates by program/country
  const successRatesByCountry = useMemo(() => {
    const countryData = {};
    
    applications.forEach(app => {
      const country = app.country || 'Unknown';
      if (!countryData[country]) {
        countryData[country] = { total: 0, enrolled: 0 };
      }
      countryData[country].total++;
      if (app.status === 'enrolled') {
        countryData[country].enrolled++;
      }
    });

    return Object.entries(countryData)
      .map(([country, data]) => ({
        country,
        total: data.total,
        successRate: Math.round((data.enrolled / data.total) * 100),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [applications]);

  // Calculate overall metrics
  const metrics = useMemo(() => {
    const totalApps = applications.length;
    const enrolled = applications.filter(a => a.status === 'enrolled').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const active = applications.filter(a => !['enrolled', 'rejected', 'withdrawn'].includes(a.status)).length;
    
    const conversionRate = totalApps > 0 ? Math.round((enrolled / totalApps) * 100) : 0;
    const rejectionRate = totalApps > 0 ? Math.round((rejected / totalApps) * 100) : 0;

    // Calculate trend (compare last 30 days to previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    const recentApps = applications.filter(a => new Date(a.created_date) > thirtyDaysAgo).length;
    const previousApps = applications.filter(a => {
      const date = new Date(a.created_date);
      return date > sixtyDaysAgo && date <= thirtyDaysAgo;
    }).length;
    
    const trend = previousApps > 0 ? Math.round(((recentApps - previousApps) / previousApps) * 100) : 0;

    return {
      totalApps,
      enrolled,
      rejected,
      active,
      conversionRate,
      rejectionRate,
      trend,
      recentApps,
    };
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {metrics.trend !== 0 && (
                <Badge variant={metrics.trend > 0 ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {metrics.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(metrics.trend)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-1">Monthly Referrals</p>
            <p className="text-3xl font-bold">{metrics.recentApps}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold">{metrics.conversionRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Enrollments</p>
            <p className="text-3xl font-bold">{metrics.enrolled}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <Globe className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Active Applications</p>
            <p className="text-3xl font-bold">{metrics.active}</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Trends (Last 6 Months)</CardTitle>
          <CardDescription>Track your referrals and enrollments over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="referrals" stroke={COLORS.primary} strokeWidth={2} name="Referrals" />
              <Line type="monotone" dataKey="enrollments" stroke={COLORS.success} strokeWidth={2} name="Enrollments" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
            <CardDescription>Current status of all applications</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rates by Country */}
        <Card>
          <CardHeader>
            <CardTitle>Success Rates by Country</CardTitle>
            <CardDescription>Top performing destinations</CardDescription>
          </CardHeader>
          <CardContent>
            {successRatesByCountry.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={successRatesByCountry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill={COLORS.success} name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-20">No data available yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate Trend</CardTitle>
          <CardDescription>Monthly conversion percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="conversions" stroke={COLORS.success} strokeWidth={2} name="Conversion Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}