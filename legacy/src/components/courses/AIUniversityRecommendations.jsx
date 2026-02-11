import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Brain, Sparkles, TrendingUp, Award, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIUniversityRecommendations({ 
  studentProfile, 
  searchCriteria, 
  courses,
  universities 
}) {
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      // Build context for AI
      const context = {
        student: {
          education: studentProfile?.education_history || [],
          preferences: {
            countries: studentProfile?.preferred_countries || [],
            degree_level: studentProfile?.preferred_degree_level,
            fields: studentProfile?.preferred_fields || [],
            budget: studentProfile?.budget_max,
          },
          english_proficiency: studentProfile?.english_proficiency,
          work_experience_years: studentProfile?.work_experience_years || 0,
        },
        search: {
          country: searchCriteria.country,
          subject: searchCriteria.subject,
          level: searchCriteria.level,
          tuition_max: searchCriteria.tuition_max,
          duration: searchCriteria.duration,
        },
        available_universities: universities.slice(0, 20).map(u => ({
          id: u.id,
          name: u.university_name,
          country: u.country,
          ranking: u.ranking || u.qs_ranking,
          acceptance_rate: u.acceptance_rate,
          tuition_range: `${u.city || ''}`,
          faculty_ratio: u.faculty_student_ratio,
          employability: u.graduate_employability_rate,
          research_score: u.research_output_score,
        })),
        available_courses: courses.slice(0, 30).map(c => ({
          id: c.id,
          title: c.course_title,
          university_id: c.university_id,
          level: c.level,
          tuition_min: c.tuition_fee_min,
          tuition_max: c.tuition_fee_max,
          duration: c.duration,
        })),
      };

      const prompt = `As an expert study abroad advisor, analyze the student profile and recommend the TOP 5 universities from the available options.

STUDENT PROFILE:
- Education: ${JSON.stringify(context.student.education)}
- Preferred countries: ${context.student.preferences.countries.join(', ')}
- Target degree: ${context.student.preferences.degree_level}
- Interested fields: ${context.student.preferences.fields.join(', ')}
- Budget: $${context.student.preferences.budget}/year
- English test: ${context.student.english_proficiency?.test_type || 'Not taken'} ${context.student.english_proficiency?.overall_score || ''}
- Work experience: ${context.student.work_experience_years} years

SEARCH CRITERIA:
- Country: ${context.search.country || 'Any'}
- Subject: ${context.search.subject || 'Any'}
- Level: ${context.search.level || 'Any'}
- Max tuition: $${context.search.tuition_max || 'No limit'}
- Duration: ${context.search.duration || 'Any'}

AVAILABLE OPTIONS:
Universities: ${context.available_universities.map(u => u.name).join(', ')}

Analyze and recommend the TOP 5 best-matching universities with detailed reasoning. For each recommendation, provide:
1. Match score (1-100)
2. Key strengths (3-4 points)
3. Why this university matches the student's profile (2-3 sentences)
4. Potential concerns or considerations (if any)

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "university_id": "id from available universities",
      "university_name": "name",
      "match_score": 85,
      "key_strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "why_match": "Detailed explanation of why this is a good match...",
      "considerations": "Any concerns or things to consider..."
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  university_id: { type: "string" },
                  university_name: { type: "string" },
                  match_score: { type: "number" },
                  key_strengths: { type: "array", items: { type: "string" } },
                  why_match: { type: "string" },
                  considerations: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.recommendations || [];
    },
    onSuccess: (data) => {
      setRecommendations(data);
    },
  });

  if (!studentProfile) {
    return (
      <Card className="border-l-4 border-l-education-blue bg-gradient-to-r from-blue-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-education-blue mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">Get AI-Powered Recommendations</h3>
              <p className="text-sm text-slate-600 mb-4">
                Complete your profile to receive personalized university recommendations based on your background and preferences.
              </p>
              <Link to={createPageUrl('CompleteProfile')}>
                <Button size="sm" className="bg-gradient-brand">
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!recommendations && (
        <Card className="border-l-4 border-l-alo-orange bg-gradient-to-r from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-alo-orange mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">AI-Powered University Match</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Get personalized recommendations based on your profile, preferences, and search criteria.
                </p>
                <Button 
                  onClick={() => generateRecommendations.mutate()}
                  disabled={generateRecommendations.isPending}
                  className="bg-gradient-brand"
                  size="sm"
                >
                  {generateRecommendations.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Get AI Recommendations
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-alo-orange" />
            <h3 className="text-lg font-bold text-slate-900">Top Matches For You</h3>
          </div>

          {recommendations.map((rec, index) => {
            const university = universities.find(u => u.id === rec.university_id);
            if (!university) return null;

            return (
              <Card key={rec.university_id} className="hover:shadow-lg transition-shadow border-l-4 border-l-education-blue">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shrink-0">
                      #{index + 1}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link to={createPageUrl('UniversityDetails') + `?id=${university.id}`}>
                            <h4 className="text-xl font-bold text-slate-900 hover:text-education-blue transition-colors">
                              {university.university_name}
                            </h4>
                          </Link>
                          <p className="text-sm text-slate-600">{university.country}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-2xl font-bold text-green-600">{rec.match_score}%</span>
                          </div>
                          <span className="text-xs text-slate-500">Match Score</span>
                        </div>
                      </div>

                      {/* Key Strengths */}
                      <div>
                        <h5 className="text-xs font-semibold text-slate-700 uppercase mb-2 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Key Strengths
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {rec.key_strengths?.map((strength, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Why This Match */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-xs font-semibold text-education-blue uppercase mb-2 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          Why This University?
                        </h5>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {rec.why_match}
                        </p>
                      </div>

                      {/* Considerations */}
                      {rec.considerations && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <h5 className="text-xs font-semibold text-amber-700 uppercase mb-1">
                            Things to Consider
                          </h5>
                          <p className="text-xs text-slate-600">
                            {rec.considerations}
                          </p>
                        </div>
                      )}

                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 pt-2 text-sm">
                        {university.ranking && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Rank:</span>
                            <span className="font-semibold">#{university.ranking}</span>
                          </div>
                        )}
                        {university.acceptance_rate && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Acceptance:</span>
                            <span className="font-semibold">{university.acceptance_rate}%</span>
                          </div>
                        )}
                        {university.graduate_employability_rate && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Employability:</span>
                            <span className="font-semibold">{university.graduate_employability_rate}%</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Link to={createPageUrl('UniversityDetails') + `?id=${university.id}`}>
                          <Button size="sm" className="bg-gradient-brand">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <Link to={createPageUrl('Contact')}>
                          <Button size="sm" variant="outline">
                            Get Expert Help
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="text-center pt-4">
            <Button 
              variant="outline"
              onClick={() => generateRecommendations.mutate()}
              disabled={generateRecommendations.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Recommendations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}