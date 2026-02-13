import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Lightbulb, TrendingUp, DollarSign, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ScenarioAnalysis() {
  const [scenario, setScenario] = useState({
    type: 'marketing_increase',
    parameters: { region: '', percentage: 20 }
  });
  const [analysis, setAnalysis] = useState(null);

  const analyzeScenario = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('scenarioAnalysis', {
        scenario_type: scenario.type,
        parameters: scenario.parameters
      });
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Scenario analysis complete');
    }
  });

  const scenarioTemplates = [
    { value: 'marketing_increase', label: 'Increase Marketing Budget', params: ['region', 'percentage'] },
    { value: 'add_counselors', label: 'Add More Counselors', params: ['count', 'specialization'] },
    { value: 'reduce_fees', label: 'Reduce Tuition Fees', params: ['percentage', 'target_programs'] },
    { value: 'improve_response', label: 'Improve Response Time', params: ['hours_reduction', 'target_sla'] },
    { value: 'new_course', label: 'Launch New Course', params: ['field', 'target_students'] }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          What-If Scenario Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Model different scenarios and predict their impact on enrollment and success rates.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Scenario Type</label>
            <select
              value={scenario.type}
              onChange={(e) => setScenario({ ...scenario, type: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              {scenarioTemplates.map(template => (
                <option key={template.value} value={template.value}>{template.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Parameter 1"
              onChange={(e) => setScenario({
                ...scenario,
                parameters: { ...scenario.parameters, param1: e.target.value }
              })}
            />
            <Input
              placeholder="Parameter 2"
              onChange={(e) => setScenario({
                ...scenario,
                parameters: { ...scenario.parameters, param2: e.target.value }
              })}
            />
          </div>
        </div>

        <Button
          onClick={() => analyzeScenario.mutate()}
          disabled={analyzeScenario.isPending}
          className="bg-purple-600 w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {analyzeScenario.isPending ? 'Analyzing...' : 'Run Scenario Analysis'}
        </Button>

        {analysis?.scenario_analysis && (
          <div className="space-y-4 mt-6">
            {/* Baseline Metrics */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Current Baseline</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-600">Students</p>
                  <p className="font-bold">{analysis.baseline_metrics.total_students}</p>
                </div>
                <div>
                  <p className="text-slate-600">Conversion</p>
                  <p className="font-bold">{analysis.baseline_metrics.conversion_rate}%</p>
                </div>
                <div>
                  <p className="text-slate-600">Success</p>
                  <p className="font-bold">{analysis.baseline_metrics.success_rate}%</p>
                </div>
              </div>
            </div>

            {/* Predicted Outcomes */}
            {analysis.scenario_analysis.predicted_outcomes && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3">Predicted Impact</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-slate-600">Inquiries</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {analysis.scenario_analysis.predicted_outcomes.inquiry_change_percentage > 0 ? '+' : ''}
                      {analysis.scenario_analysis.predicted_outcomes.inquiry_change_percentage}%
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="text-xs text-slate-600">Applications</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {analysis.scenario_analysis.predicted_outcomes.application_change_percentage > 0 ? '+' : ''}
                      {analysis.scenario_analysis.predicted_outcomes.application_change_percentage}%
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-slate-600">Enrollments</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {analysis.scenario_analysis.predicted_outcomes.enrollment_change_percentage > 0 ? '+' : ''}
                      {analysis.scenario_analysis.predicted_outcomes.enrollment_change_percentage}%
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-slate-600 mb-1">New Monthly Avg</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {analysis.scenario_analysis.predicted_outcomes.new_monthly_enrollment_avg}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <Badge>{analysis.scenario_analysis.confidence_level} confidence</Badge>
                </div>
              </div>
            )}

            {/* Timeline */}
            {analysis.scenario_analysis.timeline && (
              <div>
                <h4 className="font-semibold mb-2">Impact Timeline</h4>
                <div className="space-y-2">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs font-semibold text-blue-900">Months 1-3:</p>
                    <p className="text-sm text-blue-800">{analysis.scenario_analysis.timeline.short_term_months_1_3}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-xs font-semibold text-green-900">Months 4-6:</p>
                    <p className="text-sm text-green-800">{analysis.scenario_analysis.timeline.medium_term_months_4_6}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-xs font-semibold text-purple-900">Months 7-12:</p>
                    <p className="text-sm text-purple-800">{analysis.scenario_analysis.timeline.long_term_months_7_12}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ROI Estimate */}
            {analysis.scenario_analysis.roi_estimate && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">ROI Estimate</h4>
                <p className="text-sm text-green-800">{analysis.scenario_analysis.roi_estimate}</p>
              </div>
            )}

            {/* Recommendations */}
            {analysis.scenario_analysis.recommendations?.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {analysis.scenario_analysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-indigo-800">→ {rec}</li>
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