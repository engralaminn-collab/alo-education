import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIEnrollmentPredictor({ application, student, university, allApplications }) {
  const [prediction, setPrediction] = useState(null);

  const generatePrediction = useMutation({
    mutationFn: async () => {
      // Calculate historical success rates
      const universityApps = allApplications.filter(a => a.university_id === application.university_id);
      const successRate = universityApps.length > 0
        ? (universityApps.filter(a => ['unconditional_offer', 'enrolled'].includes(a.status)).length / universityApps.length) * 100
        : 50;

      const context = `
Analyze this student application and predict enrollment likelihood:

Student Profile:
- GPA: ${student.education?.gpa || 'N/A'}/${student.education?.gpa_scale || 'N/A'}
- English Test: ${student.english_proficiency?.test_type || 'Not taken'} ${student.english_proficiency?.score || ''}
- Work Experience: ${student.work_experience_years || 0} years
- Profile Completeness: ${student.profile_completeness || 0}%

Application Details:
- Status: ${application.status}
- University: ${university?.university_name || university?.name}
- University Historical Success Rate: ${successRate.toFixed(0)}%
- Offer Type: ${application.offer_type || 'Not yet received'}
- Documents Submitted: ${application.milestones?.documents_submitted?.completed ? 'Yes' : 'No'}
- Application Submitted: ${application.milestones?.application_submitted?.completed ? 'Yes' : 'No'}

Based on:
1. Student academic profile
2. Application status and progress
3. Historical data from this university
4. Current milestones completion

Provide:
- Enrollment probability (0-100)
- Risk level (low/medium/high)
- 3-4 key factors affecting likelihood
- 3-4 recommended actions to improve chances`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        response_json_schema: {
          type: "object",
          properties: {
            probability: { type: "number" },
            risk_level: { type: "string" },
            key_factors: { type: "array", items: { type: "string" } },
            recommended_actions: { type: "array", items: { type: "string" } }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setPrediction(data);
      toast.success('Prediction generated');
    },
    onError: () => {
      toast.error('Failed to generate prediction');
    }
  });

  const riskColors = {
    low: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-amber-100 text-amber-700 border-amber-300',
    high: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-purple-600" />
          AI Enrollment Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!prediction ? (
          <div className="text-center py-6">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              Get AI-powered prediction for enrollment likelihood
            </p>
            <Button
              onClick={() => generatePrediction.mutate()}
              disabled={generatePrediction.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generatePrediction.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Prediction
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-purple-600">
                  {prediction.probability}%
                </span>
                {prediction.probability >= 70 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : prediction.probability >= 40 ? (
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
              <p className="text-sm text-slate-600 mb-3">Enrollment Likelihood</p>
              <Progress value={prediction.probability} className="h-2" />
              <Badge className={`${riskColors[prediction.risk_level]} mt-3`}>
                {prediction.risk_level} risk
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Key Factors
                </h4>
                <ul className="space-y-1">
                  {prediction.key_factors.map((factor, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Recommended Actions
                </h4>
                <ul className="space-y-1">
                  {prediction.recommended_actions.map((action, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              onClick={() => {
                setPrediction(null);
                generatePrediction.mutate();
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Prediction
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}