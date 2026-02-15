import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AnomalyDetectionDashboard() {
  const [anomalies, setAnomalies] = useState(null);

  const detectAnomalies = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('detectAnomalies', {});
      return data;
    },
    onSuccess: (data) => {
      setAnomalies(data);
      toast.success('Anomaly detection complete');
    }
  });

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const anomalyIcons = {
    spike: TrendingUp,
    drop: TrendingDown,
    trend_break: Activity,
    pattern_change: AlertTriangle,
    outlier: AlertTriangle
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          AI Anomaly Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Identify unusual trends in applications, success rates, and student behavior.
        </p>

        <Button
          onClick={() => detectAnomalies.mutate()}
          disabled={detectAnomalies.isPending}
          className="bg-orange-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {detectAnomalies.isPending ? 'Analyzing...' : 'Run Anomaly Detection'}
        </Button>

        {anomalies?.anomalies && (
          <div className="space-y-4 mt-6">
            {/* Trend Overview */}
            {anomalies.anomalies.trend_analysis && (
              <div className="grid md:grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg ${
                  anomalies.anomalies.trend_analysis.application_trend === 'increasing' ? 'bg-green-50' :
                  anomalies.anomalies.trend_analysis.application_trend === 'decreasing' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                  <p className="text-xs font-medium mb-1">Application Trend</p>
                  <p className="font-bold capitalize">{anomalies.anomalies.trend_analysis.application_trend}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  anomalies.anomalies.trend_analysis.success_rate_trend === 'improving' ? 'bg-green-50' :
                  anomalies.anomalies.trend_analysis.success_rate_trend === 'declining' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                  <p className="text-xs font-medium mb-1">Success Rate Trend</p>
                  <p className="font-bold capitalize">{anomalies.anomalies.trend_analysis.success_rate_trend}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  anomalies.anomalies.trend_analysis.inquiry_trend === 'growing' ? 'bg-green-50' :
                  anomalies.anomalies.trend_analysis.inquiry_trend === 'shrinking' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                  <p className="text-xs font-medium mb-1">Inquiry Trend</p>
                  <p className="font-bold capitalize">{anomalies.anomalies.trend_analysis.inquiry_trend}</p>
                </div>
              </div>
            )}

            {/* Detected Anomalies */}
            {anomalies.anomalies.detected_anomalies?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Detected Anomalies</h4>
                <div className="space-y-3">
                  {anomalies.anomalies.detected_anomalies.map((anomaly, i) => {
                    const Icon = anomalyIcons[anomaly.anomaly_type] || AlertTriangle;
                    return (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-orange-600" />
                            <h5 className="font-semibold capitalize">
                              {anomaly.anomaly_type.replace('_', ' ')}
                            </h5>
                          </div>
                          <Badge className={severityColors[anomaly.severity]}>
                            {anomaly.severity}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-700 mb-2">{anomaly.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="bg-slate-50 p-2 rounded">
                            <p className="text-slate-600">Metric</p>
                            <p className="font-medium">{anomaly.metric}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <p className="text-slate-600">Period</p>
                            <p className="font-medium">{anomaly.time_period}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <p className="text-slate-600">Baseline</p>
                            <p className="font-medium">{anomaly.baseline_value}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <p className="text-slate-600">Actual</p>
                            <p className="font-medium">{anomaly.actual_value}</p>
                          </div>
                        </div>

                        {anomaly.possible_causes?.length > 0 && (
                          <div className="bg-yellow-50 p-2 rounded mb-2">
                            <p className="text-xs font-semibold text-yellow-900 mb-1">Possible Causes:</p>
                            <ul className="space-y-1">
                              {anomaly.possible_causes.map((cause, j) => (
                                <li key={j} className="text-xs text-yellow-800">• {cause}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {anomaly.recommended_actions?.length > 0 && (
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Recommended Actions:</p>
                            <ul className="space-y-1">
                              {anomaly.recommended_actions.map((action, j) => (
                                <li key={j} className="text-xs text-blue-800">→ {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Early Warnings */}
            {anomalies.anomalies.early_warnings?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Early Warning Signs
                </h4>
                <ul className="space-y-1">
                  {anomalies.anomalies.early_warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-red-800">⚠️ {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}