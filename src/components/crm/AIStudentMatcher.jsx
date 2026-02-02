import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Building2, GraduationCap, DollarSign, MapPin, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AIStudentMatcher({ student }) {
  const [matches, setMatches] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-matcher'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-matcher'],
    queryFn: () => base44.entities.Course.list(),
  });

  const generateMatches = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      
      const prompt = `You are an expert study abroad consultant. Analyze this student profile and find the best matching universities and courses.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Academic Background: ${student.education?.highest_degree || 'Not specified'} in ${student.education?.field_of_study || 'Not specified'}
- GPA: ${student.education?.gpa || 'Not specified'}/${student.education?.gpa_scale || '4.0'}
- Budget: Up to ${student.budget_max || 'Not specified'} USD
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Any'}
- Preferred Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Any'}
- English Proficiency: ${student.english_proficiency?.test_type || 'Not specified'} ${student.english_proficiency?.score || ''}
- Target Intake: ${student.target_intake || 'Flexible'}

Available Universities: ${universities.map(u => `${u.university_name} (${u.country}, Ranking: ${u.ranking || 'N/A'})`).join('; ')}

Available Courses: ${courses.map(c => `${c.course_title} at ${universities.find(u => u.id === c.university_id)?.university_name} - ${c.level}, ${c.subject_area}, Fee: ${c.tuition_fee_min}-${c.tuition_fee_max} ${c.currency}`).join('; ')}

Return a JSON object with:
1. "recommended_courses": array of 5-10 course IDs with match scores (0-100) and reasons
2. "recommended_universities": array of 5-10 university IDs with match scores and reasons
3. "budget_analysis": string analyzing if budget is realistic
4. "admission_probability": overall probability of admission (low/medium/high)
5. "suggestions": array of improvement suggestions for the student`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_id: { type: "string" },
                  match_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            recommended_universities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  university_id: { type: "string" },
                  match_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            budget_analysis: { type: "string" },
            admission_probability: { type: "string" },
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setMatches(data);
      setGenerating(false);
      toast.success('AI matches generated!');
    },
    onError: () => {
      setGenerating(false);
      toast.error('Failed to generate matches');
    }
  });

  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI University & Course Matcher
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!matches ? (
          <div className="text-center py-6">
            <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Use AI to find the perfect matches for this student</p>
            <Button 
              onClick={() => generateMatches.mutate()}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Matches
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Admission Probability */}
            <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Admission Probability</span>
                <Badge className={
                  matches.admission_probability === 'high' ? 'bg-green-600' :
                  matches.admission_probability === 'medium' ? 'bg-amber-600' :
                  'bg-red-600'
                }>
                  {matches.admission_probability}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{matches.budget_analysis}</p>
            </div>

            {/* Recommended Universities */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                Top University Matches
              </h4>
              <div className="space-y-2">
                {matches.recommended_universities?.slice(0, 5).map((rec, idx) => {
                  const uni = universityMap[rec.university_id];
                  if (!uni) return null;
                  
                  return (
                    <div key={idx} className="bg-white rounded-lg p-3 border hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{uni.university_name}</p>
                          <p className="text-xs text-slate-500">{uni.city}, {uni.country}</p>
                        </div>
                        <Badge className="bg-purple-600">{rec.match_score}% Match</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{rec.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Courses */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                Top Course Matches
              </h4>
              <div className="space-y-2">
                {matches.recommended_courses?.slice(0, 5).map((rec, idx) => {
                  const course = courseMap[rec.course_id];
                  if (!course) return null;
                  const uni = universityMap[course.university_id];
                  
                  return (
                    <div key={idx} className="bg-white rounded-lg p-3 border hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{course.course_title}</p>
                          <p className="text-xs text-slate-500">{uni?.university_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{course.level}</Badge>
                            {course.tuition_fee_min && (
                              <span className="text-xs text-slate-500">
                                <DollarSign className="w-3 h-3 inline" />
                                {course.tuition_fee_min?.toLocaleString()} {course.currency}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-purple-600">{rec.match_score}%</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{rec.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions */}
            {matches.suggestions?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Improvement Suggestions
                </h4>
                <ul className="space-y-1">
                  {matches.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              onClick={() => {
                setMatches(null);
                generateMatches.mutate();
              }}
              variant="outline"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate Matches
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}