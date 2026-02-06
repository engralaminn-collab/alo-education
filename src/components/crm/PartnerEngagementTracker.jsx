import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export default function PartnerEngagementTracker({ universities, agreements, interactions, applications }) {
  const engagementData = useMemo(() => {
    return universities.map(uni => {
      const uniAgreements = agreements.filter(a => a.university_id === uni.id);
      const uniInteractions = interactions.filter(i => i.university_id === uni.id);
      const uniApplications = applications.filter(a => a.university_id === uni.id);

      // Calculate engagement score
      const activeAgreements = uniAgreements.filter(a => a.status === 'active').length;
      const recentInteractions = uniInteractions.filter(i => {
        const date = new Date(i.interaction_date);
        const monthsAgo = (new Date() - date) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo <= 6;
      }).length;
      const recentApplications = uniApplications.filter(a => {
        const date = new Date(a.created_date);
        const monthsAgo = (new Date() - date) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo <= 3;
      }).length;

      // Engagement scoring
      let score = 0;
      score += activeAgreements * 20;
      score += recentInteractions * 5;
      score += recentApplications * 3;
      score = Math.min(score, 100);

      let level = 'inactive';
      let trend = 'stable';
      let color = 'slate';

      if (score >= 70) {
        level = 'high';
        color = 'green';
      } else if (score >= 40) {
        level = 'medium';
        color = 'blue';
      } else if (score >= 15) {
        level = 'low';
        color = 'orange';
      } else {
        level = 'inactive';
        color = 'slate';
      }

      // Calculate trend
      const lastMonthInteractions = uniInteractions.filter(i => {
        const date = new Date(i.interaction_date);
        const daysAgo = (new Date() - date) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      }).length;

      const previousMonthInteractions = uniInteractions.filter(i => {
        const date = new Date(i.interaction_date);
        const daysAgo = (new Date() - date) / (1000 * 60 * 60 * 24);
        return daysAgo > 30 && daysAgo <= 60;
      }).length;

      if (lastMonthInteractions > previousMonthInteractions) trend = 'up';
      else if (lastMonthInteractions < previousMonthInteractions) trend = 'down';
      else trend = 'stable';

      return {
        university: uni,
        score,
        level,
        trend,
        color,
        metrics: {
          agreements: activeAgreements,
          interactions: recentInteractions,
          applications: recentApplications
        }
      };
    }).sort((a, b) => b.score - a.score);
  }, [universities, agreements, interactions, applications]);

  const TrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const engagementCounts = engagementData.reduce((acc, item) => {
    acc[item.level] = (acc[item.level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Partner Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { level: 'high', label: 'High Engagement', color: 'green' },
              { level: 'medium', label: 'Medium', color: 'blue' },
              { level: 'low', label: 'Low', color: 'orange' },
              { level: 'inactive', label: 'Inactive', color: 'slate' }
            ].map(item => (
              <div key={item.level} className={`p-4 rounded-lg bg-${item.color}-50 border border-${item.color}-200`}>
                <p className="text-2xl font-bold text-slate-900">{engagementCounts[item.level] || 0}</p>
                <p className="text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {engagementData.map((item, index) => (
              <div
                key={item.university.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 text-center font-bold text-slate-400 text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{item.university.university_name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{item.metrics.agreements} agreements</span>
                      <span>•</span>
                      <span>{item.metrics.interactions} recent interactions</span>
                      <span>•</span>
                      <span>{item.metrics.applications} applications</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{item.score}/100</div>
                    <Badge className={`bg-${item.color}-600`}>{item.level}</Badge>
                  </div>
                  {TrendIcon(item.trend)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}