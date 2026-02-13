import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Loader2, Building2, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrendingAnalysis({ type = 'courses' }) {
  const [trends, setTrends] = useState(null);

  const analyzeTrends = useMutation({
    mutationFn: async () => {
      const currentYear = new Date().getFullYear();
      
      const prompt = type === 'courses' ? `
Analyze current trends in international education courses based on market demand, industry growth, and student preferences for ${currentYear}.

Consider:
- Emerging fields (AI, Data Science, Cybersecurity, Sustainability, Health Tech)
- High-demand industries
- Skills gap in global job markets
- Post-pandemic education trends
- Technology adoption trends

Provide:
- 6 trending course fields with short descriptions
- Why each is trending
- Expected growth rate (high/medium)
- Average salary potential range

Format as JSON.` : `
Analyze trending universities for international students in ${currentYear} based on:
- Rising rankings
- International student satisfaction
- Graduate employability
- Research output
- Industry partnerships
- Innovation in teaching

Provide:
- 6 trending universities or types of universities
- Why they're gaining popularity
- Key strengths
- Growth trajectory

Format as JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  reason: { type: "string" },
                  growth_level: { type: "string" },
                  additional_info: { type: "string" }
                }
              }
            },
            market_insights: { type: "string" },
            future_outlook: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setTrends(data);
      toast.success('Trending analysis generated');
    },
    onError: () => {
      toast.error('Failed to generate trends');
    }
  });

  const growthColors = {
    high: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    medium: 'bg-blue-100 text-blue-700 border-blue-300',
    moderate: 'bg-amber-100 text-amber-700 border-amber-300'
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          AI Market Trends - {type === 'courses' ? 'Trending Courses' : 'Trending Universities'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!trends ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              Discover what's trending in {type === 'courses' ? 'education courses' : 'universities'} based on market demand and industry insights
            </p>
            <Button
              onClick={() => analyzeTrends.mutate()}
              disabled={analyzeTrends.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analyzeTrends.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Market Trends...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Trends
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Market Insights */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Market Insights
              </h4>
              <p className="text-sm text-purple-800">{trends.market_insights}</p>
            </div>

            {/* Trending Items */}
            <div className="grid md:grid-cols-2 gap-4">
              {trends.trends?.slice(0, 6).map((trend, i) => (
                <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {type === 'courses' ? (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Building2 className="w-5 h-5 text-blue-600" />
                      )}
                      <h4 className="font-bold text-slate-900">{trend.name}</h4>
                    </div>
                    <Badge className={growthColors[trend.growth_level?.toLowerCase()] || growthColors.medium}>
                      {trend.growth_level}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{trend.description}</p>
                  <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 mb-2">
                    <span className="font-semibold">Why it's trending: </span>
                    {trend.reason}
                  </div>
                  {trend.additional_info && (
                    <p className="text-xs text-slate-500 italic">{trend.additional_info}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Future Outlook */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Future Outlook</h4>
              <p className="text-sm text-blue-800">{trends.future_outlook}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                onClick={() => {
                  setTrends(null);
                  analyzeTrends.mutate();
                }}
                variant="outline"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Analysis
              </Button>
              <Link to={createPageUrl(type === 'courses' ? 'Courses' : 'Universities')}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Explore {type === 'courses' ? 'Courses' : 'Universities'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}