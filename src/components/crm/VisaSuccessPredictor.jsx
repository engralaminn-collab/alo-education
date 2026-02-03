import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, Plane, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VisaSuccessPredictor({ student }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications', student.id],
    queryFn: () => base44.entities.Application.filter({ student_id: student.id }),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-visa'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-visa'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['all-applications-visa'],
    queryFn: () => base44.entities.Application.list('-created_date', 500),
  });

  const generatePredictions = useMutation({
    mutationFn: async () => {
      setLoading(true);

      // Get unique countries from student applications
      const appWithDetails = applications.map(app => {
        const uni = universities.find(u => u.id === app.university_id);
        const course = courses.find(c => c.id === app.course_id);
        return { app, uni, course };
      }).filter(item => item.uni && item.course);

      const countries = [...new Set(appWithDetails.map(item => item.uni.country))];

      // Calculate historical visa success by country
      const visaStats = {};
      for (const country of countries) {
        const countryApps = allApplications.filter(app => {
          const uni = universities.find(u => u.id === app.university_id);
          return uni?.country === country;
        });
        const visaApproved = countryApps.filter(app => 
          app.visa_status === 'approved' || app.status === 'enrolled'
        ).length;
        visaStats[country] = {
          total: countryApps.length,
          approved: visaApproved,
          rate: countryApps.length > 0 ? ((visaApproved / countryApps.length) * 100).toFixed(1) : 0
        };
      }

      const predictions = [];

      for (const { app, uni, course } of appWithDetails) {
        const prompt = `Predict visa success probability for this student application:

STUDENT PROFILE:
- Name: ${student.first_name} ${student.last_name}
- Nationality: ${student.nationality || 'Not specified'}
- Education: ${student.education?.highest_degree || 'Not specified'} in ${student.education?.field_of_study || 'Not specified'}
- GPA: ${student.education?.gpa || 'N/A'}/${student.education?.gpa_scale || 4.0}
- English Test: ${student.english_proficiency?.test_type || 'Not provided'} ${student.english_proficiency?.score || ''}
- Work Experience: ${student.work_experience_years || 0} years
- Budget: Up to ${student.budget_max || 'Not specified'}

APPLICATION DETAILS:
- Destination: ${uni.country}
- University: ${uni.university_name} (QS Ranking: ${uni.qs_ranking || 'N/A'})
- Course: ${course.course_title} (${course.level})
- Tuition: ${app.tuition_fee || course.tuition_fee_min || 'N/A'} ${course.currency || 'USD'}
- Application Status: ${app.status}

HISTORICAL DATA (${uni.country}):
- Total visa applications: ${visaStats[uni.country].total}
- Approved: ${visaStats[uni.country].approved}
- Historical success rate: ${visaStats[uni.country].rate}%

Analyze current geopolitical factors, visa policies, and recent changes for ${uni.country}.

Provide:
1. "success_probability": Percentage (0-100)
2. "confidence_level": How confident is this prediction? (low/medium/high)
3. "key_factors_positive": Array of 3-5 factors that increase success probability
4. "key_factors_negative": Array of 3-5 risk factors or concerns
5. "geopolitical_context": Current visa policy climate and recent changes
6. "financial_assessment": Is financial proof sufficient for this destination?
7. "profile_strength": Overall profile strength for this country (weak/moderate/strong/excellent)
8. "recommendations": Specific actions to improve visa success
9. "timeline_estimate": Expected visa processing timeline
10. "risk_level": Overall risk assessment (low/medium/high)`;

        const prediction = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              success_probability: { type: "number" },
              confidence_level: { type: "string" },
              key_factors_positive: { type: "array", items: { type: "string" } },
              key_factors_negative: { type: "array", items: { type: "string" } },
              geopolitical_context: { type: "string" },
              financial_assessment: { type: "string" },
              profile_strength: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } },
              timeline_estimate: { type: "string" },
              risk_level: { type: "string" }
            }
          }
        });

        predictions.push({
          country: uni.country,
          university: uni.university_name,
          course: course.course_title,
          ...prediction
        });
      }

      return predictions;
    },
    onSuccess: (data) => {
      setPredictions(data);
      setLoading(false);
      toast.success('Visa predictions generated!');
    },
    onError: () => {
      setLoading(false);
      toast.error('Prediction failed');
    }
  });

  const getProbabilityColor = (prob) => {
    if (prob >= 75) return 'text-green-600';
    if (prob >= 50) return 'text-blue-600';
    if (prob >= 30) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'low': return 'bg-green-600';
      case 'medium': return 'bg-amber-600';
      case 'high': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  const getProfileColor = (strength) => {
    switch(strength?.toLowerCase()) {
      case 'excellent': return 'bg-green-600';
      case 'strong': return 'bg-blue-600';
      case 'moderate': return 'bg-amber-600';
      default: return 'bg-red-600';
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-blue-900">
            <Plane className="w-6 h-6 text-blue-600" />
            Visa Success Prediction
          </span>
          <Button 
            onClick={() => generatePredictions.mutate()}
            disabled={loading || applications.length === 0}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Predict
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <Plane className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-blue-700">Student has no applications yet</p>
          </div>
        ) : !predictions ? (
          <div className="text-center py-8">
            <Plane className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-blue-700">
              Generate AI-powered visa success predictions based on profile, geopolitics, and historical data
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {predictions.map((pred, idx) => (
              <div key={idx} className="bg-white rounded-lg border-2 border-blue-200 p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900">{pred.university}</h4>
                    <p className="text-sm text-slate-600">{pred.course}</p>
                    <Badge className="mt-1 bg-slate-700">{pred.country}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600 mb-1">Visa Success Probability</p>
                    <p className={`text-4xl font-bold ${getProbabilityColor(pred.success_probability)}`}>
                      {pred.success_probability}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress value={pred.success_probability} className="h-3 mb-4" />

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600 mb-1">Risk Level</p>
                    <Badge className={getRiskColor(pred.risk_level)}>
                      {pred.risk_level}
                    </Badge>
                  </div>
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600 mb-1">Profile Strength</p>
                    <Badge className={getProfileColor(pred.profile_strength)}>
                      {pred.profile_strength}
                    </Badge>
                  </div>
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600 mb-1">Confidence</p>
                    <Badge className="bg-indigo-600">
                      {pred.confidence_level}
                    </Badge>
                  </div>
                </div>

                {/* Geopolitical Context */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 mb-3">
                  <h5 className="text-xs font-semibold text-purple-900 mb-2">Geopolitical Context</h5>
                  <p className="text-xs text-purple-800">{pred.geopolitical_context}</p>
                </div>

                {/* Financial Assessment */}
                <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200 mb-3">
                  <h5 className="text-xs font-semibold text-cyan-900 mb-2">Financial Assessment</h5>
                  <p className="text-xs text-cyan-800">{pred.financial_assessment}</p>
                </div>

                {/* Timeline */}
                <div className="bg-slate-50 rounded-lg p-3 border mb-3">
                  <h5 className="text-xs font-semibold text-slate-900 mb-1">Expected Processing Time</h5>
                  <p className="text-xs text-slate-700">{pred.timeline_estimate}</p>
                </div>

                {/* Positive Factors */}
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Positive Factors
                  </h5>
                  <div className="space-y-1">
                    {pred.key_factors_positive?.map((factor, i) => (
                      <div key={i} className="bg-green-50 rounded p-2 border border-green-200 text-xs text-green-800">
                        ✓ {factor}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                {pred.key_factors_negative?.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Risk Factors
                    </h5>
                    <div className="space-y-1">
                      {pred.key_factors_negative.map((factor, i) => (
                        <div key={i} className="bg-red-50 rounded p-2 border border-red-200 text-xs text-red-800">
                          ! {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-indigo-50 rounded-lg p-3 border-2 border-indigo-200">
                  <h5 className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Actions to Improve Success
                  </h5>
                  <div className="space-y-1">
                    {pred.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-indigo-800">
                        <span className="text-indigo-600 font-bold">{i + 1}.</span>
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Button 
              onClick={() => setPredictions(null)}
              variant="outline"
              className="w-full"
            >
              Generate New Predictions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}