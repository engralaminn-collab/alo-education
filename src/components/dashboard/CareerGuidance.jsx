import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, TrendingUp, Sparkles, Loader2, 
  Target, BookOpen, Award, ArrowRight, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CareerGuidance({ studentProfile, courses, universities }) {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (studentProfile && !recommendations) {
      generateRecommendations();
    }
  }, [studentProfile?.id]);

  const generateRecommendations = async () => {
    if (!studentProfile) return;

    setIsLoading(true);

    try {
      const prompt = `Analyze this student's profile and provide personalized career path recommendations based on current job market trends.

Student Profile:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Education: ${studentProfile.education_history?.map(e => `${e.academic_level} in ${e.group_subject} (${e.result_value})`).join(', ')}
- Study Destination: ${studentProfile.admission_preferences?.study_destination || 'Not specified'}
- Study Level: ${studentProfile.admission_preferences?.study_level || 'Not specified'}
- Study Area: ${studentProfile.admission_preferences?.study_area || 'Not specified'}
- Course Alignment: ${studentProfile.admission_preferences?.course_alignment || 'Not specified'}
- Work Experience: ${studentProfile.work_experience?.length || 0} positions
- English Level: ${studentProfile.english_proficiency?.test_type} ${studentProfile.english_proficiency?.overall_score || ''}

Based on current job market trends (2025), provide:
1. Top 3-5 career paths that align with their profile
2. For each career path: job roles, salary ranges, growth outlook, required skills
3. Recommended courses/specializations
4. Skills to develop

Be specific, data-driven, and encouraging.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            career_paths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  job_roles: { type: "array", items: { type: "string" } },
                  salary_range: { type: "string" },
                  growth_outlook: { type: "string" },
                  required_skills: { type: "array", items: { type: "string" } },
                  match_score: { type: "number" }
                }
              }
            },
            recommended_courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_name: { type: "string" },
                  specialization: { type: "string" },
                  why_relevant: { type: "string" }
                }
              }
            },
            skills_to_develop: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  importance: { type: "string" },
                  how_to_learn: { type: "string" }
                }
              }
            },
            market_insights: { type: "string" }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!studentProfile) {
    return null;
  }

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            AI Career Guidance
          </CardTitle>
          {recommendations && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generateRecommendations}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-indigo-700">Analyzing job market trends...</p>
            </div>
          </div>
        ) : !recommendations ? (
          <div className="text-center py-8">
            <Button
              onClick={generateRecommendations}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Career Recommendations
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Market Insights */}
            {recommendations.market_insights && (
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Market Insights</h4>
                    <p className="text-sm text-blue-800">{recommendations.market_insights}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Career Paths */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Recommended Career Paths</h4>
              <div className="space-y-3">
                {recommendations.career_paths?.slice(0, 3).map((career, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-lg p-4 border-2 border-indigo-100 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-slate-900">{career.title}</h5>
                          {career.match_score && (
                            <Badge className="bg-green-100 text-green-700">
                              {career.match_score}% Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{career.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-700">Salary: </span>
                        <span className="text-slate-600">{career.salary_range}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-slate-700">Outlook: </span>
                        <span className="text-slate-600">{career.growth_outlook}</span>
                      </div>
                    </div>

                    {career.job_roles?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-slate-700 mb-2">Job Roles:</div>
                        <div className="flex flex-wrap gap-1">
                          {career.job_roles.slice(0, 4).map((role, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {career.required_skills?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">Key Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {career.required_skills.slice(0, 5).map((skill, i) => (
                            <Badge key={i} className="bg-indigo-100 text-indigo-700 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommended Courses */}
            {recommendations.recommended_courses?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Recommended Courses
                </h4>
                <div className="space-y-2">
                  {recommendations.recommended_courses.slice(0, 3).map((course, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="font-semibold text-sm text-slate-900">{course.course_name}</div>
                      <div className="text-xs text-purple-600 mb-1">{course.specialization}</div>
                      <p className="text-xs text-slate-600">{course.why_relevant}</p>
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl('Courses')}>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Explore Courses
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Skills to Develop */}
            {recommendations.skills_to_develop?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  Skills to Develop
                </h4>
                <div className="space-y-2">
                  {recommendations.skills_to_develop.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-900">{item.skill}</span>
                        <Badge variant="outline" className="text-xs">{item.importance}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{item.how_to_learn}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}