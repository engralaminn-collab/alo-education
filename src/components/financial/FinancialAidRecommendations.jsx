import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FinancialAidRecommendations({ studentId }) {
  const [analysis, setAnalysis] = useState(null);

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('recommendFinancialAid', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Financial aid recommendations generated');
    }
  });

  const eligibilityColors = {
    fully_eligible: 'bg-green-100 text-green-800',
    mostly_eligible: 'bg-blue-100 text-blue-800',
    partially_eligible: 'bg-yellow-100 text-yellow-800',
    improvement_needed: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            AI Financial Aid Finder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Get personalized scholarship recommendations and financial planning advice based on your profile.
          </p>

          <Button
            onClick={() => generateRecommendations.mutate()}
            disabled={generateRecommendations.isPending}
            className="bg-green-600 w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateRecommendations.isPending ? 'Analyzing...' : 'Find Scholarships & Aid'}
          </Button>

          {analysis && (
            <div className="space-y-6 mt-6">
              {/* Financial Planning Overview */}
              {analysis.financial_planning && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">Financial Planning Overview</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-green-700">Estimated Costs</p>
                      <p className="font-bold text-green-900">{analysis.financial_planning.total_estimated_costs}</p>
                    </div>
                    <div>
                      <p className="text-green-700">Scholarship Potential</p>
                      <p className="font-bold text-green-900">{analysis.financial_planning.scholarship_potential}</p>
                    </div>
                  </div>
                  {analysis.financial_planning.recommendations?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-800 mb-1">Recommendations:</p>
                      <ul className="space-y-1">
                        {analysis.financial_planning.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-green-700">→ {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Scholarships */}
              {analysis.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recommended Scholarships</h4>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold">{rec.scholarship_name}</h5>
                            <p className="text-xs text-slate-500 mt-1">
                              {rec.scholarship_details?.provider}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-600 mb-1">{rec.eligibility_score}%</Badge>
                            <Badge className={`${eligibilityColors[rec.eligibility_status]} block`}>
                              {rec.eligibility_status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-blue-700 font-medium">Priority</p>
                            <Badge variant="outline">{rec.application_priority}</Badge>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <p className="text-purple-700 font-medium">Award</p>
                            <p className="font-semibold text-purple-900">{rec.estimated_award_amount}</p>
                          </div>
                        </div>

                        {rec.match_reasons?.length > 0 && (
                          <div className="bg-green-50 p-2 rounded mb-2">
                            <p className="text-xs font-semibold text-green-900 mb-1">Why You Match:</p>
                            <ul className="space-y-1">
                              {rec.match_reasons.map((reason, j) => (
                                <li key={j} className="text-xs text-green-700 flex items-start gap-1">
                                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {rec.missing_requirements?.length > 0 && (
                          <div className="bg-orange-50 p-2 rounded">
                            <p className="text-xs font-semibold text-orange-900 mb-1">Requirements Needed:</p>
                            <ul className="space-y-1">
                              {rec.missing_requirements.map((req, j) => (
                                <li key={j} className="text-xs text-orange-700 flex items-start gap-1">
                                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Strategy */}
              {analysis.application_strategy && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Application Strategy
                  </h4>
                  
                  {analysis.application_strategy.immediate_actions?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Immediate Actions:</p>
                      <ul className="space-y-1">
                        {analysis.application_strategy.immediate_actions.map((action, i) => (
                          <li key={i} className="text-sm text-blue-700">✓ {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.application_strategy.success_tips?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-blue-800 mb-1">Success Tips:</p>
                      <ul className="space-y-1">
                        {analysis.application_strategy.success_tips.map((tip, i) => (
                          <li key={i} className="text-sm text-blue-700">💡 {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Eligibility Improvement Tips */}
              {analysis.improvement_tips?.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Improve Your Eligibility</h4>
                  <ul className="space-y-1">
                    {analysis.improvement_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-purple-800">→ {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative Funding */}
              {analysis.alternative_funding?.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Alternative Funding Options</h4>
                  <ul className="space-y-1">
                    {analysis.alternative_funding.map((option, i) => (
                      <li key={i} className="text-sm text-slate-700">• {option}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}