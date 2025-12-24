import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Award, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnhancedAICourseMatcher({ studentProfile, courses = [], universities = [] }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRecommendations = async () => {
      if (!studentProfile || courses.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const coursesWithUni = courses.map(course => {
          const uni = universities.find(u => u.id === course.university_id);
          return {
            ...course,
            university_name: uni?.university_name || uni?.name,
            country: course.country || uni?.country
          };
        });

        const prompt = `Analyze this student profile and recommend the TOP 5 best-matching courses with scholarship opportunities.

STUDENT PROFILE:
Name: ${studentProfile.first_name} ${studentProfile.last_name}

Academic Background:
${studentProfile.education_records?.map(e => `- ${e.level}: ${e.institution} (${e.result})`).join('\n') || 'Not specified'}

Career Goals: ${studentProfile.career_goals || 'Not specified'}
Preferred Learning Style: ${studentProfile.learning_style || 'Not specified'}
Budget Constraints: ${studentProfile.funding_information?.funding_status || 'Not specified'}
Financial Budget: ${studentProfile.budget_limit || 'Not specified'}

English Proficiency:
${studentProfile.language_proficiency?.ielts ? `IELTS: ${studentProfile.language_proficiency.ielts.overall}` : 'Not taken'}
${studentProfile.language_proficiency?.toefl ? `TOEFL: ${studentProfile.language_proficiency.toefl.total}` : ''}

Preferred Destinations: ${studentProfile.preferred_study_destinations?.join(', ') || 'Any'}
Preferred Study Area: ${studentProfile.admission_preferences?.study_area || 'Any'}
Study Level: ${studentProfile.admission_preferences?.study_level || 'Any'}

AVAILABLE COURSES (sample):
${coursesWithUni.slice(0, 50).map(c => 
  `- ${c.course_title} at ${c.university_name}, ${c.country} | ${c.level} | ${c.tuition_fee_min ? '$' + c.tuition_fee_min : 'Fee varies'} | ${c.scholarship_available ? 'Scholarships available' : 'No scholarships'}`
).join('\n')}

ANALYSIS CRITERIA:
1. Career Goals Alignment (30%): How well does the course align with stated career goals?
2. Learning Style Match (20%): Does the course format match preferred learning style?
3. Financial Fit (25%): Is tuition within budget? Are scholarships available?
4. Academic Requirements (15%): Does student meet entry requirements?
5. Destination Preference (10%): Matches preferred countries?

Return JSON array of TOP 5 recommendations with:
- course_title (exact match from list)
- match_score (0-100)
- career_alignment (0-100)
- financial_fit (0-100)
- scholarship_opportunities (array of potential scholarships)
- learning_style_match (text explanation)
- why_recommended (detailed reasoning)
- estimated_total_cost (including living expenses)
- roi_potential (career earnings potential)`;

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
                    course_title: { type: "string" },
                    match_score: { type: "number" },
                    career_alignment: { type: "number" },
                    financial_fit: { type: "number" },
                    scholarship_opportunities: {
                      type: "array",
                      items: { type: "string" }
                    },
                    learning_style_match: { type: "string" },
                    why_recommended: { type: "string" },
                    estimated_total_cost: { type: "string" },
                    roi_potential: { type: "string" }
                  }
                }
              }
            }
          }
        });

        // Enrich with full course data
        const enriched = response.recommendations.map(rec => {
          const course = coursesWithUni.find(c => 
            c.course_title.toLowerCase().includes(rec.course_title.toLowerCase()) ||
            rec.course_title.toLowerCase().includes(c.course_title.toLowerCase())
          );
          return { ...rec, courseData: course };
        }).filter(r => r.courseData);

        setRecommendations(enriched);
      } catch (error) {
        console.error('Failed to generate recommendations:', error);
      }
      setLoading(false);
    };

    generateRecommendations();
  }, [studentProfile, courses, universities]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-blue-300 mx-auto mb-3 animate-pulse" />
          <p className="text-slate-600">AI analyzing your profile for best matches...</p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6" style={{ color: '#F37021' }} />
          AI-Powered Course Recommendations
        </CardTitle>
        <p className="text-sm text-slate-600">
          Based on career goals, learning style, and financial constraints
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendations.map((rec, index) => (
          <div key={index} className="p-4 border-2 rounded-lg" style={{ borderColor: '#0066CC' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge style={{ backgroundColor: '#F37021', color: 'white' }}>
                    #{index + 1} Match
                  </Badge>
                  <Badge variant="outline">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {rec.match_score}% Match
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {rec.courseData.course_title}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  {rec.courseData.university_name} • {rec.courseData.country}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Career Alignment</p>
                <p className="text-lg font-bold text-blue-700">{rec.career_alignment}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 mb-1">Financial Fit</p>
                <p className="text-lg font-bold text-green-700">{rec.financial_fit}%</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Why Recommended:</p>
                <p className="text-sm text-slate-600">{rec.why_recommended}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Learning Style:</p>
                <p className="text-sm text-slate-600">{rec.learning_style_match}</p>
              </div>
            </div>

            {rec.scholarship_opportunities?.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-800">Scholarship Opportunities:</p>
                </div>
                <ul className="space-y-1">
                  {rec.scholarship_opportunities.map((scholarship, i) => (
                    <li key={i} className="text-sm text-amber-700">• {scholarship}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 bg-slate-50 rounded">
                <p className="text-xs text-slate-600">Estimated Total Cost</p>
                <p className="text-sm font-semibold text-slate-900">{rec.estimated_total_cost}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <p className="text-xs text-slate-600">ROI Potential</p>
                <p className="text-sm font-semibold text-slate-900">{rec.roi_potential}</p>
              </div>
            </div>

            <Link to={createPageUrl('CourseDetailsPage') + `?id=${rec.courseData.id}`}>
              <Button className="w-full" style={{ backgroundColor: '#0066CC' }}>
                View Course Details
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}