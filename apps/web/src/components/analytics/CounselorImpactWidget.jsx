import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Award, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CounselorImpactWidget() {
  const [analysis, setAnalysis] = useState(null);

  const analyzeCounselorImpact = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('analyzeCounselorImpact', {});
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Counselor impact analysis complete');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Counselor Performance Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Visualize how counselor actions correlate with student success rates.
        </p>

        <Button
          onClick={() => analyzeCounselorImpact.mutate()}
          disabled={analyzeCounselorImpact.isPending}
          className="bg-purple-600 w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {analyzeCounselorImpact.isPending ? 'Analyzing...' : 'Analyze Counselor Impact'}
        </Button>

        {analysis && (
          <div className="space-y-4 mt-6">
            {/* Top Performers */}
            {analysis.top_performers?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Top Performing Counselors</h4>
                <div className="space-y-2">
                  {analysis.top_performers.map((counselor, i) => (
                    <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-green-900">{counselor.name}</h5>
                        <Badge className="bg-green-600">{counselor.overall_score}/100</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-green-700">Success Rate</p>
                          <p className="font-bold text-green-900">{counselor.success_rate}%</p>
                        </div>
                        <div>
                          <p className="text-green-700">Conversion</p>
                          <p className="font-bold text-green-900">{counselor.conversion_rate}%</p>
                        </div>
                        <div>
                          <p className="text-green-700">Response</p>
                          <p className="font-bold text-green-900">{counselor.avg_response_time}m</p>
                        </div>
                      </div>
                      {counselor.key_strengths?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-green-800 mb-1">Key Strengths:</p>
                          <div className="flex flex-wrap gap-1">
                            {counselor.key_strengths.map((strength, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{strength}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact Correlations */}
            {analysis.impact_correlations && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Impact Correlations</h4>
                {analysis.impact_correlations.key_findings?.map((finding, i) => (
                  <div key={i} className="text-sm text-purple-800 mb-2">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {finding}
                  </div>
                ))}
              </div>
            )}

            {/* Success Factors */}
            {analysis.success_factors?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What Drives Success</h4>
                <ul className="space-y-1">
                  {analysis.success_factors.map((factor, i) => (
                    <li key={i} className="text-sm text-blue-800">→ {factor}</li>
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