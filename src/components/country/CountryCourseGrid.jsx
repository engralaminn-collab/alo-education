import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign, Calendar, TrendingUp, Video, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CountryCourseGrid({ courses, universities, country }) {
  const filteredCourses = courses
    .filter(c => c.country === country && c.status === 'open')
    .slice(0, 8);

  const universityMap = universities.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

  if (filteredCourses.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCourses.map(course => {
        const university = universityMap[course.university_id];
        
        return (
          <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-alo-orange overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-alo-orange to-education-blue p-4 flex items-center justify-center">
              <Badge className="bg-white text-education-blue text-xs px-3 py-1">
                {course.level}
              </Badge>
            </div>

            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-base line-clamp-2 min-h-[2.5rem]">
                {course.course_title}
              </h3>

              <div className="space-y-2 text-sm">
                {university && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 size={14} className="text-education-blue" />
                    <span className="text-xs line-clamp-1">{university.university_name}</span>
                  </div>
                )}

                {course.tuition_fee_min && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={14} className="text-alo-orange" />
                    <span className="font-semibold">
                      {course.currency} {course.tuition_fee_min.toLocaleString()}
                      {course.tuition_fee_max && ` - ${course.tuition_fee_max.toLocaleString()}`}
                    </span>
                  </div>
                )}

                {course.intake && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-education-blue" />
                    <span className="text-xs">{course.intake}</span>
                  </div>
                )}

                {university?.qs_ranking && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp size={14} className="text-alo-orange" />
                    <span className="text-xs">Ranking: #{university.qs_ranking}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Interview Required</span>
                  <Badge variant={course.interview_required ? "destructive" : "secondary"} className="text-xs">
                    {course.interview_required ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Link to={createPageUrl('CourseDetails') + '?id=' + course.id}>
                  <Button variant="outline" className="w-full border-education-blue text-education-blue hover:bg-education-blue hover:text-white gap-2 group-hover:gap-3 transition-all">
                    Learn More
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to={createPageUrl('StudentPortal')}>
                  <Button className="w-full bg-alo-orange hover:bg-alo-orange/90 text-white">
                    Apply Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}