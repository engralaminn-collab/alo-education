import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, DollarSign, Users, Sparkles, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function PredictiveAnalytics({ partnerId }) {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['partner-predictions', partnerId],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictPartnerPerformance', { partner_id: partnerId });
      return response.data;
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading predictions...</div>;
  }

  const { current_metrics, predictions: pred } = predictions;

  // Earnings forecast data
  const earningsForecast = [
    { month: 'Current', value: current_metrics.total_earnings },
    { month: '1 Month', value: pred.earnings_forecast.low_estimate },
    { month: '2 Months', value: pred.earnings_forecast.mid_estimate },
    { month: '3 Months', value: pred.earnings_forecast.high_estimate }
  ];

  return (
    <div className="space-y-6">
      {/* Predictive Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Powered Performance Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <Badge variant={pred.conversion_forecast.trend === 'improving' ? 'default' : 'outline'}>
                  {pred.conversion_forecast.trend}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{pred.conversion_forecast.expected_rate}%</p>
              <p className="text-sm text-slate-600">Expected Conversion Rate</p>
              <p className="text-xs text-slate-500 mt-1">{pred.conversion_forecast.confidence} confidence</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <Badge>3-Month Forecast</Badge>
              </div>
              <p className="text-2xl font-bold">${pred.earnings_forecast.mid_estimate}</p>
              <p className="text-sm text-slate-600">Projected Earnings</p>
              <p className="text-xs text-slate-500 mt-1">
                Range: ${pred.earnings_forecast.low_estimate} - ${pred.earnings_forecast.high_estimate}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-amber-600" />
                <Badge variant="outline">Next 3 Months</Badge>
              </div>
              <p className="text-2xl font-bold">{pred.expected_conversions}</p>
              <p className="text-sm text-slate-600">Expected Conversions</p>
              <p className="text-xs text-slate-500 mt-1">{pred.earnings_forecast.basis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Forecast (Next 3 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Line type="monotone" dataKey="value" stroke="#0066CC" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ideal Student Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-education-blue" />
            Your Ideal Student Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Demographics & Background</h4>
              <p className="text-slate-700">{pred.ideal_student_profile.demographics}</p>
              
              <h4 className="font-semibold mt-4 mb-2">Budget Range</h4>
              <Badge className="bg-green-100 text-green-800">
                {pred.ideal_student_profile.budget_range}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Top Fields of Study</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {pred.ideal_student_profile.preferred_fields.map((field, i) => (
                  <Badge key={i} variant="outline">{field}</Badge>
                ))}
              </div>

              <h4 className="font-semibold mb-2">Target Countries</h4>
              <div className="flex flex-wrap gap-2">
                {pred.ideal_student_profile.target_countries.map((country, i) => (
                  <Badge key={i} className="bg-education-blue text-white">{country}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Industry Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-education-blue mb-2">
                  {pred.benchmark_comparison.performance_level}
                </p>
                <p className="text-slate-600">
                  Top {pred.benchmark_comparison.percentile}% of Partners
                </p>
              </div>
              {pred.benchmark_comparison.performance_level === 'Above Average' && (
                <TrendingUp className="w-12 h-12 text-green-500" />
              )}
            </div>
            <p className="text-sm text-slate-700">{pred.benchmark_comparison.analysis}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI-Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pred.recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high'
                    ? 'border-red-500 bg-red-50'
                    : rec.priority === 'medium'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{rec.action}</h4>
                  <Badge
                    className={
                      rec.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : rec.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }
                  >
                    {rec.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-slate-700">{rec.expected_impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}