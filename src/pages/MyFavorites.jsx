import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Building2, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import FavoriteButton from '@/components/courses/FavoriteButton';

export default function MyFavorites() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', studentProfile?.id],
    queryFn: () => base44.entities.FavoriteCourse.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const favoriteCourses = favorites.map(fav => {
    const course = allCourses.find(c => c.id === fav.course_id);
    return { ...fav, course };
  }).filter(f => f.course);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl font-bold mb-4">My Favorite Courses</h1>
            <p className="text-xl text-slate-300">
              Courses you've saved for later
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {favoriteCourses.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No favorites yet</h2>
            <p className="text-slate-600 mb-6">
              Start exploring courses and save the ones you're interested in!
            </p>
            <Link to={createPageUrl('Courses')}>
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCourses.map((fav, index) => {
              const course = fav.course;
              const university = universityMap[course.university_id];
              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all group h-full">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <Badge style={{ backgroundColor: '#0B5ED7', color: 'white' }}>
                            {course.level}
                          </Badge>
                          <FavoriteButton courseId={course.id} size="icon" />
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                            {course.course_title}
                          </h3>
                          {university && (
                            <div className="flex items-center text-slate-500 text-sm mb-2">
                              <Building2 className="w-4 h-4 mr-1" />
                              {university.university_name}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
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

                        {fav.notes && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600 italic">{fav.notes}</p>
                          </div>
                        )}

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
        )}
      </div>

      <Footer />
    </div>
  );
}