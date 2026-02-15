import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, DollarSign, Clock, Award, GraduationCap, 
  Calendar, BookOpen, CheckCircle2, XCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseComparison({ courses, universities, onRemove }) {
  if (courses.length === 0) {
    return (
      <Card className="border-2 border-dashed border-slate-200">
        <CardContent className="p-8 text-center">
          <p className="text-slate-500">Select courses to compare (up to 4)</p>
        </CardContent>
      </Card>
    );
  }

  const getUniversity = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return universities.find(u => u.id === course?.university_id);
  };

  const comparisonRows = [
    {
      label: 'University',
      icon: Award,
      getValue: (course) => {
        const uni = getUniversity(course.id);
        return uni?.university_name || 'N/A';
      }
    },
    {
      label: 'Country',
      icon: GraduationCap,
      getValue: (course) => {
        const uni = getUniversity(course.id);
        return uni?.country || 'N/A';
      }
    },
    {
      label: 'Ranking',
      icon: Award,
      getValue: (course) => {
        const uni = getUniversity(course.id);
        return uni?.ranking ? `#${uni.ranking}` : 'N/A';
      }
    },
    {
      label: 'Tuition (USD)',
      icon: DollarSign,
      getValue: (course) => 
        course.tuition_fee_min ? 
        `$${course.tuition_fee_min.toLocaleString()} - $${course.tuition_fee_max?.toLocaleString() || course.tuition_fee_min.toLocaleString()}` : 
        'Contact university'
    },
    {
      label: 'Duration',
      icon: Clock,
      getValue: (course) => course.duration || 'N/A'
    },
    {
      label: 'Subject Area',
      icon: BookOpen,
      getValue: (course) => course.subject_area?.replace(/_/g, ' ') || 'N/A'
    },
    {
      label: 'Level',
      icon: GraduationCap,
      getValue: (course) => course.level || 'N/A'
    },
    {
      label: 'Intake',
      icon: Calendar,
      getValue: (course) => course.intake || 'N/A'
    },
    {
      label: 'IELTS',
      icon: CheckCircle2,
      getValue: (course) => 
        course.ielts_required ? 
        `${course.ielts_overall || 'Required'} (min ${course.ielts_min_each || 'N/A'} each)` : 
        'Not required'
    },
    {
      label: 'Scholarship',
      icon: DollarSign,
      getValue: (course) => course.scholarship_available ? 'Available' : 'Not available',
      getColor: (course) => course.scholarship_available ? 'text-green-600' : 'text-slate-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-3 bg-slate-50 font-semibold text-slate-700 sticky left-0">
                  Feature
                </th>
                {courses.map((course) => (
                  <th key={course.id} className="p-3 bg-slate-50 min-w-[250px]">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 text-left mb-1">
                            {course.course_title}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-red-600"
                          onClick={() => onRemove(course.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                        <Button size="sm" className="w-full bg-education-blue hover:bg-education-blue/90 text-xs">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium text-slate-700 bg-slate-50 sticky left-0">
                    <div className="flex items-center gap-2">
                      <row.icon className="w-4 h-4 text-slate-400" />
                      {row.label}
                    </div>
                  </td>
                  {courses.map((course) => (
                    <td 
                      key={course.id} 
                      className={`p-3 text-sm ${row.getColor ? row.getColor(course) : 'text-slate-700'}`}
                    >
                      {row.getValue(course)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}