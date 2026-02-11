import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import { TrendingUp, Users, Mail, CheckCircle, Calendar, MessageSquare } from 'lucide-react';

const COLORS = ['#0066CC', '#FF9500', '#EF4444', '#8B5CF6'];
const SENTIMENT_COLORS = {
  positive: '#10B981',
  neutral: '#6B7280',
  negative: '#EF4444',
  no_response: '#D1D5DB'
};

export default function CRMAnalyticsOutreach() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [outreachType, setOutreachType] = useState('all');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['outreachAnalytics', startDate, endDate, outreachType],
    queryFn: () =>
      base44.functions.invoke('generateOutreachAnalytics', {
        startDate: `${startDate}T00:00:00Z`,
        endDate: `${endDate}T23:59:59Z`,
        outreachType: outreachType === 'all' ? null : outreachType
      })
  });

  const data = analytics?.data || {};
  const summary = data.summary || {};

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <CRMLayout title="Outreach Analytics" currentPageName="CRMAnalyticsOutreach">
      <div className="space-y-8">
        {/* Filters */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Outreach Type</label>
                <Select value={outreachType} onValueChange={setOutreachType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="application_inquiry">Application Inquiry</SelectItem>
                    <SelectItem value="course_inquiry">Course Inquiry</SelectItem>
                    <SelectItem value="scholarship_inquiry">Scholarship Inquiry</SelectItem>
                    <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={Mail}
            title="Total Outreach Sent"
            value={summary.total_sent || 0}
            subtitle="Emails & messages"
            color="bg-education-blue"
          />
          <StatCard
            icon={CheckCircle}
            title="Response Rate"
            value={`${summary.response_rate || 0}%`}
            subtitle={`${summary.total_responded || 0} responses`}
            color="bg-green-500"
          />
          <StatCard
            icon={Calendar}
            title="Meeting Conversion"
            value={`${summary.meeting_conversion_rate || 0}%`}
            subtitle={`${summary.meetings_scheduled || 0} meetings`}
            color="bg-alo-orange"
          />
        </div>

        {/* Response Time & Trend */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-education-blue" />
                Response Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.trend && data.trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke="#0066CC"
                      name="Sent"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="responded"
                      stroke="#10B981"
                      name="Responded"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Sentiment Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-alo-orange" />
                Response Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.sentiment_distribution ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Positive', value: data.sentiment_distribution.positive },
                        { name: 'Neutral', value: data.sentiment_distribution.neutral },
                        { name: 'Negative', value: data.sentiment_distribution.negative },
                        { name: 'No Response', value: data.sentiment_distribution.no_response }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={SENTIMENT_COLORS.positive} />
                      <Cell fill={SENTIMENT_COLORS.neutral} />
                      <Cell fill={SENTIMENT_COLORS.negative} />
                      <Cell fill={SENTIMENT_COLORS.no_response} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* By University Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>University Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {data.by_university && data.by_university.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">University</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Sent</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Responses</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Response Rate</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Positive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_university
                      .sort((a, b) => b.total_sent - a.total_sent)
                      .map(uni => (
                        <tr key={uni.university_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900 font-medium">{uni.university_id}</td>
                          <td className="text-center py-3 px-4">
                            <Badge className="bg-blue-100 text-blue-800">{uni.total_sent}</Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge className="bg-green-100 text-green-800">{uni.responses}</Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge className="bg-slate-100 text-slate-800">{uni.response_rate}%</Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge className="bg-orange-100 text-orange-800">{uni.positive_responses}</Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* By Outreach Type */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Performance by Outreach Type</CardTitle>
          </CardHeader>
          <CardContent>
            {data.by_type && data.by_type.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.by_type}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#0066CC" name="Sent" />
                  <Bar dataKey="responses" fill="#10B981" name="Responses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Average Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-4xl font-bold text-education-blue">{summary.avg_response_time_days || 0}</p>
                <p className="text-slate-600 mt-2">Days</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Campaigns</span>
                <span className="font-semibold text-slate-900">{summary.total_sent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Successful Responses</span>
                <span className="font-semibold text-green-600">{summary.total_responded || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Meetings Scheduled</span>
                <span className="font-semibold text-orange-600">{summary.meetings_scheduled || 0}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-slate-900 font-semibold">Overall Success Rate</span>
                <span className="font-bold text-education-blue text-lg">{summary.response_rate || 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}