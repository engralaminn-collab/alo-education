import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Check, X, DollarSign, Calendar, Clock, 
  BookOpen, GraduationCap, Building2, Globe, Award, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CompareCourses() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseIds = urlParams.get('ids')?.split(',') || [];

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['compare-courses', courseIds],
    queryFn: async () => {
      if (!courseIds.length) return [];
      const promises = courseIds.map(id => base44.entities.Course.get(id));
      return Promise.all(promises);
    },
    enabled: courseIds.length > 0
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['compare-universities', courses.map(c => c?.university_id)],
    queryFn: async () => {
      if (!courses.length) return [];
      const universityIds = [...new Set(courses.map(c => c.university_id).filter(Boolean))];
      const promises = universityIds.map(id => base44.entities.University.get(id));
      return Promise.all(promises);
    },
    enabled: courses.length > 0
  });

  const getUniversity = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return universities.find(u => u.id === course?.university_id);
  };

  const comparisonRows = [
    { 
      label: 'Course Title', 
      icon: <BookOpen className="w-4 h-4" />,
      getValue: (course) => course.course_title 
    },
    { 
      label: 'University', 
      icon: <Building2 className="w-4 h-4" />,
      getValue: (course) => getUniversity(course.id)?.university_name || 'N/A'
    },
    { 
      label: 'Level', 
      icon: <GraduationCap className="w-4 h-4" />,
      getValue: (course) => course.level 
    },
    { 
      label: 'Subject Area', 
      icon: <FileText className="w-4 h-4" />,
      getValue: (course) => course.subject_area 
    },
    { 
      label: 'Duration', 
      icon: <Clock className="w-4 h-4" />,
      getValue: (course) => course.duration || 'N/A' 
    },
    { 
      label: 'Intake', 
      icon: <Calendar className="w-4 h-4" />,
      getValue: (course) => course.intake || 'N/A' 
    },
    { 
      label: 'Tuition Fee', 
      icon: <DollarSign className="w-4 h-4" />,
      getValue: (course) => course.tuition_fee_min 
        ? `${course.currency === 'GBP' ? '£' : course.currency === 'EUR' ? '€' : '$'}${course.tuition_fee_min.toLocaleString()}/year`
        : 'N/A'
    },
    { 
      label: 'Country', 
      icon: <Globe className="w-4 h-4" />,
      getValue: (course) => course.country 
    },
    { 
      label: 'IELTS Required', 
      icon: <Award className="w-4 h-4" />,
      getValue: (course) => course.ielts_required 
        ? `${course.ielts_overall || 'Yes'}` 
        : 'No'
    },
    { 
      label: 'Application Deadline', 
      icon: <Calendar className="w-4 h-4" />,
      getValue: (course) => course.application_deadline || 'N/A' 
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Courses Selected</h2>
            <p className="text-slate-600 mb-6">
              Please select at least 2 courses to compare from any country page.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Compare Courses</h1>
          <p className="text-slate-600 text-lg">
            Side-by-side comparison of {courses.length} selected courses
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="p-6 text-left bg-slate-50 font-semibold text-slate-700 w-48">
                    Features
                  </th>
                  {courses.map((course) => (
                    <th key={course.id} className="p-6 text-center min-w-64 bg-gradient-to-br from-blue-50 to-purple-50">
                      <div className="flex flex-col items-center gap-2">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {course.level}
                        </Badge>
                        <Link 
                          to={createPageUrl('CourseDetails') + `?id=${course.id}`}
                          className="text-blue-600 hover:underline font-semibold text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    <td className="p-6 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        {row.icon}
                        {row.label}
                      </div>
                    </td>
                    {courses.map((course) => (
                      <td key={course.id} className="p-6 text-center text-slate-600">
                        {row.getValue(course)}
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* Overview Row */}
                <tr className="border-b border-slate-100">
                  <td className="p-6 font-medium text-slate-700 align-top">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Overview
                    </div>
                  </td>
                  {courses.map((course) => (
                    <td key={course.id} className="p-6 text-left text-sm text-slate-600">
                      {course.overview || 'No overview available'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          {courses.map((course) => (
            <Link key={course.id} to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Apply to {course.course_title?.split(' ').slice(0, 3).join(' ')}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}