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

export default function AIRecommendations({ studentProfile, courses = [], universities = [] }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!studentProfile || !courses.length) return;

    setIsLoading(true);

    const prompt = `Analyze this student profile and recommend the top 3 most suitable courses from the provided list.

Student Profile:
- Education: ${studentProfile.education?.highest_degree || 'Not specified'} in ${studentProfile.education?.field_of_study || 'general'}
- GPA: ${studentProfile.education?.gpa || 'N/A'} out of ${studentProfile.education?.gpa_scale || 4}
- English: ${studentProfile.english_proficiency?.test_type || 'Not taken'} ${studentProfile.english_proficiency?.score || ''}
- Preferred Countries: ${studentProfile.preferred_countries?.join(', ') || 'Any'}
- Preferred Degree: ${studentProfile.preferred_degree_level || 'Any'}
- Preferred Fields: ${studentProfile.preferred_fields?.join(', ') || 'Any'}
- Budget: Up to $${studentProfile.budget_max || 'Flexible'}/year
- Work Experience: ${studentProfile.work_experience_years || 0} years

Available Courses (ID, Name, University, Degree, Field, Tuition, Requirements):
${courses.slice(0, 20).map(c => {
  const uni = universities.find(u => u.id === c.university_id);
  return `${c.id}|${c.name}|${uni?.name}|${c.degree_level}|${c.field_of_study}|${c.tuition_fee} ${c.currency}|GPA:${c.requirements?.min_gpa || 'N/A'},IELTS:${c.requirements?.ielts_score || 'N/A'}`;
}).join('\n')}

Provide the top 3 recommendations with match score (0-100) and reasoning.`;

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
                }
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
                            {rec.course?.degree_level}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1">
                          {rec.course?.name}
                        </h4>
                        <div className="flex items-center text-sm text-slate-500 mb-2">
                          <Building2 className="w-4 h-4 mr-1" />
                          {rec.university?.name}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{rec.reasoning}</p>
                        
                        {rec.highlights && rec.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {rec.highlights.slice(0, 3).map((highlight, i) => (
                              <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                • {highlight}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          {rec.course?.tuition_fee !== undefined && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <DollarSign className="w-4 h-4" />
                              {rec.course.tuition_fee === 0 ? 'Tuition Free' : `${rec.course.tuition_fee.toLocaleString()} ${rec.course.currency}`}
                            </span>
                          )}
                          {rec.course?.duration_months && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-4 h-4" />
                              {rec.course.duration_months} months
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