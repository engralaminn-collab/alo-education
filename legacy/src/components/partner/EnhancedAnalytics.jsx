import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Globe, BookOpen, Target, Lightbulb, DollarSign, Loader2 } from 'lucide-react';

const COLORS = ['#0066CC', '#F37021', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function EnhancedAnalytics({ partnerId }) {
  const [loading, setLoading] = useState(false);

  const { data: insights, refetch } = useQuery({
    queryKey: ['partner-insights', partnerId],
    queryFn: async () => {
      const response = await base44.functions.invoke('generatePartnerInsights', { 
        partner_id: partnerId 
      });
      return response.data;
    },
    enabled: !!partnerId
  });

  const handleRefresh = async () => {
    setLoading(true);
    await refetch();
    setLoading(false);
  };

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
            Generate AI Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { analytics, insights: aiInsights } = insights;

  // Prepare chart data
  const countryData = Object.entries(analytics.conversionByCountry).map(([country, data]) => ({
    name: country,
    total: data.total,
    converted: data.converted,
    rate: ((data.converted / data.total) * 100).toFixed(1)
  }));

  const sourceData = Object.entries(analytics.leadSourceBreakdown).map(([source, count]) => ({
    name: source,
    value: count
  }));

  const forecastData = aiInsights.forecast ? [
    { month: 'Month 1', earnings: aiInsights.forecast.month1 },
    { month: 'Month 2', earnings: aiInsights.forecast.month2 },
    { month: 'Month 3', earnings: aiInsights.forecast.month3 }
  ] : [];

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card className="border-education-blue">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              AI-Powered Insights
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-600 mb-2">✨ What's Working Well</h4>
            <ul className="space-y-1">
              {aiInsights.insights?.map((insight, i) => (
                <li key={i} className="text-sm text-slate-600">• {insight}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-amber-600 mb-2">🎯 Opportunities for Growth</h4>
            <ul className="space-y-1">
              {aiInsights.opportunities?.map((opp, i) => (
                <li key={i} className="text-sm text-slate-600">• {opp}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-education-blue mb-2">📋 Recommended Actions</h4>
            <ul className="space-y-1">
              {aiInsights.actions?.map((action, i) => (
                <li key={i} className="text-sm text-slate-600">• {action}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Best Performers */}
      {aiInsights.best_performers && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <Globe className="w-8 h-8 text-education-blue mb-2" />
              <p className="text-sm text-slate-500">Top Country</p>
              <p className="text-xl font-bold">{aiInsights.best_performers.country}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <BookOpen className="w-8 h-8 text-alo-orange mb-2" />
              <p className="text-sm text-slate-500">Top Program</p>
              <p className="text-xl font-bold">{aiInsights.best_performers.program}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Target className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-sm text-slate-500">Best Source</p>
              <p className="text-xl font-bold">{aiInsights.best_performers.source}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Earnings Forecast */}
      {forecastData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              3-Month Earnings Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Conversion by Country */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#94A3B8" name="Total Leads" />
              <Bar dataKey="converted" fill="#10B981" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lead Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Source Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}