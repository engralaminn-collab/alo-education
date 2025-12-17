import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, TrendingUp, Award, AlertCircle, 
  Sparkles, CheckCircle2, Lightbulb
} from 'lucide-react';
import { toast } from "sonner";

export default function AIAdmissionPredictor({ studentProfile }) {
  const [prediction, setPrediction] = useState(null);

  const { data: applications = [] } = useQuery({
    queryKey: ['apps-predictor', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const predictMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this student profile and predict admission success:

Profile Completeness: ${studentProfile?.profile_completeness || 0}%
Education: ${studentProfile?.education_history?.map(e => `${e.academic_level}: ${e.result_value}`).join(', ') || 'Not provided'}
English: ${studentProfile?.english_proficiency?.test_type || 'Not tested'} - ${studentProfile?.english_proficiency?.overall_score || 'N/A'}
Work Experience: ${studentProfile?.work_experience?.length || 0} positions
Applications: ${applications.length} total, Status: ${applications.map(a => a.status).join(', ')}

Provide:
1. Overall admission success probability (0-100)
2. Strength areas (3-4 items)
3. Areas for improvement (3-4 items)
4. Personalized recommendations (3-4 actionable tips)
5. Scholarship opportunities match (high/medium/low)`,
        response_json_schema: {
          type: "object",
          properties: {
            success_probability: { type: "number" },
            confidence_level: { type: "string" },
            strength_areas: {
              type: "array",
              items: { type: "string" }
            },
            improvement_areas: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            scholarship_match: { type: "string" },
            next_actions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setPrediction(data);
      toast.success('Admission prediction complete!');
    },
  });

  const probabilityColor = (prob) => {
    if (prob >= 75) return 'text-emerald-600';
    if (prob >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const matchColors = {
    high: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-700',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            AI Admission Success Predictor
          </CardTitle>
          <Button
            size="sm"
            onClick={() => predictMutation.mutate()}
            disabled={predictMutation.isPending}
          >
            {predictMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Predict
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!prediction ? (
          <div className="text-center py-8 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click "Predict" to analyze your admission chances</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Probability */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg text-center">
              <div className={`text-5xl font-bold mb-2 ${probabilityColor(prediction.success_probability)}`}>
                {prediction.success_probability}%
              </div>
              <p className="text-slate-700 font-medium mb-1">Admission Success Probability</p>
              <Badge variant="outline">{prediction.confidence_level} confidence</Badge>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Your Profile Strength</span>
                <span className="font-medium">{prediction.success_probability}%</span>
              </div>
              <Progress value={prediction.success_probability} className="h-3" />
            </div>

            {/* Scholarship Match */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-slate-900">Scholarship Match</span>
              </div>
              <Badge className={matchColors[prediction.scholarship_match]}>
                {prediction.scholarship_match.toUpperCase()}
              </Badge>
            </div>

            {/* Strengths */}
            {prediction.strength_areas?.length > 0 && (
              <div>
                <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Your Strengths
                </h4>
                <ul className="space-y-2">
                  {prediction.strength_areas.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {prediction.improvement_areas?.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {prediction.improvement_areas.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {prediction.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Personalized Recommendations
                </h4>
                <ul className="space-y-2">
                  {prediction.recommendations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-blue-50 p-3 rounded-lg">
                      <span className="font-bold text-blue-600">{idx + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Actions */}
            {prediction.next_actions?.length > 0 && (
              <div className="bg-slate-900 text-white p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Next Actions</h4>
                <ul className="space-y-2">
                  {prediction.next_actions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span>✓</span>
                      {item}
                    </li>
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