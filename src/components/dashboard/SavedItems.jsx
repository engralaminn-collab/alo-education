import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Building2, Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SavedItems({ studentProfile }) {
  const { data: favoriteCourses = [] } = useQuery({
    queryKey: ['favorite-courses', studentProfile?.id],
    queryFn: () => base44.entities.FavoriteCourse.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: savedComparisons = [] } = useQuery({
    queryKey: ['saved-comparisons', studentProfile?.id],
    queryFn: () => base44.entities.SavedComparison.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-all'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-all'],
    queryFn: () => base44.entities.University.list(),
  });

  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Heart className="w-5 h-5" />
          Saved Universities & Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="courses">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="courses" className="flex-1">
              Courses ({favoriteCourses.length})
            </TabsTrigger>
            <TabsTrigger value="comparisons" className="flex-1">
              Comparisons ({savedComparisons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {favoriteCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">No saved courses yet</p>
                <Link to={createPageUrl('Courses')}>
                  <Button size="sm" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                    Browse Courses
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteCourses.slice(0, 5).map((fav) => {
                  const course = courseMap[fav.course_id];
                  const university = universityMap[course?.university_id];
                  if (!course) return null;
                  return (
                    <div key={fav.id} className="p-3 border rounded-lg hover:bg-slate-50">
                      <Badge className="mb-2" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                        {course.level}
                      </Badge>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">
                        {course.course_title}
                      </h4>
                      {university && (
                        <div className="flex items-center text-xs text-slate-600 mb-2">
                          <Building2 className="w-3 h-3 mr-1" />
                          {university.university_name || university.name}
                        </div>
                      )}
                      <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                        <Button size="sm" variant="outline" className="w-full mt-2">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  );
                })}
                {favoriteCourses.length > 5 && (
                  <Link to={createPageUrl('MyFavorites')}>
                    <Button variant="ghost" size="sm" className="w-full">
                      View All ({favoriteCourses.length})
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comparisons">
            {savedComparisons.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">No saved comparisons yet</p>
                <Link to={createPageUrl('Universities')}>
                  <Button size="sm" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                    Compare Universities
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedComparisons.map((comparison) => (
                  <div key={comparison.id} className="p-3 border rounded-lg hover:bg-slate-50">
                    <h4 className="font-semibold text-slate-900 text-sm mb-2">
                      {comparison.name || 'University Comparison'}
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">
                      {comparison.university_ids?.length || 0} universities
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      View Comparison
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}