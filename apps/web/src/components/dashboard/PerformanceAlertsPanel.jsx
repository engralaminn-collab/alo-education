import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';

export default function PerformanceAlertsPanel({ alerts }) {
  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'low': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-orange-300 bg-orange-50';
      case 'low': return 'border-blue-300 bg-blue-50';
      default: return 'border-slate-300 bg-slate-50';
    }
  };

  const getBadgeColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">All systems running smoothly! No alerts at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600" />
            Performance Alerts
          </CardTitle>
          <Badge className="bg-red-600 text-white">{alerts.length} Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                  <Badge className={getBadgeColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2">{alert.message}</p>
                {alert.action_required && (
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <p className="text-xs font-semibold text-slate-900">Action Required:</p>
                    <p className="text-xs text-slate-600">{alert.action_required}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}