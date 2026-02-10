import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award, ExternalLink } from 'lucide-react';

export default function ReferralSourceTracker({ partnerId }) {
  const [timeRange, setTimeRange] = useState('30');

  const { data: referrals = [] } = useQuery({
    queryKey: ['partner-referrals-sources', partnerId],
    queryFn: () => base44.entities.PartnerReferral.filter({ partner_id: partnerId }),
    enabled: !!partnerId
  });

  // Filter by time range
  const filterByTimeRange = (data) => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return data.filter(item => new Date(item.created_date) >= cutoffDate);
  };

  const filteredReferrals = filterByTimeRange(referrals);

  // Analyze referral sources
  const sourceStats = {};
  filteredReferrals.forEach(r => {
    const source = r.referral_source || 'Direct/Other';
    if (!sourceStats[source]) {
      sourceStats[source] = {
        source,
        total: 0,
        converted: 0,
        enrolled: 0,
        lost: 0
      };
    }
    sourceStats[source].total++;
    if (r.status === 'converted') sourceStats[source].converted++;
    if (r.status === 'enrolled') sourceStats[source].enrolled++;
    if (r.status === 'lost') sourceStats[source].lost++;
  });

  // Convert to array and calculate conversion rates
  const sourceData = Object.values(sourceStats).map(s => ({
    ...s,
    conversionRate: s.total > 0 ? ((s.converted / s.total) * 100).toFixed(1) : 0,
    enrollmentRate: s.total > 0 ? ((s.enrolled / s.total) * 100).toFixed(1) : 0
  })).sort((a, b) => b.total - a.total);

  // Best performing source
  const bestSource = sourceData.reduce((best, current) => 
    parseFloat(current.conversionRate) > parseFloat(best.conversionRate) ? current : best
  , sourceData[0] || {});

  // Pie chart data
  const pieData = sourceData.map(s => ({
    name: s.source,
    value: s.total
  }));

  // Bar chart data
  const barData = sourceData.slice(0, 5); // Top 5 sources

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Referral Source Tracking</h2>
          <p className="text-slate-600 dark:text-slate-400">Identify your most effective referral channels</p>
        </div>
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
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Sources</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{sourceData.length}</p>
            <p className="text-xs text-slate-500 mt-1">Channels generating leads</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-green-600" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Best Performer</p>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{bestSource?.source || 'N/A'}</p>
            <p className="text-xs text-green-600 mt-1">{bestSource?.conversionRate}% conversion rate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Referrals</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{filteredReferrals.length}</p>
            <p className="text-xs text-slate-500 mt-1">Across all sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Source Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Sources Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Sources by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3B82F6" name="Total Leads" />
                <Bar dataKey="converted" fill="#10B981" name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Source Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Source Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Source</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Total Leads</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Converted</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Enrolled</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Lost</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Conversion Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Performance</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map((source, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900 dark:text-white">{source.source}</p>
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">{source.total}</td>
                    <td className="text-right py-3 px-4 text-green-600">{source.converted}</td>
                    <td className="text-right py-3 px-4 text-blue-600">{source.enrolled}</td>
                    <td className="text-right py-3 px-4 text-red-600">{source.lost}</td>
                    <td className="text-right py-3 px-4">
                      <Badge className={parseFloat(source.conversionRate) > 20 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                        {source.conversionRate}%
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      {parseFloat(source.conversionRate) > 30 && <TrendingUp className="w-5 h-5 text-green-600 inline" />}
                      {parseFloat(source.conversionRate) > 20 && parseFloat(source.conversionRate) <= 30 && <TrendingUp className="w-5 h-5 text-amber-600 inline" />}
                      {parseFloat(source.conversionRate) <= 20 && <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Key Insights
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• <strong>{bestSource?.source}</strong> is your top performing channel with {bestSource?.conversionRate}% conversion rate</li>
            <li>• Focus on channels with conversion rates above 20% for maximum ROI</li>
            <li>• Consider optimizing or discontinuing sources with consistently low performance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}