import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, Target, Sparkles, Trophy, Award } from 'lucide-react';

export default function PerformanceInsightsPanel({ insights }) {
  const getImpactColor = (impact) => {
    switch(impact) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">AI Performance Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed">{insights.overall_summary}</p>
        </CardContent>
      </Card>

      {/* Key Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">Key Trends</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.key_trends?.map((trend, i) => (
            <div key={i} className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-green-900">{trend.title}</h4>
                <Badge className={getImpactColor(trend.impact)}>{trend.impact} impact</Badge>
              </div>
              <p className="text-sm text-green-800">{trend.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg">Areas for Improvement</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.areas_for_improvement?.map((item, i) => (
            <div key={i} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-orange-900">{item.area}</h4>
                <Badge className={getPriorityColor(item.priority)}>{item.priority} priority</Badge>
              </div>
              <p className="text-sm text-orange-800 mb-2">{item.issue}</p>
              <div className="p-3 bg-white rounded border border-orange-200">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-orange-900">Recommendation:</span> {item.recommendation}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Performer Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-lg">Top Performer Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-lg">{insights.top_performer_insights?.counselor_name}</h4>
            </div>
            
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-slate-700 mb-2">Success Factors:</h5>
              <ul className="space-y-1">
                {insights.top_performer_insights?.success_factors?.map((factor, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-slate-700 mb-2">Replicable Strategies:</h5>
              <ul className="space-y-1">
                {insights.top_performer_insights?.replicable_strategies?.map((strategy, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">→</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destination Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Destination Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.destination_analysis?.map((dest, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">{dest.country}</h4>
              <p className="text-sm text-slate-700 mb-2">
                <span className="font-semibold">Performance:</span> {dest.performance}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Opportunity:</span> {dest.opportunity}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Strategic Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.strategic_recommendations?.map((rec, i) => (
            <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">{rec.action}</h4>
              <p className="text-sm text-blue-800 mb-1">
                <span className="font-semibold">Expected Impact:</span> {rec.expected_impact}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Timeframe:</span> {rec.timeframe}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}