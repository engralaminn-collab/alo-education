import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, DollarSign, Calendar, TrendingUp, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIRecommendedCourses({ studentProfile }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const prompt = `Based on this student profile:
- Preferred Destinations: ${studentProfile.preferred_study_destinations?.join(', ') || 'Not specified'}
- Education Level: ${studentProfile.admission_preferences?.study_level || 'Not specified'}
- Test Scores: IELTS ${studentProfile.language_proficiency?.ielts?.overall || 'N/A'}
- Field of Interest: ${studentProfile.admission_preferences?.subject_area || 'Not specified'}

Available courses: ${JSON.stringify(courses.slice(0, 20).map(c => ({ id: c.id, title: c.course_title, level: c.level, country: c.country })))}

Recommend top 5 most suitable course IDs with match percentage. Return JSON: [{"course_id": "...", "match_score": 95, "reason": "..."}]`;

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
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      const recs = response.recommendations || [];
      const enriched = recs.map(rec => {
        const course = courses.find(c => c.id === rec.course_id);
        const university = universities.find(u => u.id === course?.university_id);
        return { ...rec, course, university };
      }).filter(r => r.course);

      setRecommendations(enriched);
    } catch (error) {
      console.error('AI recommendation error:', error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (studentProfile && courses.length > 0) {
      generateRecommendations();
    }
  }, [studentProfile, courses]);

  if (!studentProfile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#F37021' }} />
          AI Recommended Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-600">Analyzing your profile...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <Link key={index} to={createPageUrl('CourseDetailsPage') + `?id=${rec.course.id}`}>
                <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm" style={{ color: '#0066CC' }}>
                      {rec.course.course_title}
                    </h4>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {rec.match_score}% Match
                    </Badge>
                  </div>
                  {rec.university && (
                    <p className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                      <Building2 className="w-3 h-3" />
                      {rec.university.university_name}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mb-2">{rec.reason}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {rec.course.country}
                    </span>
                    {rec.course.tuition_fee_min && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {rec.course.tuition_fee_min.toLocaleString()} {rec.course.currency}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-slate-500">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Complete your profile to see personalized recommendations
          </div>
        )}
      </CardContent>
    </Card>
  );
}