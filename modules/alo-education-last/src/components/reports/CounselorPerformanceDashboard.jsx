import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CounselorPerformanceDashboard({ insights }) {
  if (!insights) return null;

  const { counselor_stats, top_performers, improvement_areas, response_time_analysis, workload_balance, training_recommendations } = insights;

  return (
    <div className="space-y-6">
      {/* Counselor Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Counselor Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b-2 border-slate-300">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700">Counselor</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Students</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Applications</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Enrolled</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Conversion</th>
                  <th className="text-center p-3 font-semibold text-slate-700">Avg Response</th>
                  <th className="text-center p-3 font-semibold text-slate-700">SLA Compliance</th>
                </tr>
              </thead>
              <tbody>
                {counselor_stats?.map((counselor, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{counselor.name}</td>
                    <td className="p-3 text-center">{counselor.students}</td>
                    <td className="p-3 text-center">{counselor.applications}</td>
                    <td className="p-3 text-center text-green-700 font-semibold">{counselor.enrolled}</td>
                    <td className="p-3 text-center">
                      <Badge className={
                        counselor.conversion_rate >= 50 ? 'bg-green-600' :
                        counselor.conversion_rate >= 30 ? 'bg-amber-600' : 'bg-red-600'
                      }>
                        {counselor.conversion_rate}%
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={
                        counselor.avg_response_time <= 30 ? 'bg-green-600' :
                        counselor.avg_response_time <= 60 ? 'bg-amber-600' : 'bg-red-600'
                      }>
                        {counselor.avg_response_time}m
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={
                        counselor.sla_compliance >= 90 ? 'bg-green-600' :
                        counselor.sla_compliance >= 70 ? 'bg-amber-600' : 'bg-red-600'
                      }>
                        {counselor.sla_compliance}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate by Counselor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={counselor_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversion_rate" fill="#0066CC" name="Conversion %" />
              <Bar dataKey="sla_compliance" fill="#10b981" name="SLA Compliance %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Award className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {top_performers?.map((performer, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{performer}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <TrendingUp className="w-5 h-5" />
              Improvement Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {improvement_areas?.map((area, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Response Time Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{response_time_analysis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Workload Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{workload_balance}</p>
          </CardContent>
        </Card>
      </div>

      {/* Training Recommendations */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            🎓 Training Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {training_recommendations?.map((rec, i) => (
              <li key={i} className="bg-white rounded-lg p-3 border border-purple-200 text-sm text-slate-700">
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}