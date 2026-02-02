import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, TrendingDown, Trophy, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function UniversityRankingInsights({ university }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: applications = [] } = useQuery({
    queryKey: ['ranking-applications', university.id],
    queryFn: () => base44.entities.Application.filter({ university_id: university.id }),
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['ranking-testimonials'],
    queryFn: () => base44.entities.Testimonial.list(),
  });

  const generateInsights = async () => {
    setLoading(true);
    
    try {
      const uniTestimonials = testimonials.filter(t => t.university === university.university_name);
      const avgRating = uniTestimonials.length > 0 
        ? (uniTestimonials.reduce((sum, t) => sum + t.rating, 0) / uniTestimonials.length).toFixed(1)
        : 0;

      const enrolledStudents = applications.filter(a => a.status === 'enrolled');
      const successRate = applications.length > 0 
        ? ((enrolledStudents.length / applications.length) * 100).toFixed(1)
        : 0;

      const prompt = `Analyze this university's ranking and reputation data:

University: ${university.university_name}
Country: ${university.country}
QS Ranking: ${university.qs_ranking || 'N/A'}
Times Ranking: ${university.times_ranking || 'N/A'}
Overall Ranking: ${university.ranking || 'N/A'}
Acceptance Rate: ${university.acceptance_rate || 'N/A'}%

Student Performance Data:
- Total Applications: ${applications.length}
- Enrollment Success Rate: ${successRate}%
- Student Testimonials: ${uniTestimonials.length}
- Average Student Rating: ${avgRating}/5

Provide:
1. "ranking_trend": Analyze if rankings are improving/declining/stable (based on multiple ranking systems)
2. "ranking_vs_success": How do rankings correlate with student success at this university?
3. "reputation_score": Rate overall reputation 1-100 based on rankings + student feedback
4. "peer_comparison": Compare to 3-5 similar universities (name, ranking, why similar)
5. "strengths": What makes this university stand out?
6. "concerns": Any reputation or ranking concerns?
7. "recommendations": Should counselors recommend this university? For which students?
8. "future_outlook": Prediction for ranking trend in next 1-2 years`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            ranking_trend: { type: "string" },
            ranking_vs_success: { type: "string" },
            reputation_score: { type: "number" },
            peer_comparison: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  ranking: { type: "string" },
                  similarity: { type: "string" }
                }
              }
            },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            concerns: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: { type: "string" },
            future_outlook: { type: "string" }
          }
        }
      });

      setInsights(response);
      toast.success('Ranking insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights');
    }
    
    setLoading(false);
  };

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-amber-900">
            <Trophy className="w-6 h-6 text-amber-600" />
            Ranking & Reputation Analysis
          </span>
          <Button 
            onClick={generateInsights}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-amber-600 to-orange-600"
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
        {!insights ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <p className="text-sm text-amber-700">
              Generate AI-powered ranking analysis and reputation insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Reputation Score */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 border-2 border-purple-300 text-center">
              <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 mb-2">Overall Reputation Score</p>
              <p className="text-5xl font-bold text-purple-900">{insights.reputation_score}</p>
              <p className="text-xs text-purple-600 mt-1">out of 100</p>
            </div>

            {/* Ranking Trend */}
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Ranking Trend Analysis
                </h4>
                <p className="text-sm text-slate-700">{insights.ranking_trend}</p>
              </CardContent>
            </Card>

            {/* Ranking vs Success */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  Rankings vs Student Success
                </h4>
                <p className="text-sm text-slate-700">{insights.ranking_vs_success}</p>
              </CardContent>
            </Card>

            {/* Peer Comparison */}
            {insights.peer_comparison?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Peer Institutions</h4>
                <div className="space-y-2">
                  {insights.peer_comparison.map((peer, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm text-slate-900">{peer.name}</p>
                        <Badge variant="outline">{peer.ranking}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{peer.similarity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-600" />
                Key Strengths
              </h4>
              <div className="space-y-2">
                {insights.strengths?.map((strength, idx) => (
                  <div key={idx} className="bg-green-50 rounded-lg p-3 border border-green-200 text-sm text-green-800">
                    ✓ {strength}
                  </div>
                ))}
              </div>
            </div>

            {/* Concerns */}
            {insights.concerns?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Concerns
                </h4>
                <div className="space-y-2">
                  {insights.concerns.map((concern, idx) => (
                    <div key={idx} className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-sm text-amber-800">
                      ! {concern}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <Card className="border-2 border-indigo-200 bg-indigo-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">Counselor Recommendations</h4>
                <p className="text-sm text-indigo-800">{insights.recommendations}</p>
              </CardContent>
            </Card>

            {/* Future Outlook */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Future Outlook</h4>
                <p className="text-sm text-purple-800">{insights.future_outlook}</p>
              </CardContent>
            </Card>

            <Button 
              onClick={() => setInsights(null)}
              variant="outline"
              className="w-full"
            >
              Generate New Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}