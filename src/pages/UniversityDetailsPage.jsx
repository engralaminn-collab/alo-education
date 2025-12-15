import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, MapPin, Globe, Award, FileText, 
  BookOpen, ExternalLink, Calendar, Users, Star, DollarSign, TrendingUp, Search, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from '@/components/landing/Footer';
import UniversityFavoriteButton from '@/components/universities/UniversityFavoriteButton';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function UniversityDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const universityId = urlParams.get('id');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseLevel, setCourseLevel] = useState('all');

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

  const { data: testimonials = [] } = useQuery({
    queryKey: ['university-testimonials', university?.university_name],
    queryFn: async () => {
      const allTestimonials = await base44.entities.Testimonial.filter({ 
        status: 'approved',
        university: university?.university_name 
      });
      return allTestimonials.slice(0, 6);
    },
    enabled: !!university?.university_name,
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !courseSearch || 
      course.course_title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.subject_area?.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesLevel = courseLevel === 'all' || course.level === courseLevel;
    return matchesSearch && matchesLevel;
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
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {university.university_name || university.name}
                  </h1>
                  <UniversityFavoriteButton universityId={university.id} size="sm" />
                </div>
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
        {/* Quick Facts Banner */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {university.acceptance_rate && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-3xl font-bold text-emerald-700 mb-1">{university.acceptance_rate}%</div>
                <div className="text-sm text-emerald-600 font-medium">Acceptance Rate</div>
              </CardContent>
            </Card>
          )}
          {(university.tuition_fee_min || university.tuition_fee_max) && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  ${university.tuition_fee_min?.toLocaleString() || 'N/A'} - ${university.tuition_fee_max?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-blue-600 font-medium">Tuition Range</div>
              </CardContent>
            </Card>
          )}
          {university.international_students_percent && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-3xl font-bold text-purple-700 mb-1">{university.international_students_percent}%</div>
                <div className="text-sm text-purple-600 font-medium">International Students</div>
              </CardContent>
            </Card>
          )}
          {university.student_population && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <div className="text-3xl font-bold text-amber-700 mb-1">{university.student_population?.toLocaleString()}</div>
                <div className="text-sm text-amber-600 font-medium">Total Students</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
                <TabsTrigger value="requirements">Entry Requirements</TabsTrigger>
                <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({testimonials.length})</TabsTrigger>
                {university.location && <TabsTrigger value="location">Location</TabsTrigger>}
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
                <div className="space-y-6">
                  {/* Course Filters */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            placeholder="Search courses by name or subject..."
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={courseLevel} onValueChange={setCourseLevel}>
                          <SelectTrigger className="md:w-48">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="All Levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Foundation">Foundation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(courseSearch || courseLevel !== 'all') && (
                        <div className="mt-4 text-sm text-slate-600">
                          Showing {filteredCourses.length} of {courses.length} courses
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Course List */}
                  {filteredCourses.length === 0 ? (
                    <Card className="alo-card">
                      <CardContent className="p-12 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No courses found</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => { setCourseSearch(''); setCourseLevel('all'); }}
                        >
                          Clear Filters
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {filteredCourses.map(course => (
                        <Card key={course.id} className="alo-card hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
                                    {course.level}
                                  </Badge>
                                  {course.scholarship_available && (
                                    <Badge className="bg-amber-100 text-amber-700">
                                      <Award className="w-3 h-3 mr-1" />
                                      Scholarship Available
                                    </Badge>
                                  )}
                                  {course.is_featured && (
                                    <Badge className="bg-purple-100 text-purple-700">
                                      <Star className="w-3 h-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
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
                                      Intake: {course.intake}
                                    </span>
                                  )}
                                  {(course.tuition_fee_min || course.tuition_fee_max) && (
                                    <span className="flex items-center gap-1 font-medium text-slate-700">
                                      <DollarSign className="w-4 h-4" />
                                      {course.tuition_fee_min ? `$${course.tuition_fee_min?.toLocaleString()}` : ''} 
                                      {course.tuition_fee_max ? ` - $${course.tuition_fee_max?.toLocaleString()}` : ''}
                                      {course.currency && course.currency !== 'USD' ? ` ${course.currency}` : ''}
                                    </span>
                                  )}
                                </div>
                                {course.overview && (
                                  <p className="text-sm text-slate-600 mt-3 line-clamp-2">{course.overview}</p>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                                  <Button className="alo-btn-primary">
                                    View Details
                                  </Button>
                                </Link>
                                <Link to={createPageUrl('CourseMatcher')}>
                                  <Button variant="outline" size="sm">
                                    Find Similar
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Student Reviews & Testimonials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testimonials.length === 0 ? (
                      <div className="text-center py-10">
                        <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No reviews available yet</p>
                        <p className="text-sm text-slate-400 mt-2">Be the first to share your experience!</p>
                        <Link to={createPageUrl('SubmitTestimonial')}>
                          <Button className="mt-4" style={{ backgroundColor: 'var(--alo-orange)' }}>
                            Submit Review
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {testimonials.map((testimonial) => (
                          <div key={testimonial.id} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start gap-4">
                              <img
                                src={testimonial.student_photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(testimonial.student_name)}
                                alt={testimonial.student_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-slate-900">{testimonial.student_name}</h4>
                                    <p className="text-sm text-slate-500">
                                      {testimonial.course} {testimonial.country && `• ${testimonial.country}`}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{testimonial.testimonial_text}</p>
                                {testimonial.video_url && (
                                  <a
                                    href={testimonial.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-medium mt-3 hover:underline"
                                    style={{ color: 'var(--alo-blue)' }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Watch Video Testimonial
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <Link to={createPageUrl('TestimonialsPage')}>
                          <Button variant="outline" className="w-full">
                            View All Reviews
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {university.location && (
                <TabsContent value="location">
                  <Card className="alo-card">
                    <CardHeader>
                      <CardTitle className="alo-card-title flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Campus Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {university.location.address && (
                        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500 mb-1">Address</p>
                          <p className="font-medium text-slate-900">{university.location.address}</p>
                          <p className="text-sm text-slate-600 mt-1">{university.city}, {university.country}</p>
                        </div>
                      )}
                      <div className="h-96 rounded-xl overflow-hidden border border-slate-200">
                        <MapContainer
                          center={[university.location.latitude || 0, university.location.longitude || 0]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[university.location.latitude || 0, university.location.longitude || 0]}>
                            <Popup>
                              <strong>{university.university_name}</strong>
                              <br />
                              {university.location.address}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${university.location.latitude},${university.location.longitude}`, '_blank')}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Open in Google Maps
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${university.location.latitude},${university.location.longitude}`, '_blank')}
                        >
                          Get Directions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
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
                  <Link to={createPageUrl('Courses')}>
                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Browse All Courses
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