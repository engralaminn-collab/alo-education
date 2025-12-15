import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, Users, FileText, Award, Plane, MessageSquare, 
  Home as HomeIcon, Briefcase, Search, Star, Play, Quote,
  MapPin, Globe, BookOpen, Target, Heart, Shield, TrendingUp, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [searchTab, setSearchTab] = useState('courses');
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
    queryKey: ['approved-testimonials'],
    queryFn: () => base44.entities.Testimonial.filter({ status: 'approved' }, '-created_date', 6),
  });

  const destinations = [
    { name: 'United Kingdom', page: 'StudyInUK', flag: '🇬🇧', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80' },
    { name: 'Australia', page: 'StudyInAustralia', flag: '🇦🇺', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80' },
    { name: 'Canada', page: 'StudyInCanada', flag: '🇨🇦', image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&q=80' },
    { name: 'Ireland', page: 'StudyInIreland', flag: '🇮🇪', image: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=800&q=80' },
    { name: 'New Zealand', page: 'StudyInNewZealand', flag: '🇳🇿', image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80' },
    { name: 'USA', page: 'StudyInUSA', flag: '🇺🇸', image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80' },
    { name: 'Dubai', page: 'StudyInDubai', flag: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80' }
  ];

  const services = [
    { icon: MessageSquare, title: 'Counselling', description: 'Expert guidance tailored to your goals' },
    { icon: GraduationCap, title: 'University Selection', description: 'Find the perfect institution for you' },
    { icon: FileText, title: 'Application', description: 'Complete application support' },
    { icon: Award, title: 'Scholarships', description: 'Access funding opportunities' },
    { icon: Plane, title: 'Visa', description: 'Comprehensive visa assistance' },
    { icon: Users, title: 'Interview Prep', description: 'Prepare with confidence' },
    { icon: HomeIcon, title: 'Accommodation', description: 'Find your home abroad' },
    { icon: Briefcase, title: 'Pre-departure', description: 'Get ready for your journey' }
  ];

  const intakeMonths = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 
    'May 2026', 'June 2026', 'July 2026', 'August 2026', 
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  const handleSearch = () => {
    if (searchTab === 'courses') {
      window.location.href = createPageUrl('Courses');
    } else {
      window.location.href = createPageUrl('Universities');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
                  className="text-white text-lg px-8 py-6 hover:opacity-90"
                  style={{ backgroundColor: 'var(--alo-orange)', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  Book Counselling
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600&q=80" 
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
          backgroundImage: 'linear-gradient(rgba(0, 102, 204, 0.9), rgba(0, 102, 204, 0.85)), url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Your Dream of Studying Abroad Starts Here
            </h2>
            <p className="text-xl text-white/90 text-center mb-12" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              ALO Education provides expert counselling, university admissions, and visa support for students worldwide.
            </p>

            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <Tabs value={searchTab} onValueChange={setSearchTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="courses" className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>COURSES</TabsTrigger>
                    <TabsTrigger value="universities" className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>UNIVERSITIES</TabsTrigger>
                  </TabsList>

                  <TabsContent value="courses" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--alo-blue)' }}>I'm looking for:</label>
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
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--alo-blue)' }}>I'm planning to study:</label>
                        <Select value={courseFilters.courseType} onValueChange={(v) => setCourseFilters({...courseFilters, courseType: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bachelor">Bachelor's</SelectItem>
                            <SelectItem value="master">Master's</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--alo-blue)' }}>I want to study in:</label>
                        <Select value={courseFilters.country} onValueChange={(v) => setCourseFilters({...courseFilters, country: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {destinations.map(d => (
                              <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--alo-blue)' }}>For the intake:</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select intake month" />
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
                      onClick={handleSearch}
                      className="w-full text-white py-6 text-lg"
                      style={{ backgroundColor: 'var(--alo-orange)', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Courses
                    </Button>
                  </TabsContent>

                  <TabsContent value="universities" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--alo-blue)' }}>I'm looking for:</label>
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
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--alo-blue)' }}>I want to study in:</label>
                        <Input placeholder="Type university name..." className="bg-white" />
                      </div>
                    </div>

                    <Button 
                      onClick={handleSearch}
                      className="w-full text-white py-6 text-lg"
                      style={{ backgroundColor: 'var(--alo-orange)', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
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
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
            Destinations
          </h2>
          <p className="text-center text-slate-600 mb-12 text-lg" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Explore top study destinations around the world
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, index) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(dest.page)}>
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer">
                    <div className="relative h-48">
                      <img 
                        src={dest.image} 
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {dest.name}
                          </h3>
                          <span className="text-4xl">{dest.flag}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
            Our Services
          </h2>
          <p className="text-center text-slate-600 mb-12 text-lg" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Comprehensive support for your study abroad journey
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full group">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
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

      {/* Section 5: Success Stories / Reviews */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Success Stories
            </h2>
            <p className="text-slate-600 text-lg mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Hear from students who achieved their dreams with ALO Education
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-lg font-semibold">4.9/5 on Google Reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6">
                    <Quote className="w-10 h-10 mb-4" style={{ color: 'var(--alo-orange)' }} />
                    <p className="text-slate-700 mb-6 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {testimonial.testimonial_text}
                    </p>
                    <div className="flex items-center gap-4">
                      {testimonial.student_photo && (
                        <img 
                          src={testimonial.student_photo} 
                          alt={testimonial.student_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--alo-blue)' }}>
                          {testimonial.student_name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {testimonial.university} • {testimonial.country}
                        </p>
                      </div>
                    </div>
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
                className="text-lg"
                style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
              >
                Read More Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}