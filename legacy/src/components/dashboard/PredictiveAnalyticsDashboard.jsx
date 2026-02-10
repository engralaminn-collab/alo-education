import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertTriangle, Users, Activity, Target, Zap } from 'lucide-react';

export default function PredictiveAnalyticsDashboard({ analytics }) {
  const { historical_trends, forecast, summary, insights } = analytics;

  // Combine historical and forecast data
  const combinedData = [
    ...historical_trends.map(d => ({ ...d, type: 'actual' })),
    ...forecast.map(d => ({ month: d.month, count: d.predicted_applications, type: 'forecast' }))
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Health Score</p>
                <p className="text-3xl font-bold text-green-600">{summary.avg_health_score}</p>
              </div>
              <Activity className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">At-Risk Students</p>
                <p className="text-3xl font-bold text-red-600">{summary.at_risk_count}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{summary.total_students}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Applications</p>
                <p className="text-3xl font-bold text-purple-600">{summary.total_applications}</p>
              </div>
              <Target className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Application Forecast (Next 3 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Applications"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            {forecast.map((f, i) => (
              <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900">{f.month}</p>
                <p className="text-2xl font-bold text-blue-700">{f.predicted_applications}</p>
                <p className="text-xs text-blue-600">Confidence: {f.confidence}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Key Trends & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.trends?.map((trend, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                <p className="text-sm text-slate-700">{trend}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.recommendations?.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-600 font-bold">{i + 1}.</div>
                <p className="text-sm text-slate-700">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}