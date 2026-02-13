import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, Target, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIRecommendations({ profile, courses, universities }) {
  const [recommendations, setRecommendations] = useState(null);

  const recommendMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert international education counselor. Analyze this student profile and recommend the top 5 most suitable courses from the provided list.

Student Profile:
- Education: ${profileData.highest_degree} in ${profileData.field_of_study}
- GPA: ${profileData.gpa}/${profileData.gpa_scale}
- English: ${profileData.english_test} - ${profileData.english_score}
- Preferred Countries: ${profileData.preferred_countries.join(', ')}
- Preferred Degree: ${profileData.preferred_degree}
- Fields of Interest: ${profileData.preferred_fields.join(', ')}
- Budget: $${profileData.budget_max} USD/year
- Career Aspirations: ${profileData.career_goals || 'Not specified'}

Available Courses:
${courses.slice(0, 50).map((c, i) => `${i + 1}. ${c.course_title} at ${universities.find(u => u.id === c.university_id)?.university_name || 'Unknown'} - ${c.country} - ${c.level} - ${c.subject_area} - Tuition: $${c.tuition_fee_min || 'N/A'}`).join('\n')}

Provide detailed recommendations with:
1. Match score (0-100)
2. Why this course fits the student
3. Career prospects
4. Unique advantages
5. Potential challenges`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_id: { type: "string" },
                  match_score: { type: "number" },
                  fit_reason: { type: "string" },
                  career_prospects: { type: "string" },
                  unique_advantages: { type: "array", items: { type: "string" } },
                  potential_challenges: { type: "array", items: { type: "string" } }
                }
              }
            },
            overall_insights: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setRecommendations(data);
    }
  });

  const handleGetRecommendations = () => {
    recommendMutation.mutate(profile);
  };

  if (!recommendations && !recommendMutation.isPending) {
    return (
      <Card className="border-2 border-dashed border-alo-orange/30 bg-gradient-brand-light">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-alo-orange/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-alo-orange" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">AI-Powered Recommendations</h3>
          <p className="text-slate-600 mb-6">
            Get personalized course recommendations powered by advanced AI, tailored to your profile and career goals.
          </p>
          <Button 
            onClick={handleGetRecommendations}
            className="bg-alo-orange hover:bg-alo-orange/90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get AI Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (recommendMutation.isPending) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-alo-orange mx-auto mb-4" />
          <p className="text-slate-600">Analyzing your profile and generating recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Insights */}
      {recommendations?.overall_insights && (
        <Card className="border-l-4 border-l-education-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-education-blue" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{recommendations.overall_insights}</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations?.recommendations?.map((rec, index) => {
          const course = courses.find(c => c.id === rec.course_id);
          const university = universities.find(u => u.id === course?.university_id);

          if (!course) return null;

          return (
            <motion.div
              key={rec.course_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Match Score */}
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-education-blue to-alo-orange flex flex-col items-center justify-center text-white">
                      <div className="text-2xl font-bold">{rec.match_score}</div>
                      <div className="text-xs">Match</div>
                    </div>

                    <div className="flex-1">
                      {/* Course Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-education-blue/10 text-education-blue">
                              #{index + 1} Recommended
                            </Badge>
                            <Badge variant="outline">{course.level}</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">{course.course_title}</h3>
                          {university && (
                            <p className="text-slate-600">{university.university_name} • {university.country}</p>
                          )}
                        </div>
                      </div>

                      {/* Why it fits */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">Why This Course?</h4>
                        <p className="text-sm text-slate-700">{rec.fit_reason}</p>
                      </div>

                      {/* Career Prospects */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-education-blue" />
                          Career Prospects
                        </h4>
                        <p className="text-sm text-slate-700">{rec.career_prospects}</p>
                      </div>

                      {/* Advantages */}
                      {rec.unique_advantages?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1">
                            <Award className="w-4 h-4 text-sunshine" />
                            Unique Advantages
                          </h4>
                          <ul className="space-y-1">
                            {rec.unique_advantages.map((adv, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                {adv}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}