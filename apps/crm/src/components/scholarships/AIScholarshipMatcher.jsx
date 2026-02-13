import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, Award, TrendingUp, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AIScholarshipMatcher({ studentProfile }) {
  const [recommendations, setRecommendations] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: scholarships = [] } = useQuery({
    queryKey: ['all-scholarships'],
    queryFn: () => base44.entities.Scholarship.list(),
  });

  const analyzeScholarships = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);

      const studentContext = `
Student Profile:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Nationality: ${studentProfile.nationality}
- Preferred Countries: ${studentProfile.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${studentProfile.preferred_degree_level}
- Field of Study: ${studentProfile.preferred_fields?.join(', ') || 'Not specified'}
- GPA: ${studentProfile.education?.gpa || 'N/A'} / ${studentProfile.education?.gpa_scale || 4.0}
- English Test: ${studentProfile.english_proficiency?.test_type} ${studentProfile.english_proficiency?.score || ''}
- Work Experience: ${studentProfile.work_experience_years || 0} years
- Budget Max: ${studentProfile.budget_max || 'Not specified'}
`;

      const results = [];

      // Analyze each scholarship
      for (const scholarship of scholarships.filter(s => s.status === 'active').slice(0, 10)) {
        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze scholarship match for this student:

${studentContext}

Scholarship:
- Name: ${scholarship.scholarship_name}
- Country: ${scholarship.country}
- Type: ${scholarship.scholarship_type}
- Study Level: ${scholarship.study_level?.join(', ')}
- Amount: ${scholarship.amount} ${scholarship.currency} (${scholarship.amount_type})
- Eligibility: ${scholarship.eligibility_criteria || 'Not specified'}
- Deadline: ${scholarship.application_deadline || 'Not specified'}

Provide:
1. Match score (0-100) - how well does student match eligibility
2. Eligibility status (eligible/maybe_eligible/not_eligible)
3. Strengths (why student is a good fit - array of strings)
4. Weaknesses (what might hurt chances - array of strings)
5. Application tips (specific advice - array of strings)
6. Priority level (high/medium/low) - based on deadline and match quality

Be honest and specific.`,
          response_json_schema: {
            type: "object",
            properties: {
              match_score: { type: "number" },
              eligibility_status: { 
                type: "string",
                enum: ["eligible", "maybe_eligible", "not_eligible"]
              },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              application_tips: { type: "array", items: { type: "string" } },
              priority_level: { 
                type: "string",
                enum: ["high", "medium", "low"]
              }
            }
          }
        });

        if (analysis.match_score >= 50) {
          results.push({
            scholarship,
            analysis
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Sort by match score
      results.sort((a, b) => b.analysis.match_score - a.analysis.match_score);
      
      setRecommendations(results);
      setAnalyzing(false);
      return results;
    },
    onSuccess: (results) => {
      toast.success(`Found ${results.length} matching scholarships`);
    },
    onError: (error) => {
      toast.error('Analysis failed: ' + error.message);
      setAnalyzing(false);
    }
  });

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-slate-600';
  };

  const getEligibilityColor = (status) => {
    switch(status) {
      case 'eligible': return 'bg-green-100 text-green-700';
      case 'maybe_eligible': return 'bg-amber-100 text-amber-700';
      case 'not_eligible': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            AI Scholarship Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            AI analyzes your profile against all available scholarships to find the best matches and provides personalized application tips.
          </p>
          <Button
            onClick={() => analyzeScholarships.mutate()}
            disabled={analyzing}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing {scholarships.length} scholarships...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find My Best Scholarships
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Top {recommendations.length} Matches
          </h3>

          {recommendations.map(({ scholarship, analysis }, idx) => (
            <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {idx === 0 && (
                        <Badge className="bg-amber-500 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Top Match
                        </Badge>
                      )}
                      <Badge className={getEligibilityColor(analysis.eligibility_status)}>
                        {analysis.eligibility_status.replace(/_/g, ' ')}
                      </Badge>
                      {analysis.priority_level === 'high' && (
                        <Badge className="bg-red-100 text-red-700">Priority</Badge>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">
                      {scholarship.scholarship_name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {scholarship.country} • {scholarship.scholarship_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${getMatchColor(analysis.match_score)}`}>
                      {analysis.match_score}%
                    </p>
                    <p className="text-xs text-slate-500">Match Score</p>
                  </div>
                </div>

                <div className="mb-4">
                  <Progress value={analysis.match_score} className="h-2" />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-700">Award Amount</span>
                    </div>
                    <p className="font-bold text-emerald-600">
                      {scholarship.amount ? `${scholarship.currency} ${scholarship.amount.toLocaleString()}` : 'Varies'}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{scholarship.amount_type?.replace(/_/g, ' ')}</p>
                  </div>

                  {scholarship.application_deadline && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-slate-700">Deadline</span>
                      </div>
                      <p className="font-bold text-blue-600">
                        {new Date(scholarship.application_deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Your Strengths
                    </p>
                    <ul className="space-y-1">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {analysis.weaknesses?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Areas to Address
                    </p>
                    <ul className="space-y-1">
                      {analysis.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-amber-600">!</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Application Tips */}
                {analysis.application_tips?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      💡 Application Tips
                    </p>
                    <ul className="space-y-1">
                      {analysis.application_tips.map((tip, i) => (
                        <li key={i} className="text-sm text-blue-800">
                          {i + 1}. {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scholarship.application_link && (
                  <Button asChild variant="outline" className="w-full">
                    <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer">
                      View Scholarship Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}