import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, Award, Target, DollarSign, MapPin, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AICourseRecommendations({ studentProfile, courses, universities }) {
  const [recommendations, setRecommendations] = useState(null);

  const getRecommendations = useMutation({
    mutationFn: async () => {
      const prompt = `Analyze this student profile and recommend the top 5 most suitable courses from the provided list.

Student Profile:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Nationality: ${studentProfile.nationality}
- Academic Level: ${studentProfile.education_history?.[0]?.academic_level || 'Not specified'}
- GPA/Result: ${studentProfile.education_history?.[0]?.result_value || 'Not specified'}
- Field of Study: ${studentProfile.education_history?.[0]?.group_subject || 'Not specified'}
- English Proficiency: ${studentProfile.english_proficiency?.test_type || 'None'} - Overall: ${studentProfile.english_proficiency?.overall_score || 'N/A'}
- Preferred Destination: ${studentProfile.admission_preferences?.study_destination || 'Not specified'}
- Study Level Interest: ${studentProfile.admission_preferences?.study_level || 'Not specified'}
- Study Area Interest: ${studentProfile.admission_preferences?.study_area || 'Not specified'}
- Funding Status: ${studentProfile.funding_information?.funding_status || 'Not specified'}
- Budget Considerations: ${studentProfile.funding_information?.source_of_fund || 'Not specified'}

Available Courses:
${courses.slice(0, 50).map(c => `- ${c.course_title} (${c.level}) at ${universities.find(u => u.id === c.university_id)?.university_name || 'University'}, ${c.country} - Fee: ${c.tuition_fee_min || 'N/A'} ${c.currency || 'USD'}, IELTS: ${c.ielts_overall || 'N/A'}`).join('\n')}

Provide your response as a JSON array with exactly 5 recommendations. Each recommendation should include:
- course_id: the ID from the original course list
- match_score: percentage (0-100)
- reasons: array of 3-4 specific reasons why this course matches
- scholarships: array of potential scholarship opportunities (if available)
- concerns: array of 1-2 potential challenges or things to consider

Format: Return ONLY the JSON array, no additional text.`;

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
                  course_id: { type: "string" },
                  match_score: { type: "number" },
                  reasons: { type: "array", items: { type: "string" } },
                  scholarships: { type: "array", items: { type: "string" } },
                  concerns: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      return response.recommendations;
    },
    onSuccess: (data) => {
      setRecommendations(data);
    }
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0066CC, #F37021)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>AI Course Recommendations</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Personalized suggestions based on your profile</p>
            </div>
          </div>
          {!recommendations && (
            <Button 
              onClick={() => getRecommendations.mutate()}
              disabled={getRecommendations.isPending}
              style={{ backgroundColor: '#F37021', color: '#000000' }}
            >
              {getRecommendations.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Recommendations
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {getRecommendations.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#0066CC' }} />
              <p className="text-slate-600">Analyzing your profile and matching courses...</p>
            </motion.div>
          )}

          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {recommendations.map((rec, idx) => {
                const course = courseMap[rec.course_id];
                const university = course ? universityMap[course.university_id] : null;
                
                if (!course) return null;

                return (
                  <motion.div
                    key={rec.course_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border hover:shadow-lg transition-all" style={{ borderColor: '#0066CC20' }}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Rank Badge */}
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white" style={{ backgroundColor: idx === 0 ? '#F37021' : '#0066CC' }}>
                            #{idx + 1}
                          </div>

                          <div className="flex-1">
                            {/* Match Score */}
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="text-sm px-3 py-1" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                                {rec.match_score}% Match
                              </Badge>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-600">Recommended</span>
                              </div>
                            </div>

                            {/* Course Info */}
                            <h3 className="font-bold text-lg mb-1" style={{ color: '#0066CC' }}>
                              {course.course_title}
                            </h3>
                            
                            <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-3">
                              {university && (
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="w-4 h-4" />
                                  <span>{university.university_name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{course.country}</span>
                              </div>
                              {course.tuition_fee_min && (
                                <div className="flex items-center gap-1 font-semibold" style={{ color: '#F37021' }}>
                                  <DollarSign className="w-4 h-4" />
                                  <span>{course.tuition_fee_min.toLocaleString()} {course.currency}</span>
                                </div>
                              )}
                            </div>

                            {/* Why This Course */}
                            <div className="space-y-3 mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="w-4 h-4" style={{ color: '#0066CC' }} />
                                  <span className="font-semibold text-sm text-slate-900">Why this course?</span>
                                </div>
                                <ul className="space-y-1 ml-6">
                                  {rec.reasons.map((reason, i) => (
                                    <li key={i} className="text-sm text-slate-600 list-disc">{reason}</li>
                                  ))}
                                </ul>
                              </div>

                              {rec.scholarships && rec.scholarships.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold text-sm text-slate-900">Scholarship Opportunities</span>
                                  </div>
                                  <ul className="space-y-1 ml-6">
                                    {rec.scholarships.map((scholarship, i) => (
                                      <li key={i} className="text-sm text-green-700 list-disc">{scholarship}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {rec.concerns && rec.concerns.length > 0 && (
                                <div className="p-3 bg-amber-50 rounded-lg">
                                  <p className="text-xs font-semibold text-amber-900 mb-1">Things to consider:</p>
                                  <ul className="space-y-1">
                                    {rec.concerns.map((concern, i) => (
                                      <li key={i} className="text-xs text-amber-800">• {concern}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* CTA */}
                            <div className="flex gap-2">
                              <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`} className="flex-1">
                                <Button className="w-full" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                                  View Course Details
                                </Button>
                              </Link>
                              <Link to={createPageUrl('Contact') + `?course=${course.id}`} className="flex-1">
                                <Button variant="outline" className="w-full" style={{ borderColor: '#0066CC', color: '#0066CC' }}>
                                  Apply Now
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              <Button
                onClick={() => setRecommendations(null)}
                variant="outline"
                className="w-full"
              >
                Get New Recommendations
              </Button>
            </motion.div>
          )}

          {!recommendations && !getRecommendations.isPending && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 mb-4">Click "Get Recommendations" to receive AI-powered course suggestions</p>
              <p className="text-sm text-slate-500">Our AI will analyze your profile and match you with the best courses</p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}