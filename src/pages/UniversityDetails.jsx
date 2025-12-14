import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Star, Users, Globe, Calendar, Building2, 
  GraduationCap, DollarSign, Award, ChevronRight, 
  BookOpen, Clock, ArrowRight, Heart, Share2, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function UniversityDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const universityId = urlParams.get('id');
  const [saved, setSaved] = useState(false);

  const { data: university, isLoading: uniLoading } = useQuery({
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

  if (uniLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="animate-pulse">
          <div className="h-96 bg-slate-200" />
          <div className="container mx-auto px-6 py-10">
            <div className="h-10 bg-slate-200 rounded w-1/2 mb-4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
      <section className="relative h-[60vh] min-h-[500px]">
        <div className="absolute inset-0">
          <img
            src={university.cover_image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920'}
            alt={university.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative container mx-auto px-6 h-full flex items-end pb-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              {university.ranking && (
                <Badge className="bg-emerald-500 text-white border-0 px-3 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  World Rank #{university.ranking}
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                <MapPin className="w-3 h-3 mr-1" />
                {university.city}, {university.country}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {university.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/80">
              {university.student_population && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{university.student_population.toLocaleString()} Students</span>
                </div>
              )}
              {university.acceptance_rate && (
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>{university.acceptance_rate}% Acceptance Rate</span>
                </div>
              )}
              {university.international_students_percent && (
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <span>{university.international_students_percent}% International</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Link to={createPageUrl('Contact') + `?university=${university.id}`}>
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8">
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setSaved(!saved)}
              >
                <Heart className={`w-5 h-5 mr-2 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="bg-white shadow-sm p-1 rounded-xl">
                <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                <TabsTrigger value="courses" className="rounded-lg">Courses ({courses.length})</TabsTrigger>
                <TabsTrigger value="requirements" className="rounded-lg">Requirements</TabsTrigger>
                <TabsTrigger value="campus" className="rounded-lg">Campus Life</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">About {university.name}</h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {university.description || `${university.name} is a prestigious institution located in ${university.city}, ${university.country}. With a world ranking of #${university.ranking}, it offers exceptional education opportunities for international students seeking quality education abroad.`}
                    </p>

                    {university.facilities && university.facilities.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Campus Facilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {university.facilities.map((facility, i) => (
                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses">
                <div className="space-y-4">
                  {courses.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses listed yet</h3>
                        <p className="text-slate-500">Contact us for available programs</p>
                      </CardContent>
                    </Card>
                  ) : (
                    courses.map((course) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-emerald-50 text-emerald-700 capitalize">
                                    {course.degree_level}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {course.field_of_study?.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{course.name}</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                  {course.duration_months && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {course.duration_months} months
                                    </span>
                                  )}
                                  {course.tuition_fee && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      {course.tuition_fee.toLocaleString()} {course.currency || 'USD'}/year
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                                <Button variant="ghost" className="text-emerald-600">
                                  View Details
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="requirements">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">General Requirements</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">Academic Requirements</h4>
                          <p className="text-slate-600 mt-1">Minimum GPA varies by program. Bachelor's require high school diploma; Master's require bachelor's degree.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">English Proficiency</h4>
                          <p className="text-slate-600 mt-1">IELTS 6.0-7.5 or TOEFL 80-100+ depending on program level.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">Intake Periods</h4>
                          <p className="text-slate-600 mt-1">
                            {university.intake_months?.join(', ') || 'September and January intakes available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="campus">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Campus Life</h2>
                    <p className="text-slate-600 leading-relaxed">
                      Experience vibrant campus life with state-of-the-art facilities, diverse student organizations, 
                      and a welcoming community. From sports facilities to cultural events, there's something for everyone.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-900">{university.city}, {university.country}</span>
                </div>
                {university.tuition_range_min && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-500">Tuition (Annual)</span>
                    <span className="font-medium text-slate-900">
                      ${university.tuition_range_min.toLocaleString()} - ${university.tuition_range_max?.toLocaleString() || '50,000'}
                    </span>
                  </div>
                )}
                {university.acceptance_rate && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-500">Acceptance Rate</span>
                    <span className="font-medium text-slate-900">{university.acceptance_rate}%</span>
                  </div>
                )}
                {university.website && (
                  <a 
                    href={university.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Apply CTA */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
              <CardContent className="p-6 text-center">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Ready to Apply?</h3>
                <p className="text-white/80 mb-6">Get personalized guidance from our expert counselors</p>
                <Link to={createPageUrl('Contact') + `?university=${university.id}`}>
                  <Button className="w-full bg-white text-emerald-600 hover:bg-slate-100">
                    Start Application
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}