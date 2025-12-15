import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, TrendingUp, DollarSign, Clock, Award, 
  ArrowRight, Building2, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIRecommendations({ studentProfile, courses = [], universities = [], applications = [] }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!studentProfile || !courses.length) return;

    setIsLoading(true);

    try {
      // Build application history context
      const appliedCourses = applications.map(app => app.course_id);
      const appliedFields = applications.map(app => {
        const course = courses.find(c => c.id === app.course_id);
        return course?.subject_area;
      }).filter(Boolean);

      // Get education history
      const educationLevel = studentProfile.education_history?.[0]?.academic_level || 
                             studentProfile.admission_preferences?.study_level || 
                             'Undergraduate';
      
      // Get English test scores
      const englishTest = studentProfile.english_proficiency?.test_type || 'Not taken';
      const englishScore = studentProfile.english_proficiency?.overall_score || 0;

      const prompt = `Analyze this student profile and application history to recommend the top 5 most suitable courses from the provided list.

Student Profile:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Education Level: ${educationLevel}
- Previous Education: ${studentProfile.education_history?.map(e => `${e.academic_level} in ${e.group_subject} (${e.result_value})`).join(', ') || 'Not specified'}
- English Proficiency: ${englishTest} ${englishScore > 0 ? `(Overall: ${englishScore})` : ''}
- Nationality: ${studentProfile.nationality || 'Not specified'}
- Study Destination Preference: ${studentProfile.admission_preferences?.study_destination || studentProfile.country || 'Any'}
- Study Area Interest: ${studentProfile.admission_preferences?.study_area || 'Any'}
- Work Experience: ${studentProfile.work_experience?.length || 0} roles (${studentProfile.work_experience?.map(w => w.job_role).join(', ') || 'None'})
- Funding: ${studentProfile.funding_information?.funding_status || 'Not specified'}
- Applied Previously: ${appliedFields.length > 0 ? appliedFields.join(', ') : 'No previous applications'}

Available Courses:
${courses.slice(0, 50).map(c => {
  const uni = universities.find(u => u.id === c.university_id);
  return `ID: ${c.id}
Title: ${c.course_title}
University: ${uni?.university_name} (${uni?.country})
Level: ${c.level}
Subject: ${c.subject_area}
Duration: ${c.duration}
Fee: ${c.tuition_fee_min || 0}-${c.tuition_fee_max || 0} ${c.currency || 'USD'}
IELTS: ${c.ielts_overall || 'N/A'}
Scholarship: ${c.scholarship_available ? 'Yes' : 'No'}
---`;
}).join('\n')}

Based on the student's profile, education history, interests, and application history, provide the top 5 course recommendations. Consider:
1. Academic qualifications and match
2. English proficiency requirements
3. Country/destination preferences
4. Field of study alignment
5. Financial considerations (scholarships, fees)
6. Career progression potential

For each recommendation, provide:
- Match score (0-100) based on overall fit
- Clear reasoning explaining why this course suits the student
- 3-4 specific highlights/benefits
- Any concerns or requirements the student should be aware of`;

      const result = await base44.integrations.Core.InvokeLLM({
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
                  reasoning: { type: "string" },
                  highlights: {
                    type: "array",
                    items: { type: "string" }
                  },
                  concerns: { type: "string" }
                }
              }
            }
          }
        }
      });

      const enriched = result.recommendations.map(rec => {
        const course = courses.find(c => c.id === rec.course_id);
        const university = universities.find(u => u.id === course?.university_id);
        const alreadyApplied = appliedCourses.includes(rec.course_id);
        return {
          ...rec,
          course,
          university,
          alreadyApplied
        };
      }).filter(r => r.course);

      setRecommendations(enriched);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentProfile && courses.length > 0 && universities.length > 0 && recommendations.length === 0) {
      generateRecommendations();
    }
  }, [studentProfile, courses, universities]);

  if (!studentProfile || studentProfile.profile_completeness < 50) {
    return (
      <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">AI Recommendations</h4>
              <p className="text-sm text-slate-600 mb-3">
                Complete your profile to get personalized course recommendations powered by AI.
              </p>
              <Link to={createPageUrl('MyProfile')}>
                <Button size="sm" variant="outline">
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
    <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-cyan-50 border-l-4 border-l-emerald-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            AI-Powered Recommendations
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={generateRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Personalized matches based on your profile and preferences
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse bg-white/60 rounded-xl p-4 h-32" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-3">Click refresh to get personalized recommendations</p>
            <Button onClick={generateRecommendations} className="bg-emerald-500 hover:bg-emerald-600">
              Generate Recommendations
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.course_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${rec.alreadyApplied ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${
                        rec.match_score >= 85 ? 'bg-emerald-100 text-emerald-600' :
                        rec.match_score >= 70 ? 'bg-blue-100 text-blue-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {rec.match_score}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {index === 0 && (
                            <Badge className="bg-amber-500 text-white">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Top Match
                            </Badge>
                          )}
                          <Badge className="bg-emerald-50 text-emerald-700 capitalize">
                            {rec.course?.level}
                          </Badge>
                          {rec.alreadyApplied && (
                            <Badge variant="outline" className="border-slate-300 text-slate-600">
                              Already Applied
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1">
                          {rec.course?.course_title}
                        </h4>
                        <div className="flex items-center text-sm text-slate-500 mb-2">
                          <Building2 className="w-4 h-4 mr-1" />
                          {rec.university?.university_name} • {rec.university?.country}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{rec.reasoning}</p>
                        
                        {rec.highlights && rec.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {rec.highlights.map((highlight, i) => (
                              <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                ✓ {highlight}
                              </span>
                            ))}
                          </div>
                        )}

                        {rec.concerns && (
                          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mb-3">
                            ⚠️ {rec.concerns}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          {(rec.course?.tuition_fee_min || rec.course?.tuition_fee_max) && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <DollarSign className="w-4 h-4" />
                              {rec.course.tuition_fee_min?.toLocaleString()} - {rec.course.tuition_fee_max?.toLocaleString()} {rec.course.currency || 'USD'}
                            </span>
                          )}
                          {rec.course?.duration && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-4 h-4" />
                              {rec.course.duration}
                            </span>
                          )}
                          {rec.course?.scholarship_available && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Scholarship
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Link to={createPageUrl('CourseDetails') + `?id=${rec.course_id}`}>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 shrink-0">
                          View
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}