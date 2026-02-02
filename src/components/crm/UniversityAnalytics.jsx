import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, TrendingUp, TrendingDown, Target, Users, 
  Award, AlertCircle, CheckCircle, Loader2, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export default function UniversityAnalytics({ university }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: applications = [] } = useQuery({
    queryKey: ['uni-applications', university.id],
    queryFn: () => base44.entities.Application.filter({ university_id: university.id }),
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['all-applications-analytics'],
    queryFn: () => base44.entities.Application.list('-created_date', 500),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-analytics'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials-analytics'],
    queryFn: () => base44.entities.Testimonial.list(),
  });

  const generateAnalytics = async () => {
    setLoading(true);
    
    try {
      const uniApplications = applications;
      const acceptedApps = uniApplications.filter(a => 
        a.status === 'unconditional_offer' || a.status === 'conditional_offer'
      );
      const rejectedApps = uniApplications.filter(a => a.status === 'rejected');
      const enrolledApps = uniApplications.filter(a => a.status === 'enrolled');
      const visaApprovedApps = uniApplications.filter(a => 
        a.visa_status === 'approved' || a.status === 'enrolled'
      );

      const uniTestimonials = testimonials.filter(t => t.university === university.university_name);

      const prompt = `Analyze this university's performance data and provide insights:

University: ${university.university_name}
Country: ${university.country}
Ranking: ${university.qs_ranking || university.ranking || 'Not specified'}

Performance Data:
- Total Applications: ${uniApplications.length}
- Accepted (Offers): ${acceptedApps.length}
- Rejected: ${rejectedApps.length}
- Enrolled: ${enrolledApps.length}
- Visa Approved: ${visaApprovedApps.length}
- Student Testimonials: ${uniTestimonials.length}
- Average Rating: ${uniTestimonials.length > 0 ? (uniTestimonials.reduce((sum, t) => sum + t.rating, 0) / uniTestimonials.length).toFixed(1) : 'N/A'}

Provide:
1. "acceptance_rate_trend": Based on data, is acceptance trending up/down/stable and why?
2. "visa_success_rate": Calculate and explain visa success for this university
3. "competitiveness_score": Rate 1-10 how competitive this university is
4. "student_success_probability": For an average student profile, what's the success probability (percentage)?
5. "strengths": Array of 3-5 university strengths based on data
6. "concerns": Array of 2-4 potential concerns or challenges
7. "recommendations": 3-5 actionable recommendations for counselors when recommending this university
8. "ideal_student_profile": Describe the ideal student for this university
9. "processing_time_estimate": Estimated application processing time
10. "comparative_insights": How does this compare to similar universities?`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            acceptance_rate_trend: { type: "string" },
            visa_success_rate: { type: "string" },
            competitiveness_score: { type: "number" },
            student_success_probability: { type: "number" },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            concerns: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            ideal_student_profile: { type: "string" },
            processing_time_estimate: { type: "string" },
            comparative_insights: { type: "string" }
          }
        }
      });

      // Calculate actual metrics
      const acceptanceRate = uniApplications.length > 0 
        ? ((acceptedApps.length / uniApplications.length) * 100).toFixed(1)
        : 'N/A';
      
      const visaSuccessRate = visaApprovedApps.length > 0
        ? ((visaApprovedApps.length / enrolledApps.length) * 100).toFixed(1)
        : 'N/A';

      setAnalytics({
        ...response,
        calculated_acceptance_rate: acceptanceRate,
        calculated_visa_success: visaSuccessRate,
        total_applications: uniApplications.length,
        total_enrolled: enrolledApps.length
      });

      toast.success('Analytics generated!');
    } catch (error) {
      toast.error('Failed to generate analytics');
    }
    
    setLoading(false);
  };

  const getCompetitivenessColor = (score) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    if (score >= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-purple-900">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            AI University Analytics
          </span>
          <Button 
            onClick={generateAnalytics}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analytics ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <p className="text-sm text-purple-700">
              Generate AI-powered insights and predictions for {university.university_name}
            </p>
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Key Metrics */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Competitiveness</p>
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className={`text-3xl font-bold ${getCompetitivenessColor(analytics.competitiveness_score)}`}>
                    {analytics.competitiveness_score}/10
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {analytics.competitiveness_score >= 7 ? 'Highly Competitive' : 
                     analytics.competitiveness_score >= 5 ? 'Moderately Competitive' : 
                     'Less Competitive'}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Success Probability</p>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics.student_success_probability}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">For average student</p>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Acceptance Rate</p>
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.calculated_acceptance_rate}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {acceptedApps.length} of {analytics.total_applications} applications
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600">Visa Success</p>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">
                    {analytics.calculated_visa_success}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Visa approval rate</p>
                </div>
              </div>

              {/* Trends */}
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Acceptance Trend
                </h4>
                <p className="text-sm text-slate-700">{analytics.acceptance_rate_trend}</p>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-slate-900 mb-2">Visa Success Analysis</h4>
                <p className="text-sm text-slate-700">{analytics.visa_success_rate}</p>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-slate-900 mb-2">Processing Time</h4>
                <p className="text-sm text-slate-700">{analytics.processing_time_estimate}</p>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-4">
              {/* Strengths */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {analytics.strengths?.map((strength, idx) => (
                    <div key={idx} className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-sm text-green-800 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {strength}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              {analytics.concerns?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Challenges & Concerns
                  </h4>
                  <div className="space-y-2">
                    {analytics.concerns.map((concern, idx) => (
                      <div key={idx} className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <p className="text-sm text-amber-800 flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">!</span>
                          {concern}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ideal Student Profile */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ideal Student Profile
                </h4>
                <p className="text-sm text-blue-800">{analytics.ideal_student_profile}</p>
              </div>

              {/* Comparative Insights */}
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Comparative Analysis
                </h4>
                <p className="text-sm text-slate-700">{analytics.comparative_insights}</p>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4 mt-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Recommendations for Counselors
                </h4>
                <p className="text-xs text-purple-700">
                  Best practices when recommending {university.university_name}
                </p>
              </div>

              <div className="space-y-2">
                {analytics.recommendations?.map((rec, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-700 flex-1">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}