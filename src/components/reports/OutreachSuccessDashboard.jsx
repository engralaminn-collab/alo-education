import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle2, TrendingUp, Clock, Lightbulb } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0066CC', '#F37021', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function OutreachSuccessDashboard({ insights }) {
  if (!insights) return null;

  const { metrics, effective_strategies, response_patterns, campaign_analysis, timing_recommendations, partnership_opportunities } = insights;

  const statusData = Object.entries(metrics?.by_status || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  const typeData = Object.entries(metrics?.by_type || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Outreach</p>
                <p className="text-3xl font-bold text-slate-900">{metrics?.total_outreach || 0}</p>
              </div>
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Response Rate</p>
                <p className="text-3xl font-bold text-green-600">{metrics?.response_rate || 0}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-orange-600">
                  {metrics?.campaigns?.filter(c => c.is_active).length || 0}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Outreach by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
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

        <Card>
          <CardHeader>
            <CardTitle>Outreach by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#F37021" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingUp className="w-5 h-5" />
              Effective Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {effective_strategies?.map((strategy, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{strategy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Lightbulb className="w-5 h-5" />
              Partnership Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {partnership_opportunities?.map((opp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{opp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Response Patterns & Timing */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Response Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{response_patterns}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timing Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{timing_recommendations}</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Analysis */}
      {campaign_analysis?.length > 0 && (
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-purple-900">📧 Campaign Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {campaign_analysis.map((analysis, i) => (
                <li key={i} className="bg-white rounded-lg p-3 border border-purple-200 text-sm text-slate-700">
                  {analysis}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}