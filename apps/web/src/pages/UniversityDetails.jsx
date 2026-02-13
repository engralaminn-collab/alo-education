import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Star, Users, Globe, Calendar, Building2, 
  GraduationCap, DollarSign, Award, ChevronRight, 
  BookOpen, Clock, ArrowRight, Heart, Share2, ExternalLink,
  Briefcase, CheckCircle2, Sparkles, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import AIUniversitySummary from '@/components/universities/AIUniversitySummary';
import PopularCourses from '@/components/universities/PopularCourses';
import StudentReviews from '@/components/universities/StudentReviews';

export default function UniversityDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const universityId = urlParams.get('id');
  const [saved, setSaved] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

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

  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive and compelling content for ${university.university_name} located in ${university.city}, ${university.country}. World ranking: ${university.ranking || 'N/A'}. Generate the following sections:

1. Location & City Advantage (2-3 sentences about the city and its benefits)
2. Why Choose This University (3-4 key reasons in bullet points)
3. Popular Courses for International Students (5-6 course names)
4. Entry Requirements (academic and language requirements)
5. English Tests Accepted (list tests like IELTS, TOEFL, PTE, etc. with typical scores)
6. Tuition Fees Indicative (ranges for undergrad and postgrad in GBP)
7. Scholarships for Bangladeshi Students (2-3 scholarship opportunities)
8. Intakes (typical intake months)
9. Career & Graduate Route Opportunity (2-3 sentences about job prospects and post-study visa)

Make it professional, engaging, and specific to this university. Use real facts where possible.`,
        response_json_schema: {
          type: "object",
          properties: {
            location_advantage: { type: "string" },
            why_choose: { type: "array", items: { type: "string" } },
            popular_courses: { type: "array", items: { type: "string" } },
            entry_requirements: { 
              type: "object",
              properties: {
                academic: { type: "string" },
                english: { type: "string" }
              }
            },
            english_tests: { type: "array", items: { type: "object", properties: { test: { type: "string" }, score: { type: "string" } } } },
            tuition_fees: {
              type: "object",
              properties: {
                undergraduate: { type: "string" },
                postgraduate: { type: "string" }
              }
            },
            scholarships: { type: "array", items: { type: "string" } },
            intakes: { type: "array", items: { type: "string" } },
            career_opportunity: { type: "string" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
    },
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
                <div className="space-y-6">
                  <AIUniversitySummary university={university} />
                  
                  {/* Generate AI Content Button */}
                  {!generatedContent && (
                    <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
                      <CardContent className="p-6 text-center">
                        <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-2">Generate Comprehensive University Details</h3>
                        <p className="text-blue-700 text-sm mb-4">Get AI-generated insights about location, courses, scholarships, and more</p>
                        <Button 
                          onClick={() => generateContentMutation.mutate()}
                          disabled={generateContentMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {generateContentMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Details
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Location & City Advantage */}
                  {generatedContent?.location_advantage && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-6 h-6 text-blue-600" />
                          <h2 className="text-2xl font-bold text-slate-900">Location & City Advantage</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {generatedContent.location_advantage}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Why Choose This University */}
                  {generatedContent?.why_choose && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="w-6 h-6 text-amber-500" />
                          <h2 className="text-2xl font-bold text-slate-900">Why Choose This University</h2>
                        </div>
                        <ul className="space-y-3">
                          {generatedContent.why_choose.map((reason, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-slate-600">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Popular Courses */}
                  {generatedContent?.popular_courses && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen className="w-6 h-6 text-purple-600" />
                          <h2 className="text-2xl font-bold text-slate-900">Popular Courses for International Students</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {generatedContent.popular_courses.map((course, i) => (
                            <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700 py-2 justify-start">
                              <GraduationCap className="w-4 h-4 mr-2" />
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Entry Requirements */}
                  {generatedContent?.entry_requirements && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">Entry Requirements</h2>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Academic Requirements</h4>
                            <p className="text-slate-600">{generatedContent.entry_requirements.academic}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">English Language Requirements</h4>
                            <p className="text-slate-600">{generatedContent.entry_requirements.english}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* English Tests Accepted */}
                  {generatedContent?.english_tests && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Globe className="w-6 h-6 text-blue-600" />
                          <h2 className="text-2xl font-bold text-slate-900">English Tests Accepted</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {generatedContent.english_tests.map((test, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-900">{test.test}</span>
                              <Badge variant="outline">{test.score}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tuition Fees */}
                  {generatedContent?.tuition_fees && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">Tuition Fees (Indicative)</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-50 rounded-lg">
                            <h4 className="font-semibold text-emerald-900 mb-2">Undergraduate</h4>
                            <p className="text-2xl font-bold text-emerald-700">{generatedContent.tuition_fees.undergraduate}</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Postgraduate</h4>
                            <p className="text-2xl font-bold text-blue-700">{generatedContent.tuition_fees.postgraduate}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Scholarships */}
                  {generatedContent?.scholarships && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="w-6 h-6 text-amber-500" />
                          <h2 className="text-2xl font-bold text-slate-900">Scholarships for Bangladeshi Students</h2>
                        </div>
                        <ul className="space-y-3">
                          {generatedContent.scholarships.map((scholarship, i) => (
                            <li key={i} className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                              <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                              <span className="text-slate-700">{scholarship}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Intakes */}
                  {generatedContent?.intakes && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="w-6 h-6 text-purple-600" />
                          <h2 className="text-2xl font-bold text-slate-900">Intakes</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {generatedContent.intakes.map((intake, i) => (
                            <Badge key={i} className="bg-purple-100 text-purple-700 px-4 py-2 text-base">
                              <Calendar className="w-4 h-4 mr-2" />
                              {intake}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Career Opportunities */}
                  {generatedContent?.career_opportunity && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Briefcase className="w-6 h-6 text-emerald-600" />
                          <h2 className="text-2xl font-bold text-slate-900">Career & Graduate Route Opportunity</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {generatedContent.career_opportunity}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <StudentReviews university={university} />
                </div>
              </TabsContent>

              <TabsContent value="courses">
                <div className="space-y-6">
                  <PopularCourses universityId={universityId} />
                  
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