import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, DollarSign, TrendingUp, FileText, Calendar, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function FinancialAidPredictor({ studentId }) {
  const [prediction, setPrediction] = useState(null);

  const predict = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('predictFinancialAid', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setPrediction(data.prediction);
      toast.success('Financial aid prediction complete');
    }
  });

  const eligibilityColors = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-red-500'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            AI Financial Aid Predictor
          </CardTitle>
          <Button
            size="sm"
            onClick={() => predict.mutate()}
            disabled={predict.isPending}
            className="bg-green-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {predict.isPending ? 'Predicting...' : 'Predict Aid Potential'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {prediction ? (
          <div className="space-y-4">
            {/* Probability Score */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-green-700">Financial Aid Probability</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-4xl font-bold text-green-900">{prediction.aid_probability}%</span>
                    <Badge className={eligibilityColors[prediction.eligibility_level]}>
                      {prediction.eligibility_level} eligibility
                    </Badge>
                  </div>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600" />
              </div>
              <Progress value={prediction.aid_probability} className="h-2" />
            </div>

            {/* Reasons */}
            {prediction.reasons?.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Why This Prediction
                </h4>
                <ul className="space-y-1">
                  {prediction.reasons.map((reason, i) => (
                    <li key={i} className="text-sm text-blue-800">• {reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Scholarship Types */}
            {prediction.recommended_scholarship_types?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recommended Scholarship Types</h4>
                <div className="flex flex-wrap gap-2">
                  {prediction.recommended_scholarship_types.map((type, i) => (
                    <Badge key={i} variant="outline">{type}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Planning Suggestions */}
            {prediction.financial_planning_suggestions?.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Financial Planning Suggestions</h4>
                <ul className="space-y-1">
                  {prediction.financial_planning_suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-purple-800">→ {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Documents */}
            {prediction.required_documents?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents Needed
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {prediction.required_documents.map((doc, i) => (
                    <div key={i} className="text-sm p-2 bg-slate-50 rounded border">
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {prediction.application_timeline && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Application Timeline
                </h4>
                <p className="text-sm text-orange-800">{prediction.application_timeline}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Click "Predict Aid Potential" to analyze financial aid opportunities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}