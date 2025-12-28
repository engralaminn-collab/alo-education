import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Award, DollarSign, Target, BookOpen, Lightbulb, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EnhancedAICourseMatcher({ studentProfile, courses = [], universities = [] }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

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

        // Analyze academic performance trend
        const educationRecords = studentProfile.education_records || [];
        const academicTrend = educationRecords.length >= 2 ? 'Improving' : 'Stable';
        
        const prompt = `You are an expert education AI counselor. Provide TOP 5 personalized course recommendations with detailed explanations.

COMPREHENSIVE STUDENT ANALYSIS:

1. ACADEMIC PERFORMANCE & HISTORY:
${educationRecords.map((e, i) => `   ${i + 1}. ${e.level} at ${e.institution}
      - Result: ${e.result || 'N/A'}
      - Year: ${e.completion_year || 'N/A'}
      - Field: ${e.field_of_study || 'General'}`).join('\n') || '   No academic records'}
   
   Academic Trend: ${academicTrend}
   Overall Performance Level: ${educationRecords.length > 0 ? 'Consider student strengths' : 'Limited data'}

2. CAREER GOALS & PROFESSIONAL ASPIRATIONS:
   Primary Career Goal: ${studentProfile.career_goals || 'Not specified'}
   Target Industry: ${studentProfile.admission_preferences?.study_area || 'Not specified'}
   Current Work Experience: ${studentProfile.work_experience_years || 0} years
   Career Stage: ${studentProfile.work_experience_years > 3 ? 'Experienced professional' : 'Early career/Entry level'}
   
3. LEARNING PREFERENCES & STYLE:
   Preferred Learning Style: ${studentProfile.learning_style || 'Not specified - recommend diverse formats'}
   Study Level Interest: ${studentProfile.admission_preferences?.study_level || 'Not specified'}
   Course Format Preference: ${studentProfile.course_format_preference || 'Flexible - can be on-campus, online, or hybrid'}
   Pace Preference: ${studentProfile.study_pace || 'Standard - full-time recommended'}

4. FINANCIAL SITUATION:
   Funding Status: ${studentProfile.funding_information?.funding_status || 'Not specified'}
   Sponsor: ${studentProfile.funding_information?.sponsor || 'Self/Family'}
   Source of Funds: ${studentProfile.funding_information?.source_of_fund || 'Personal savings'}
   Scholarship Interest: High priority if available

5. LANGUAGE & REQUIREMENTS:
${studentProfile.language_proficiency?.ielts ? `   IELTS: Overall ${studentProfile.language_proficiency.ielts.overall} (L:${studentProfile.language_proficiency.ielts.listening}, R:${studentProfile.language_proficiency.ielts.reading}, W:${studentProfile.language_proficiency.ielts.writing}, S:${studentProfile.language_proficiency.ielts.speaking})` : '   English Test: Not taken yet'}
${studentProfile.language_proficiency?.toefl ? `   TOEFL: ${studentProfile.language_proficiency.toefl.total}` : ''}

6. PREFERENCES & CONSTRAINTS:
   Preferred Countries: ${studentProfile.preferred_study_destinations?.join(', ') || 'Open to all'}
   Preferred Intake: ${studentProfile.admission_preferences?.intake || 'Next available'}
   Study Alignment: ${studentProfile.admission_preferences?.course_alignment || 'Career-focused'}

AVAILABLE COURSES DATABASE:
${coursesWithUni.slice(0, 50).map(c => 
  `▸ ${c.course_title}
   University: ${c.university_name}, ${c.country}
   Level: ${c.level}
   Tuition: ${c.tuition_fee_min ? '$' + c.tuition_fee_min + '-' + (c.tuition_fee_max || c.tuition_fee_min) : 'Contact for fees'}
   Duration: ${c.duration || 'Standard duration'}
   Scholarships: ${c.scholarship_available ? 'Yes' : 'No'}
   IELTS Required: ${c.ielts_overall || 'Check requirements'}`
).join('\n\n')}

MATCHING ALGORITHM CRITERIA:
1. Career Goals Alignment (30%): Direct pathway to stated career goals
2. Academic Performance Match (25%): Appropriate challenge level based on history
3. Learning Style Compatibility (20%): Teaching format matches learning preferences
4. Financial Feasibility (15%): Affordable with scholarship opportunities
5. Requirements Match (10%): Meets or exceeds entry requirements

For TOP 5 recommendations, provide:
- course_title: exact title from list
- match_score: 0-100 overall
- career_alignment: 0-100 score
- academic_fit: 0-100 score  
- learning_style_fit: 0-100 score
- financial_fit: 0-100 score
- detailed_explanation: 3-4 sentences explaining WHY this is recommended based on student's specific profile
- career_pathway: how this course leads to their career goals
- learning_benefits: how the format suits their style
- academic_reasoning: why their performance qualifies them
- scholarship_opportunities: specific scholarships available
- estimated_total_cost: realistic estimate
- roi_potential: career earnings potential
- key_considerations: anything to keep in mind`;

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
                    academic_fit: { type: "number" },
                    learning_style_fit: { type: "number" },
                    financial_fit: { type: "number" },
                    detailed_explanation: { type: "string" },
                    career_pathway: { type: "string" },
                    learning_benefits: { type: "string" },
                    academic_reasoning: { type: "string" },
                    scholarship_opportunities: {
                      type: "array",
                      items: { type: "string" }
                    },
                    estimated_total_cost: { type: "string" },
                    roi_potential: { type: "string" },
                    key_considerations: { type: "string" }
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
        {recommendations.map((rec, index) => {
          const isExpanded = expandedIndex === index;
          return (
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

              {/* AI Detailed Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">Why This Course Matches You:</p>
                    <p className="text-xs text-blue-800">{rec.detailed_explanation}</p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid md:grid-cols-4 gap-2 mb-3">
                <div className="p-2 bg-green-50 rounded-lg text-center">
                  <Target className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-600">Career</p>
                  <p className="text-sm font-bold text-green-700">{rec.career_alignment}%</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-center">
                  <BookOpen className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-blue-600">Academic</p>
                  <p className="text-sm font-bold text-blue-700">{rec.academic_fit}%</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg text-center">
                  <Lightbulb className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-purple-600">Learning</p>
                  <p className="text-sm font-bold text-purple-700">{rec.learning_style_fit}%</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg text-center">
                  <DollarSign className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs text-amber-600">Financial</p>
                  <p className="text-sm font-bold text-amber-700">{rec.financial_fit}%</p>
                </div>
              </div>

              {/* Expandable Details */}
              <Button
                variant="ghost"
                className="w-full mb-3 text-blue-600"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                {isExpanded ? 'Hide' : 'Show'} Detailed Analysis
              </Button>

              {isExpanded && (
                <div className="space-y-3 mb-3 bg-slate-50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      Career Pathway:
                    </p>
                    <p className="text-sm text-slate-600">{rec.career_pathway}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                      Learning Benefits:
                    </p>
                    <p className="text-sm text-slate-600">{rec.learning_benefits}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Academic Fit:
                    </p>
                    <p className="text-sm text-slate-600">{rec.academic_reasoning}</p>
                  </div>

                  {rec.key_considerations && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2">
                      <p className="text-xs font-semibold text-amber-900 mb-1">Considerations:</p>
                      <p className="text-xs text-amber-800">{rec.key_considerations}</p>
                    </div>
                  )}
                </div>
              )}

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
          );
        })}
      </CardContent>
    </Card>
  );
}