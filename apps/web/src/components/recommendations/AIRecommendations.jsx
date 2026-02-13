import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, TrendingUp, DollarSign, Clock, Award, 
  ArrowRight, Building2, RefreshCw, Target, BookOpen, 
  TrendingDown, AlertCircle, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIRecommendations({ studentProfile, courses = [], universities = [] }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!studentProfile || !courses.length) return;

    setIsLoading(true);

    // Get education records for academic performance analysis
    const educationRecords = studentProfile.education_records || [];
    const latestEducation = educationRecords.length > 0 ? educationRecords[educationRecords.length - 1] : null;
    
    const prompt = `You are an AI education counselor. Analyze this student comprehensively and recommend the top 3 courses that best match their profile.

STUDENT PROFILE ANALYSIS:

1. ACADEMIC PERFORMANCE:
${educationRecords.map(e => `   - ${e.level}: ${e.institution} | Result: ${e.result || 'N/A'} | Year: ${e.completion_year || 'N/A'}`).join('\n') || '   - No academic records'}
   Latest GPA/Result: ${latestEducation?.result || 'Not specified'}
   Grades Trend: ${educationRecords.length >= 2 ? 'Progressive' : 'Limited history'}

2. CAREER GOALS & ASPIRATIONS:
   Career Goal: ${studentProfile.career_goals || 'Not specified'}
   Preferred Study Area: ${studentProfile.admission_preferences?.study_area || 'Not specified'}
   Work Experience: ${studentProfile.work_experience_years || 0} years
   Current Role: ${studentProfile.current_job_role || 'Not specified'}

3. LEARNING PREFERENCES:
   Learning Style: ${studentProfile.learning_style || 'Not specified - assume balanced'}
   Study Level Interest: ${studentProfile.admission_preferences?.study_level || 'Not specified'}
   Course Alignment: ${studentProfile.admission_preferences?.course_alignment || 'Not specified'}

4. CONSTRAINTS & REQUIREMENTS:
   Language Skills: ${studentProfile.language_proficiency?.ielts?.overall ? `IELTS ${studentProfile.language_proficiency.ielts.overall}` : 'Not tested'}
   Budget: ${studentProfile.funding_information?.funding_status || 'Not specified'}
   Preferred Countries: ${studentProfile.preferred_study_destinations?.join(', ') || 'Any'}
   Financial Constraints: ${studentProfile.funding_information?.source_of_fund || 'Not specified'}

5. PERSONALITY & INTERESTS:
   Study Motivations: Career advancement, skill development
   Preferred Intake: ${studentProfile.admission_preferences?.intake || 'Flexible'}

AVAILABLE COURSES:
${courses.slice(0, 25).map(c => {
  const uni = universities.find(u => u.id === c.university_id);
  return `ID: ${c.id}
   Title: ${c.course_title}
   University: ${uni?.university_name || uni?.name}
   Level: ${c.level}
   Country: ${c.country}
   Tuition: ${c.tuition_fee_min ? '$' + c.tuition_fee_min : 'Varies'}
   Duration: ${c.duration || 'Not specified'}
   Requirements: IELTS ${c.ielts_overall || 'N/A'}`;
}).join('\n\n')}

MATCHING CRITERIA (Weight):
1. Career Goals Alignment (30%): How well does this course advance their stated career goals?
2. Academic Performance Match (25%): Does their academic history qualify them? Is it challenging but achievable?
3. Learning Style Compatibility (20%): Does the course format suit their learning preferences?
4. Financial Feasibility (15%): Can they afford it? Are scholarships available?
5. Requirements Match (10%): Do they meet all entry criteria?

For each recommendation, provide:
- course_id: exact ID from the list
- match_score: overall 0-100
- career_alignment_score: 0-100 with explanation
- academic_fit_score: 0-100 with explanation
- learning_style_score: 0-100 with explanation
- financial_fit_score: 0-100 with explanation
- explanation: WHY this course was recommended (2-3 sentences explaining the logic)
- key_benefits: array of 3-4 specific benefits for THIS student
- considerations: any concerns or things to consider`;

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
                career_alignment_score: { type: "number" },
                academic_fit_score: { type: "number" },
                learning_style_score: { type: "number" },
                financial_fit_score: { type: "number" },
                explanation: { type: "string" },
                key_benefits: {
                  type: "array",
                  items: { type: "string" }
                },
                considerations: { type: "string" }
              }
            }
          }
        }
      }
    });

    const enriched = result.recommendations.map(rec => {
      const course = courses.find(c => c.id === rec.course_id);
      const university = universities.find(u => u.id === course?.university_id);
      return {
        ...rec,
        course,
        university
      };
    }).filter(r => r.course);

    setRecommendations(enriched);
    setIsLoading(false);
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
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white/60 rounded-xl p-4 h-24" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600">Loading recommendations...</p>
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
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${
                        rec.match_score >= 85 ? 'bg-emerald-100 text-emerald-600' :
                        rec.match_score >= 70 ? 'bg-blue-100 text-blue-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {rec.match_score}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {index === 0 && (
                            <Badge className="bg-amber-500 text-white">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Top Match
                            </Badge>
                          )}
                          <Badge className="bg-emerald-50 text-emerald-700 capitalize">
                            {rec.course?.level}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1">
                          {rec.course?.course_title || rec.course?.name}
                        </h4>
                        <div className="flex items-center text-sm text-slate-500 mb-2">
                          <Building2 className="w-4 h-4 mr-1" />
                          {rec.university?.university_name || rec.university?.name}
                        </div>

                        {/* AI Explanation */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-start gap-2 mb-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-blue-900 mb-1">Why This Course?</p>
                              <p className="text-xs text-blue-800">{rec.explanation}</p>
                            </div>
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <Target className="w-3 h-3 text-green-600" />
                            <span className="text-slate-600">Career:</span>
                            <span className="font-semibold text-slate-900">{rec.career_alignment_score}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <BookOpen className="w-3 h-3 text-blue-600" />
                            <span className="text-slate-600">Academic:</span>
                            <span className="font-semibold text-slate-900">{rec.academic_fit_score}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span className="text-slate-600">Learning:</span>
                            <span className="font-semibold text-slate-900">{rec.learning_style_score}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <DollarSign className="w-3 h-3 text-amber-600" />
                            <span className="text-slate-600">Financial:</span>
                            <span className="font-semibold text-slate-900">{rec.financial_fit_score}%</span>
                          </div>
                        </div>
                        
                        {/* Key Benefits */}
                        {rec.key_benefits && rec.key_benefits.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-700 mb-1">Key Benefits for You:</p>
                            <div className="space-y-1">
                              {rec.key_benefits.map((benefit, i) => (
                                <div key={i} className="flex items-start gap-1 text-xs text-slate-600">
                                  <span className="text-emerald-600 mt-0.5">✓</span>
                                  {benefit}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Considerations */}
                        {rec.considerations && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-800">{rec.considerations}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          {rec.course?.tuition_fee_min !== undefined && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <DollarSign className="w-4 h-4" />
                              From ${rec.course.tuition_fee_min.toLocaleString()}
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
                      <Link to={createPageUrl('CourseDetailsPage') + `?id=${rec.course_id}`}>
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