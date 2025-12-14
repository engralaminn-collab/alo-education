import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, MapPin, Globe, Award, FileText, 
  BookOpen, ExternalLink, Calendar, Users, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';
import UniversityFavoriteButton from '@/components/universities/UniversityFavoriteButton';

export default function UniversityDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const universityId = urlParams.get('id');

  const { data: university, isLoading } = useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      const unis = await base44.entities.University.filter({ id: universityId });
      return unis[0];
    },
    enabled: !!universityId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['university-courses', universityId],
    queryFn: () => base44.entities.Course.filter({ university_id: universityId, status: 'open' }),
    enabled: !!universityId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading university details...</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">University not found</h2>
          <Link to={createPageUrl('Universities')}>
            <Button>Browse Universities</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative h-80 overflow-hidden">
        <img
          src={university.cover_image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200'}
          alt={university.university_name || university.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11, 94, 215, 0.9), rgba(11, 94, 215, 0.6))' }} />
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-8">
            <div className="flex items-start gap-6">
              {university.logo && (
                <img
                  src={university.logo}
                  alt="Logo"
                  className="w-20 h-20 bg-white rounded-xl p-2 shadow-lg"
                />
              )}
              <div className="flex-1 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {university.university_name || university.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{university.city}, {university.country}</span>
                  </div>
                  {university.ranking && (
                    <Badge className="bg-white/20 text-white border-0">
                      <Star className="w-4 h-4 mr-1" />
                      World Ranking #{university.ranking}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="requirements">Entry Requirements</TabsTrigger>
                <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
                <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      About University
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {university.about ? (
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {university.about}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No detailed information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements">
                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Entry Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {university.entry_requirements_summary ? (
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {university.entry_requirements_summary}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">Entry requirements summary not available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scholarships">
                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Scholarships
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {university.scholarships_summary ? (
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {university.scholarships_summary}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Scholarship information not available</p>
                        <p className="text-sm text-slate-400 mt-2">Contact us for scholarship opportunities</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses">
                <div className="space-y-4">
                  {courses.length === 0 ? (
                    <Card className="alo-card">
                      <CardContent className="p-12 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No courses available</p>
                      </CardContent>
                    </Card>
                  ) : (
                    courses.map(course => (
                      <Card key={course.id} className="alo-card hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <Badge className="mb-2" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
                                {course.level}
                              </Badge>
                              <h3 className="text-lg font-bold text-slate-900 mb-2">
                                {course.course_title}
                              </h3>
                              {course.subject_area && (
                                <p className="text-sm text-slate-600 mb-3">{course.subject_area}</p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                {course.duration && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {course.duration}
                                  </span>
                                )}
                                {course.intake && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {course.intake}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                              <Button className="alo-btn-primary">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* Quick Stats */}
              <Card className="alo-card">
                <CardHeader>
                  <CardTitle className="alo-card-title">Quick Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {university.student_population && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <p className="text-sm text-slate-500">Students</p>
                        <p className="font-semibold text-slate-900">
                          {university.student_population.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {university.intakes && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <p className="text-sm text-slate-500">Intakes</p>
                        <p className="font-semibold text-slate-900">{university.intakes}</p>
                      </div>
                    </div>
                  )}

                  {university.international_students_percent && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <p className="text-sm text-slate-500">International Students</p>
                        <p className="font-semibold text-slate-900">
                          {university.international_students_percent}%
                        </p>
                      </div>
                    </div>
                  )}

                  {university.website_url && (
                    <a
                      href={university.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium hover:underline"
                      style={{ color: 'var(--alo-blue)' }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Official Website
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* CTA */}
              <Card style={{ backgroundColor: 'var(--alo-blue)' }} className="text-white border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-3">Interested in This University?</h3>
                  <p className="text-white/90 mb-4">
                    Get personalized guidance from our expert counselors
                  </p>
                  <Link to={createPageUrl('Contact')}>
                    <Button className="alo-btn-primary w-full mb-3">
                      Book Free Consultation
                    </Button>
                  </Link>
                  <Link to={createPageUrl('CourseFinder')}>
                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Browse Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}