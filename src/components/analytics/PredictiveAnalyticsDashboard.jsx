import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function PredictiveAnalyticsDashboard() {
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState(null);

  const analyzeData = useMutation({
    mutationFn: async (naturalLanguageQuery) => {
      const { data } = await base44.functions.invoke('generatePredictiveInsights', {
        query: naturalLanguageQuery
      });
      return data;
    },
    onSuccess: (data) => {
      setInsights(data.insights);
      toast.success('Analysis complete');
    }
  });

  const quickQueries = [
    "Show me conversion rates for the last quarter",
    "Which lead sources have the highest conversion rates?",
    "Predict next month's enrollment numbers",
    "Identify students at risk of dropping out"
  ];

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Analytics - Ask Anything
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your CRM data (e.g., 'What's our conversion rate for UK leads?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && query && analyzeData.mutate(query)}
            />
            <Button
              onClick={() => query && analyzeData.mutate(query)}
              disabled={!query || analyzeData.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analyzeData.isPending ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickQueries.map((q, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => {
                  setQuery(q);
                  analyzeData.mutate(q);
                }}
              >
                {q}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {insights && (
        <>
          {/* Answer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{insights.answer}</p>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          {insights.metrics?.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              {insights.metrics.map((metric, i) => {
                const TrendIcon = trendIcons[metric.trend] || Minus;
                return (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">{metric.name}</p>
                          <p className="text-2xl font-bold mt-1">{metric.value}</p>
                        </div>
                        <TrendIcon className={`w-8 h-8 ${
                          metric.trend === 'up' ? 'text-green-500' :
                          metric.trend === 'down' ? 'text-red-500' : 'text-slate-400'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Predictions */}
          {insights.predictions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Predictive Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {insights.predictions.next_month_conversion_rate && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">Predicted Conversion Rate</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {insights.predictions.next_month_conversion_rate}%
                    </p>
                  </div>
                )}
                {insights.predictions.expected_new_leads && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">Expected New Leads</p>
                    <p className="text-2xl font-bold text-green-900">
                      {insights.predictions.expected_new_leads}
                    </p>
                  </div>
                )}
                {insights.predictions.high_risk_students && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">High Risk Students</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {insights.predictions.high_risk_students}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Key Insights */}
          {insights.key_insights?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.key_insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Anomalies */}
          {insights.anomalies?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Detected Anomalies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.anomalies.map((anomaly, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <Badge className={
                      anomaly.severity === 'high' ? 'bg-red-500' :
                      anomaly.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    }>
                      {anomaly.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{anomaly.type}</p>
                      <p className="text-sm text-slate-600">{anomaly.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {insights.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}