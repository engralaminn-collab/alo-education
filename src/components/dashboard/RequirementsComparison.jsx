import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function RequirementsComparison({ studentProfile }) {
  const { data: favoriteCourses = [] } = useQuery({
    queryKey: ['favorite-courses-req', studentProfile?.id],
    queryFn: () => base44.entities.FavoriteCourse.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-req'],
    queryFn: () => base44.entities.Course.list(),
  });

  const courseMap = courses.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  const compareRequirements = (course) => {
    const requirements = [];
    let metCount = 0;

    // IELTS requirement
    if (course.ielts_required) {
      const studentScore = studentProfile?.english_proficiency?.score || 0;
      const requiredScore = course.ielts_overall || 6.0;
      const met = studentScore >= requiredScore;
      if (met) metCount++;
      
      requirements.push({
        label: 'IELTS Score',
        required: `${requiredScore}+`,
        student: studentScore > 0 ? studentScore.toString() : 'Not provided',
        met,
      });
    }

    // Academic requirement
    const studentGPA = studentProfile?.education?.gpa || 0;
    const studentScale = studentProfile?.education?.gpa_scale || 4.0;
    const normalizedGPA = (studentGPA / studentScale) * 4.0;
    const requiredGPA = course.level === 'Postgraduate' ? 3.0 : 2.5;
    const academicMet = normalizedGPA >= requiredGPA;
    if (academicMet) metCount++;

    requirements.push({
      label: 'Academic Standing',
      required: `${requiredGPA}+ GPA`,
      student: studentGPA > 0 ? `${studentGPA}/${studentScale}` : 'Not provided',
      met: academicMet,
    });

    // Field match
    const studentField = studentProfile?.preferred_fields || [];
    const courseField = course.subject_area;
    const fieldMatch = studentField.some(f => 
      f.toLowerCase().includes(courseField?.toLowerCase()) || 
      courseField?.toLowerCase().includes(f.toLowerCase())
    );
    if (fieldMatch || studentField.length === 0) metCount++;

    requirements.push({
      label: 'Field of Study',
      required: courseField || 'Any',
      student: studentField.join(', ') || 'Not specified',
      met: fieldMatch || studentField.length === 0,
    });

    const matchPercentage = Math.round((metCount / requirements.length) * 100);

    return { requirements, matchPercentage, metCount, totalCount: requirements.length };
  };

  if (favoriteCourses.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Requirements Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-4">
            Add favorite courses to see requirements comparison
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Requirements Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {favoriteCourses.slice(0, 3).map(fav => {
          const course = courseMap[fav.course_id];
          if (!course) return null;

          const { requirements, matchPercentage, metCount, totalCount } = compareRequirements(course);

          return (
            <div key={fav.id} className="border rounded-xl p-4 bg-slate-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">{course.course_title}</h4>
                  <p className="text-xs text-slate-500 capitalize">{course.level}</p>
                </div>
                <Badge className={
                  matchPercentage >= 80 ? 'bg-green-100 text-green-700' :
                  matchPercentage >= 60 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }>
                  {matchPercentage}% Match
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Requirements Met</span>
                  <span>{metCount} of {totalCount}</span>
                </div>
                <Progress value={matchPercentage} className="h-2" />
              </div>

              <div className="space-y-2">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    {req.met ? (
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700">{req.label}</p>
                      <p className="text-xs text-slate-500">
                        Required: <strong>{req.required}</strong> • 
                        You: <strong>{req.student}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}