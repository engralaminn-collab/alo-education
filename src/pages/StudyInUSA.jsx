import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, FileText, Home, Star,
  CheckCircle, ArrowRight, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function StudyInUSA() {
  const { data: universities = [] } = useQuery({
    queryKey: ['usa-universities'],
    queryFn: () => base44.entities.University.filter({ country: 'United States', status: 'active' }, '-ranking', 6),
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['usa-testimonials'],
    queryFn: () => base44.entities.Testimonial.filter({ country: 'United States', status: 'approved' }, '-created_date', 3),
  });

  const whyUSA = [
    'Home to world\'s top universities',
    'Diverse range of programs and specializations',
    'Optional Practical Training (OPT) opportunities',
    'Research and innovation hub',
    'Vibrant campus life and networking'
  ];

  const popularCourses = [
    'Computer Science', 'Business Administration', 'Engineering',
    'Data Science', 'Medicine', 'Finance'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section 
        className="relative py-32"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 102, 204, 0.88)' }} />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Study in the <span style={{ color: 'var(--alo-orange)' }}>USA</span>
            </h1>
            <p className="text-xl mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Experience world-leading education, cutting-edge research, and unlimited career opportunities.
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg" 
                className="text-white text-lg px-8 py-6"
                style={{ backgroundColor: 'var(--alo-orange)' }}
              >
                Book Counselling
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why USA */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
            Why Study in the USA?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUSA.map((reason, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6 flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 shrink-0" style={{ color: 'var(--alo-orange)' }} />
                  <p className="font-medium">{reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Universities */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
            Top Universities in the USA
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {universities.slice(0, 6).map((uni) => (
              <Link key={uni.id} to={createPageUrl('UniversityDetailsPage') + `?universityId=${uni.id}`}>
                <Card className="border-0 shadow-md hover:shadow-xl transition-shadow h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--alo-blue)' }}>
                      {uni.university_name}
                    </h3>
                    <p className="text-slate-600 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {uni.city}, {uni.country}
                    </p>
                    {uni.qs_ranking && (
                      <p className="text-sm text-slate-500 mt-2">QS Ranking: {uni.qs_ranking}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link to={createPageUrl('Universities') + '?country=United States'}>
              <Button variant="outline" style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}>
                View All US Universities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
            Popular Courses
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {popularCourses.map((course) => (
              <span 
                key={course} 
                className="px-6 py-3 rounded-full text-white font-medium"
                style={{ backgroundColor: 'var(--alo-blue)' }}
              >
                {course}
              </span>
            ))}
          </div>
          <div className="text-center">
            <Link to={createPageUrl('Courses') + '?country=usa'}>
              <Button 
                size="lg"
                className="text-white"
                style={{ backgroundColor: 'var(--alo-orange)' }}
              >
                Explore All Courses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Visa & Costs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
            Visa & Living Costs
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <DollarSign className="w-12 h-12 mb-4" style={{ color: 'var(--alo-orange)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--alo-blue)' }}>Tuition Fees</h3>
                <p className="text-2xl font-bold text-slate-900 mb-2">USD 25,000 - 55,000</p>
                <p className="text-slate-600">per year (varies by institution)</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Home className="w-12 h-12 mb-4" style={{ color: 'var(--alo-orange)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--alo-blue)' }}>Living Costs</h3>
                <p className="text-2xl font-bold text-slate-900 mb-2">USD 10,000 - 18,000</p>
                <p className="text-slate-600">per year (varies by state)</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <FileText className="w-12 h-12 mb-4" style={{ color: 'var(--alo-orange)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--alo-blue)' }}>Student Visa</h3>
                <p className="text-2xl font-bold text-slate-900 mb-2">USD 185</p>
                <p className="text-slate-600">F-1 visa application fee</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Student Success Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-4">{testimonial.testimonial_text}</p>
                    <div className="flex items-center gap-3">
                      {testimonial.student_photo && (
                        <img src={testimonial.student_photo} alt={testimonial.student_name} className="w-12 h-12 rounded-full" />
                      )}
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--alo-blue)' }}>{testimonial.student_name}</h4>
                        <p className="text-sm text-slate-600">{testimonial.university}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20" style={{ backgroundColor: 'var(--alo-blue)' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Ready to Start Your USA Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Get expert guidance from our counselors
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button 
              size="lg"
              className="text-white text-lg px-8 py-6"
              style={{ backgroundColor: 'var(--alo-orange)' }}
            >
              Book Free Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}