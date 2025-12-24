import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Building2, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SimilarCoursesUniversities({ studentProfile }) {
  const [activeTab, setActiveTab] = useState('courses');

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  // Get similar courses based on student preferences and applied courses
  const getSimilarCourses = () => {
    const preferredDestinations = studentProfile?.preferred_study_destinations || [];
    const preferredLevel = studentProfile?.admission_preferences?.study_level;
    const preferredSubject = studentProfile?.admission_preferences?.study_area;
    const appliedCourseIds = applications.map(a => a.course_id);

    let similarCourses = courses.filter(course => {
      // Exclude already applied courses
      if (appliedCourseIds.includes(course.id)) return false;

      let score = 0;

      // Match by destination
      if (preferredDestinations.some(dest => 
        course.country?.toLowerCase().includes(dest.toLowerCase())
      )) {
        score += 3;
      }

      // Match by level
      if (preferredLevel && course.level?.toLowerCase() === preferredLevel.toLowerCase()) {
        score += 2;
      }

      // Match by subject area
      if (preferredSubject && (
        course.subject_area?.toLowerCase().includes(preferredSubject.toLowerCase()) ||
        course.course_title?.toLowerCase().includes(preferredSubject.toLowerCase())
      )) {
        score += 3;
      }

      return score > 0;
    });

    // Sort by relevance (we could add more sophisticated scoring)
    return similarCourses.slice(0, 6);
  };

  const getSimilarUniversities = () => {
    const preferredDestinations = studentProfile?.preferred_study_destinations || [];
    const appliedUniversityIds = applications.map(a => a.university_id);

    let similarUniversities = universities.filter(uni => {
      // Exclude already applied universities
      if (appliedUniversityIds.includes(uni.id)) return false;

      // Match by preferred destinations
      return preferredDestinations.some(dest => 
        uni.country?.toLowerCase().includes(dest.toLowerCase())
      );
    });

    // Sort by ranking if available
    similarUniversities.sort((a, b) => {
      if (a.ranking && b.ranking) return a.ranking - b.ranking;
      if (a.ranking) return -1;
      if (b.ranking) return 1;
      return 0;
    });

    return similarUniversities.slice(0, 6);
  };

  const similarCourses = getSimilarCourses();
  const similarUniversities = getSimilarUniversities();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#F37021' }} />
          Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="courses" className="flex-1">
              <BookOpen className="w-4 h-4 mr-2" />
              Similar Courses
            </TabsTrigger>
            <TabsTrigger value="universities" className="flex-1">
              <Building2 className="w-4 h-4 mr-2" />
              Similar Universities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-3 mt-4">
            {similarCourses.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Complete your profile preferences to get personalized course recommendations
              </p>
            ) : (
              similarCourses.map(course => {
                const university = universities.find(u => u.id === course.university_id);
                return (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                        <h4 className="font-semibold hover:text-blue-600 mb-2">
                          {course.course_title}
                        </h4>
                      </Link>
                      {university && (
                        <p className="text-sm text-slate-600 mb-2">{university.university_name}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {course.country}
                        </span>
                        {course.tuition_fee_min && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            £{course.tuition_fee_min.toLocaleString()}
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">{course.level}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
            {similarCourses.length > 0 && (
              <Link to={createPageUrl('Courses')}>
                <Button variant="outline" className="w-full mt-2">
                  View All Courses
                </Button>
              </Link>
            )}
          </TabsContent>

          <TabsContent value="universities" className="space-y-3 mt-4">
            {similarUniversities.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Complete your profile preferences to get personalized university recommendations
              </p>
            ) : (
              similarUniversities.map(uni => (
                <Card key={uni.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                      <div className="flex items-center gap-3">
                        {uni.logo && (
                          <img src={uni.logo} alt={uni.university_name} className="w-12 h-12 object-contain" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold hover:text-blue-600">
                            {uni.university_name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {uni.city}, {uni.country}
                            </span>
                            {uni.ranking && (
                              <Badge style={{ backgroundColor: '#F37021', color: 'white' }} className="text-xs">
                                #{uni.ranking}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
            {similarUniversities.length > 0 && (
              <Link to={createPageUrl('Universities')}>
                <Button variant="outline" className="w-full mt-2">
                  View All Universities
                </Button>
              </Link>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}