import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function SimilarCourses({ currentCourse, allCourses, universities }) {
  if (!currentCourse || !allCourses) return null;

  const universityMap = universities?.reduce((acc, u) => { acc[u.id] = u; return acc; }, {}) || {};

  // Find similar courses based on subject area, level, and country
  const similarCourses = allCourses
    .filter(course => 
      course.id !== currentCourse.id &&
      course.status === 'open' &&
      (
        course.subject_area === currentCourse.subject_area ||
        course.level === currentCourse.level ||
        course.country === currentCourse.country
      )
    )
    .map(course => {
      // Calculate similarity score
      let score = 0;
      if (course.subject_area === currentCourse.subject_area) score += 3;
      if (course.level === currentCourse.level) score += 2;
      if (course.country === currentCourse.country) score += 1;
      return { ...course, similarityScore: score };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3);

  if (similarCourses.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Similar Courses You May Like</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {similarCourses.map((course, index) => {
          const university = universityMap[course.university_id];
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all group h-full">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Badge className="mb-3" style={{ backgroundColor: '#0B5ED7', color: 'white' }}>
                        {course.level}
                      </Badge>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {course.course_title}
                      </h3>
                      {university && (
                        <div className="flex items-center text-slate-500 text-sm">
                          <Building2 className="w-4 h-4 mr-1" />
                          {university.university_name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                      )}
                      {course.tuition_fee_min && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {course.tuition_fee_min.toLocaleString()} {course.currency}
                        </span>
                      )}
                    </div>

                    <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                      <Button variant="outline" className="w-full group-hover:bg-slate-50">
                        View Course
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}