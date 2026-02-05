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
  BookOpen, Clock, ArrowRight, Heart, Share2, ExternalLink,
  Play, Quote, UserCircle, Video
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

  const { data: testimonials = [] } = useQuery({
    queryKey: ['university-testimonials', university?.university_name],
    queryFn: async () => {
      const all = await base44.entities.Testimonial.filter({ 
        university: university.university_name, 
        status: 'approved' 
      });
      return all.slice(0, 6);
    },
    enabled: !!university?.university_name,
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
                <TabsTrigger value="courses" className="rounded-lg">Programs ({courses.length})</TabsTrigger>
                <TabsTrigger value="testimonials" className="rounded-lg">Testimonials</TabsTrigger>
                <TabsTrigger value="campus" className="rounded-lg">Campus</TabsTrigger>
                <TabsTrigger value="requirements" className="rounded-lg">Requirements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">About {university.university_name}</h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">
                      {university.about || `${university.university_name} is a prestigious institution located in ${university.city}, ${university.country}. ${university.ranking ? `With a world ranking of #${university.ranking},` : ''} it offers exceptional education opportunities for international students seeking quality education abroad.`}
                    </p>

                    {/* Rankings Section */}
                    <div className="grid md:grid-cols-3 gap-4 mt-8">
                      {university.ranking && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <Award className="w-4 h-4" />
                            <span className="text-sm font-medium">World Ranking</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900">#{university.ranking}</p>
                        </div>
                      )}
                      {university.qs_ranking && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-emerald-600 mb-1">
                            <Award className="w-4 h-4" />
                            <span className="text-sm font-medium">QS Ranking</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900">#{university.qs_ranking}</p>
                        </div>
                      )}
                      {university.times_ranking && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-purple-600 mb-1">
                            <Award className="w-4 h-4" />
                            <span className="text-sm font-medium">Times Ranking</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900">#{university.times_ranking}</p>
                        </div>
                      )}
                    </div>

                    {/* Scholarships */}
                    {university.scholarships_summary && (
                      <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-100">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-amber-600" />
                          Scholarship Opportunities
                        </h3>
                        <p className="text-slate-600">{university.scholarships_summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses">
                <Card className="border-0 shadow-sm mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Programs Offered</h2>
                        <p className="text-slate-600">Explore {courses.length} programs available at {university.university_name}</p>
                      </div>
                      {university.website_url && (
                        <a 
                          href={university.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Official Courses Page
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {courses.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No programs listed yet</h3>
                        <p className="text-slate-500 mb-4">Contact us for available programs</p>
                        {university.website_url && (
                          <a href={university.website_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                              Visit Official Website
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </a>
                        )}
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
                                  <Badge className="bg-blue-50 text-blue-700">
                                    {course.level}
                                  </Badge>
                                  <Badge variant="outline">
                                    {course.subject_area}
                                  </Badge>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{course.course_title}</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                                  {course.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {course.duration}
                                    </span>
                                  )}
                                  {course.tuition_fee_min && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      {course.currency === 'GBP' ? '£' : course.currency === 'EUR' ? '€' : '$'}
                                      {course.tuition_fee_min.toLocaleString()}/year
                                    </span>
                                  )}
                                  {course.intake && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {course.intake}
                                    </span>
                                  )}
                                </div>
                                {course.overview && (
                                  <p className="text-slate-600 text-sm line-clamp-2">{course.overview}</p>
                                )}
                              </div>
                              <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                                <Button variant="ghost" className="text-blue-600">
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

              <TabsContent value="testimonials">
                {testimonials.length === 0 ? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <Quote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No testimonials yet</h3>
                      <p className="text-slate-500">Student experiences will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {testimonials.map((testimonial) => (
                      <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="border-0 shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                                {testimonial.student_photo ? (
                                  <img 
                                    src={testimonial.student_photo} 
                                    alt={testimonial.student_name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  testimonial.student_name?.charAt(0) || 'S'
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-slate-900">{testimonial.student_name}</h4>
                                    <p className="text-sm text-slate-500">
                                      {testimonial.course} • {testimonial.country}
                                    </p>
                                  </div>
                                  {testimonial.rating && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="relative">
                                  <Quote className="absolute -left-1 -top-1 w-6 h-6 text-slate-200" />
                                  <p className="text-slate-600 pl-6 leading-relaxed">
                                    {testimonial.testimonial_text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="campus">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Campus & Facilities</h2>
                    
                    {/* Campus Image/Virtual Tour */}
                    <div className="relative rounded-xl overflow-hidden mb-8 group">
                      <img 
                        src={university.cover_image || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800'} 
                        alt="Campus"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="lg" variant="secondary" className="gap-2">
                          <Video className="w-5 h-5" />
                          Virtual Campus Tour
                        </Button>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-6">
                      Experience vibrant campus life at {university.university_name} with state-of-the-art facilities, 
                      diverse student organizations, and a welcoming international community. From modern libraries 
                      to sports facilities and cultural events, there's something for everyone.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <Building2 className="w-8 h-8 text-blue-600 mb-2" />
                        <h4 className="font-semibold text-slate-900 mb-1">Modern Facilities</h4>
                        <p className="text-sm text-slate-600">State-of-the-art classrooms and research labs</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <Users className="w-8 h-8 text-emerald-600 mb-2" />
                        <h4 className="font-semibold text-slate-900 mb-1">Student Life</h4>
                        <p className="text-sm text-slate-600">Active clubs, societies, and events</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
                        <h4 className="font-semibold text-slate-900 mb-1">Library & Resources</h4>
                        <p className="text-sm text-slate-600">Extensive academic resources and study spaces</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <Globe className="w-8 h-8 text-amber-600 mb-2" />
                        <h4 className="font-semibold text-slate-900 mb-1">International Support</h4>
                        <p className="text-sm text-slate-600">Dedicated services for international students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Entry Requirements</h2>
                    
                    {university.entry_requirements_summary && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-slate-700">{university.entry_requirements_summary}</p>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">Academic Requirements</h4>
                          <p className="text-slate-600 mt-1">
                            {university.entry_requirements_summary || 
                            'Minimum GPA varies by program. Bachelor\'s require high school diploma; Master\'s require bachelor\'s degree.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">English Proficiency</h4>
                          <p className="text-slate-600 mt-1">IELTS 6.0-7.5 or TOEFL 80-100+ depending on program level.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">Intake Periods</h4>
                          <p className="text-slate-600 mt-1">
                            {university.intakes || 'September and January intakes available'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">Application Deadline</h4>
                          <p className="text-slate-600 mt-1">
                            {university.application_deadline || 'Varies by program - check official website'}
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
                {university.website_url && (
                  <a 
                    href={university.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Visit Official Website
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