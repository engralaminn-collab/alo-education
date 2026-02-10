import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Brain, Sparkles, CheckCircle, ArrowRight, Loader2, Award, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AICourseRecommendations({ 
  studentProfile, 
  searchCriteria,
  courses,
  universities,
  onApply
}) {
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const universityMap = universities.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
      
      const prompt = `As a study abroad advisor, recommend TOP 5 courses for this student:

STUDENT PROFILE:
- Education: ${JSON.stringify(studentProfile?.education_history?.slice(0, 2))}
- Preferred degree: ${studentProfile?.preferred_degree_level}
- Fields: ${studentProfile?.preferred_fields?.join(', ')}
- Countries: ${studentProfile?.preferred_countries?.join(', ')}
- Budget: $${studentProfile?.budget_max}/year
- English: ${studentProfile?.english_proficiency?.test_type} ${studentProfile?.english_proficiency?.overall_score}

SEARCH FILTERS:
- Subject: ${searchCriteria.subject || 'Any'}
- Level: ${searchCriteria.level || 'Any'}
- Country: ${searchCriteria.country || 'Any'}
- Max Tuition: $${searchCriteria.tuition_max}

AVAILABLE COURSES (top 30):
${courses.slice(0, 30).map(c => `${c.course_title} at ${universityMap[c.university_id]?.university_name} (${c.level}, $${c.tuition_fee_min})`).join('\n')}

Return TOP 5 courses with match explanation in JSON:
{
  "recommendations": [
    {
      "course_id": "from available courses",
      "match_score": 85,
      "why_match": "2-3 sentences explaining why this course matches student's background and goals",
      "key_highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
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
                  why_match: { type: "string" },
                  key_highlights: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      return response.recommendations || [];
    },
    onSuccess: (data) => setRecommendations(data),
  });

  if (!studentProfile) return null;

  const universityMap = universities.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

  return (
    <div className="mb-8">
      {!recommendations ? (
        <Card className="border-l-4 border-l-alo-orange bg-gradient-to-r from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-alo-orange mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Get AI Course Recommendations</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Discover courses tailored to your profile and preferences
                </p>
                <Button 
                  onClick={() => generateRecommendations.mutate()}
                  disabled={generateRecommendations.isPending}
                  size="sm"
                  className="bg-gradient-brand"
                >
                  {generateRecommendations.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><Brain className="w-4 h-4 mr-2" />Get Recommendations</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-alo-orange" />
              <h3 className="text-lg font-bold text-slate-900">Your Top Course Matches</h3>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => generateRecommendations.mutate()}
              disabled={generateRecommendations.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {recommendations.map((rec, idx) => {
            const course = courses.find(c => c.id === rec.course_id);
            if (!course) return null;
            
            const university = universityMap[course.university_id];

            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-education-blue">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold shrink-0">
                      #{idx + 1}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-education-blue/10 text-education-blue">{course.level}</Badge>
                            <Badge variant="outline">{course.subject_area}</Badge>
                            {course.scholarship_available && (
                              <Badge className="bg-sunshine text-white">
                                <Award className="w-3 h-3 mr-1" />
                                Scholarship
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-xl font-bold text-slate-900">{course.course_title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{university?.university_name} • {university?.country}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{rec.match_score}%</div>
                          <span className="text-xs text-slate-500">Match</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-xs font-semibold text-education-blue uppercase mb-2 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          Why This Course?
                        </h5>
                        <p className="text-sm text-slate-700 leading-relaxed">{rec.why_match}</p>
                      </div>

                      {rec.key_highlights && (
                        <div className="flex flex-wrap gap-2">
                          {rec.key_highlights.map((highlight, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        {course.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duration}
                          </span>
                        )}
                        {course.tuition_fee_min && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${course.tuition_fee_min.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-brand"
                          onClick={() => onApply?.(course, university)}
                        >
                          Apply Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}