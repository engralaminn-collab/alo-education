import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, BookOpen, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PopularCourses({ universityId }) {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['popular-courses', universityId],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.filter({ 
        university_id: universityId, 
        status: 'open' 
      });
      // Return up to 6 courses, prioritizing featured ones
      return allCourses
        .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
        .slice(0, 6);
    },
    enabled: !!universityId,
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No courses available at this university</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
          <TrendingUp className="w-5 h-5" />
          Popular Courses at This University
        </CardTitle>
        <p className="text-slate-500 text-sm">Explore highly sought-after programs</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700">
                      {course.level}
                    </Badge>
                    {course.subject_area && (
                      <Badge variant="outline" className="text-slate-600">
                        {course.subject_area}
                      </Badge>
                    )}
                    {course.is_featured && (
                      <Badge className="bg-amber-100 text-amber-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    {course.course_title}
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                    )}
                    {(course.tuition_fee_min || course.tuition_fee_max) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {course.tuition_fee_min ? 
                          `${course.currency || 'USD'} ${course.tuition_fee_min.toLocaleString()}${course.tuition_fee_max ? ` - ${course.tuition_fee_max.toLocaleString()}` : ''}` 
                          : 'Contact for fees'}
                      </span>
                    )}
                  </div>
                  {course.overview && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {course.overview}
                    </p>
                  )}
                </div>
                <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                  <Button size="sm" variant="ghost" className="shrink-0">
                    View
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        {courses.length >= 6 && (
          <div className="mt-6 text-center">
            <Link to={createPageUrl('Courses') + `?university=${universityId}`}>
              <Button variant="outline" className="w-full">
                View All Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}