import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, GraduationCap, Building2, FileText, Award, 
  Plane, MessageSquare, Home as HomeIcon, Briefcase,
  Globe, MapPin, Star, Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const [courseTab, setCourseTab] = useState('courses');
  const [courseFilters, setCourseFilters] = useState({
    subject: '',
    courseType: '',
    country: '',
    intake: []
  });
  const [universityFilters, setUniversityFilters] = useState({
    subject: '',
    university: ''
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => base44.entities.Testimonial.filter({ status: 'approved' }, '-created_date', 3),
  });

  const destinations = [
    { name: 'United Kingdom', page: 'StudyInUK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80' },
    { name: 'Australia', page: 'StudyInAustralia', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80' },
    { name: 'Canada', page: 'StudyInCanada', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80' },
    { name: 'Ireland', page: 'StudyInIreland', image: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=800&q=80' },
    { name: 'New Zealand', page: 'StudyInNewZealand', image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80' },
    { name: 'USA', page: 'StudyInUSA', image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80' },
    { name: 'Dubai', page: 'StudyInDubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80' }
  ];

  const services = [
    { icon: MessageSquare, title: 'Counselling', description: 'Expert guidance tailored to your goals' },
    { icon: Building2, title: 'University Selection', description: 'Find the perfect institution for you' },
    { icon: FileText, title: 'Application', description: 'Complete application support' },
    { icon: Award, title: 'Scholarships', description: 'Maximize your funding opportunities' },
    { icon: Plane, title: 'Visa', description: 'Smooth visa processing assistance' },
    { icon: MessageSquare, title: 'Interview Prep', description: 'Get ready to ace your interviews' },
    { icon: HomeIcon, title: 'Accommodation', description: 'Help finding your home abroad' },
    { icon: Briefcase, title: 'Pre-departure', description: 'Complete preparation before you fly' }
  ];

  const intakeMonths = [
    '2026 Jan', '2026 Feb', '2026 Mar', '2026 Apr', '2026 May', '2026 Jun',
    '2026 Jul', '2026 Aug', '2026 Sep', '2026 Oct', '2026 Nov', '2026 Dec'
  ];

  const handleCourseSearch = () => {
    const params = new URLSearchParams();
    if (courseFilters.subject) params.append('subject', courseFilters.subject);
    if (courseFilters.courseType) params.append('level', courseFilters.courseType);
    if (courseFilters.country) params.append('country', courseFilters.country);
    window.location.href = createPageUrl('Courses') + '?' + params.toString();
  };

  const handleUniversitySearch = () => {
    const params = new URLSearchParams();
    if (universityFilters.subject) params.append('subject', universityFilters.subject);
    if (universityFilters.university) params.append('name', universityFilters.university);
    window.location.href = createPageUrl('Universities') + '?' + params.toString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span style={{ color: 'var(--alo-blue)' }}>Turn your dreams of studying in </span>
                <span style={{ color: 'var(--alo-orange)' }}>Canada</span>
                <span style={{ color: 'var(--alo-blue)' }}> into reality</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                From counselling to admission to visa support — ALO Education is with you at every step.
              </p>
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg" 
                  className="text-white text-lg px-8 py-6"
                  style={{ backgroundColor: 'var(--alo-orange)', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  Book Counselling
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1600&q=80" 
                alt="Study in Canada"
                className="rounded-3xl shadow-2xl w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Course Finder */}
      <section 
        className="py-20 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 102, 204, 0.92)' }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Your Dream of Studying Abroad Starts Here
              </h2>
              <p className="text-xl text-white/90" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                ALO Education provides expert counselling, university admissions, and visa support for students worldwide.
              </p>
            </div>

            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
                  Course Finder
                </h3>

                <Tabs value={courseTab} onValueChange={setCourseTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="courses" className="text-lg font-semibold">COURSES</TabsTrigger>
                    <TabsTrigger value="universities" className="text-lg font-semibold">UNIVERSITIES</TabsTrigger>
                  </TabsList>

                  <TabsContent value="courses" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">I'm looking for:</label>
                        <Select value={courseFilters.subject} onValueChange={(v) => setCourseFilters({...courseFilters, subject: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="computer_science">Computer Science</SelectItem>
                            <SelectItem value="medicine">Medicine</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">I'm planning to study:</label>
                        <Select value={courseFilters.courseType} onValueChange={(v) => setCourseFilters({...courseFilters, courseType: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">I want to study in:</label>
                        <Select value={courseFilters.country} onValueChange={(v) => setCourseFilters({...courseFilters, country: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                            <SelectItem value="ireland">Ireland</SelectItem>
                            <SelectItem value="newzealand">New Zealand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">For the intake:</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select intake month(s)" />
                          </SelectTrigger>
                          <SelectContent>
                            {intakeMonths.map(month => (
                              <SelectItem key={month} value={month}>{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCourseSearch}
                      className="w-full text-white text-lg py-6"
                      style={{ backgroundColor: 'var(--alo-orange)' }}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Courses
                    </Button>
                  </TabsContent>

                  <TabsContent value="universities" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">I'm looking for:</label>
                        <Select value={universityFilters.subject} onValueChange={(v) => setUniversityFilters({...universityFilters, subject: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="computer_science">Computer Science</SelectItem>
                            <SelectItem value="medicine">Medicine</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">I want to study in:</label>
                        <Select value={universityFilters.university} onValueChange={(v) => setUniversityFilters({...universityFilters, university: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country/university" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleUniversitySearch}
                      className="w-full text-white text-lg py-6"
                      style={{ backgroundColor: 'var(--alo-orange)' }}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Universities
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3: Destinations */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Choose Your Destination
            </h2>
            <p className="text-xl text-slate-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Explore world-class education opportunities across the globe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, index) => (
              <Link key={dest.name} to={createPageUrl(dest.page)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <Card className="border-0 shadow-lg overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={dest.image} 
                        alt={dest.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {dest.name}
                        </h3>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Our Services
            </h2>
            <p className="text-xl text-slate-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Comprehensive support for your study abroad journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                    <CardContent className="p-6 text-center">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: index % 2 === 0 ? 'var(--alo-blue)' : 'var(--alo-orange)' }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
                        {service.title}
                      </h3>
                      <p className="text-slate-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Success Stories */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Success Stories
            </h2>
            <p className="text-xl text-slate-600 mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Hear from our students who achieved their dreams
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-lg font-semibold">4.9/5 on Google Reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {testimonial.student_photo ? (
                        <img 
                          src={testimonial.student_photo} 
                          alt={testimonial.student_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: 'var(--alo-blue)' }}>
                          {testimonial.student_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--alo-blue)' }}>
                          {testimonial.student_name}
                        </h4>
                        <p className="text-sm text-slate-600">{testimonial.university}</p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {testimonial.testimonial_text}
                    </p>
                    {testimonial.video_url && (
                      <Button variant="outline" className="mt-4 w-full" style={{ color: 'var(--alo-blue)' }}>
                        <Play className="w-4 h-4 mr-2" />
                        Watch Video
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('TestimonialsPage')}>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2"
                style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}
              >
                View All Success Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}