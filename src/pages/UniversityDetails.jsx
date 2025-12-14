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
                <div className="space-y-8">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8">
                      <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 leading-relaxed">
                          {university.description || `The ${university.name}, founded in 1413, is the third oldest university in the English-speaking world and the UK's oldest university in Scotland. Situated in a small town on the east coast of Fife, St Andrews has long been a centre of Scottish political, intellectual, and religious life. This history is reflected in the town's distinctive architecture, including the restored medieval colleges of the University, integrating with its historic buildings and landscape.`}
                        </p>
                        <p className="text-slate-600 leading-relaxed mt-4">
                          Scottish undergraduate courses typically last four years, offering students more academic flexibility compared to the three-year degree system in England. At St Andrews, students apply to one of four faculties – Arts, Divinity, Medicine, or Science – and select modules to contribute to their academic programme, encouraging interdisciplinary learning and a more rounded academic experience.
                        </p>
                      </div>

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

                  {/* Services Card */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <Card className="border-0 bg-slate-800 text-white">
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold mb-6">Services</h3>
                        <p className="text-slate-300 leading-relaxed mb-6">
                          The University of St Andrews offers robust support for international students, including pre-sessional and in-sessional English language programmes. The International Advice Service has two dedicated international student advisors who provide support, assisting incoming international students throughout their studies to ensure visa requirements, adjusting to life in the UK, and access to brilliant student welfare services.
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                          They provide opportunities across various disciplines. The University's research reputation is strong, with around 700 research opportunities and a range of research opportunities across various schools and institutes leading to innovative research.
                        </p>
                      </CardContent>
                    </Card>
                    <div>
                      <img 
                        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop"
                        alt="University Services"
                        className="rounded-2xl shadow-lg w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Rankings Card */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Rankings</h3>
                      <ul className="space-y-2 text-slate-600">
                        <li>• 2nd in the Times University Guide 2025</li>
                        <li>• 2nd in the Guardian University Guide 2025</li>
                        <li>• 4th in The Complete University Guide 2026</li>
                        <li>• 185th in the Times Higher Education World University Rankings 2025</li>
                      </ul>
                      <p className="text-slate-600 leading-relaxed mt-6">
                        St Andrews has maintained its position as the top university in Scotland for the last ten years according to The Times University Guide, and it was named the UK University of the Year by The Times and Sunday Times University Guide. Additionally, the University was awarded 2nd in the Teaching Excellence Framework (TEF) for its outstanding teaching and learning environment.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Accommodation Card */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <img 
                        src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop"
                        alt="Student Accommodation"
                        className="rounded-2xl shadow-lg w-full h-full object-cover"
                      />
                    </div>
                    <Card className="border-0 bg-teal-800 text-white">
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold mb-6">Accommodation</h3>
                        <p className="text-teal-100 leading-relaxed mb-4">
                          St Andrews guarantees an offer of university-managed accommodation for all first-year undergraduate and new postgraduate students, provided applications are made by the deadline.
                        </p>
                        <p className="text-teal-100 leading-relaxed mb-4">
                          There are over 4,000 rooms spread across the town, with around 40% of these being catered accommodation. Students can choose from traditional hall of residence living, modern apartments, or themed rooms. Most accommodation is located throughout the town, rather than on a centralised campus, integrating students into the local community.
                        </p>
                        <p className="text-teal-100 leading-relaxed">
                          The range of accommodation options at St Andrews is diverse. From traditional stone-built halls, full of history and character, like St Salvator's Hall, to modern, eco-friendly apartments.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Courses Section */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">Courses offered at {university.name}</h3>
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Search" className="pl-10" />
                        </div>
                      </div>
                      <p className="text-slate-500">Browse available courses</p>
                    </CardContent>
                  </Card>
                </div>
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