import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  GraduationCap, Building2, Clock, TrendingUp, 
  CheckCircle, Monitor, Bell, Calendar, FileCheck,
  MessageSquare, Award, Sun, Briefcase, Heart
} from 'lucide-react';
import Footer from '@/components/landing/Footer';
import CountryHero from '@/components/country/CountryHero';
import WhyChooseCountry from '@/components/country/WhyChooseCountry';
import UniversityGrid from '@/components/country/UniversityGrid';
import CourseFilter from '@/components/country/CourseFilter';
import AIEligibilityChecker from '@/components/country/AIEligibilityChecker';
import StudyJourneyTimeline from '@/components/country/StudyJourneyTimeline';
import TestimonialGrid from '@/components/country/TestimonialGrid';
import CostVisaInfo from '@/components/country/CostVisaInfo';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

export default function StudyInAustralia() {
  const { data: universities = [] } = useQuery({
    queryKey: ['australia-universities'],
    queryFn: async () => {
      const all = await base44.entities.University.filter({ country: 'Australia' }, 'ranking');
      return all.filter(u => u.show_on_country_page !== false);
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['australia-courses'],
    queryFn: async () => {
      return await base44.entities.Course.filter({ country: 'Australia' });
    }
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials-australia'],
    queryFn: async () => {
      const all = await base44.entities.Testimonial.filter({ country: 'Australia', status: 'approved' });
      return all;
    }
  });

  const benefits = [
    {
      icon: <Award className="w-7 h-7 text-white" />,
      title: 'World-class universities',
      description: '7 Australian universities rank in the global top 100, offering exceptional education quality.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Sun className="w-7 h-7 text-white" />,
      title: 'Excellent quality of life',
      description: 'Safe, multicultural cities with high living standards and beautiful landscapes.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-white" />,
      title: '2-4 year work visa',
      description: 'Temporary Graduate visa allows you to work in Australia after graduation.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Briefcase className="w-7 h-7 text-white" />,
      title: 'Part-time work rights',
      description: 'Work up to 48 hours per fortnight while studying to gain experience and support yourself.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <GraduationCap className="w-7 h-7 text-white" />,
      title: 'Innovative teaching',
      description: 'Focus on practical skills and research excellence across all disciplines.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: <Heart className="w-7 h-7 text-white" />,
      title: 'Student support services',
      description: 'Comprehensive support for international students including welfare and career guidance.',
      color: 'from-rose-500 to-red-500'
    }
  ];

  const portalFeatures = [
    { icon: <Monitor className="w-5 h-5 text-white" />, title: 'Application dashboard' },
    { icon: <CheckCircle className="w-5 h-5 text-white" />, title: 'Live tracking' },
    { icon: <FileCheck className="w-5 h-5 text-white" />, title: 'Document upload' },
    { icon: <Award className="w-5 h-5 text-white" />, title: 'GTE statement builder' },
    { icon: <Calendar className="w-5 h-5 text-white" />, title: 'CoE tracking' },
    { icon: <FileCheck className="w-5 h-5 text-white" />, title: 'OSHC management' },
    { icon: <CheckCircle className="w-5 h-5 text-white" />, title: 'Visa checklist' },
    { icon: <Bell className="w-5 h-5 text-white" />, title: 'Smart notifications' },
    { icon: <MessageSquare className="w-5 h-5 text-white" />, title: 'Pre-departure guide' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <CountryHero
        country="Australia"
        flagUrl="https://flagcdn.com/w80/au.png"
        title="Study in Australia"
        subtitle="Discover exceptional education opportunities in Australia with ALO Education Bangladesh. Australia offers high-quality universities, vibrant student life, and excellent post-study work opportunities."
        highlights={[
          { icon: <Building2 className="w-5 h-5 text-white" />, label: '40+ Universities', value: '7 in global top 100' },
          { icon: <Sun className="w-5 h-5 text-white" />, label: 'Great Lifestyle', value: 'Safe & multicultural' },
          { icon: <TrendingUp className="w-5 h-5 text-white" />, label: '2-4 Year Visa', value: 'Post-study work' }
        ]}
        gradientFrom="from-amber-600"
        gradientTo="to-orange-600"
      />

      <WhyChooseCountry country="Australia" benefits={benefits} portalFeatures={portalFeatures} />
      <UniversityGrid universities={universities} country="Australia" />
      <CourseFilter courses={courses} country="Australia" />
      <AIEligibilityChecker country="Australia" />
      <StudyJourneyTimeline />
      <TestimonialGrid testimonials={testimonials} country="Australia" />

      <CostVisaInfo
        tuitionFees={{
          undergraduate: 'AUD 20,000 – 45,000',
          postgraduate: 'AUD 22,000 – 50,000',
          note: 'Vocational and training courses typically cost AUD 4,000 – 22,000 per year'
        }}
        livingCost="AUD 21,041"
        workRights="48 hours per fortnight"
        postStudyWork="2-4 years depending on qualification"
        visaProcessingTime="4-12 weeks"
        additionalInfo={[
          'OSHC (Overseas Student Health Cover) is mandatory',
          'GTE (Genuine Temporary Entrant) statement required',
          'Minimum English: IELTS 5.5-6.5 depending on course',
          'Tuition Protection Service safeguards your investment'
        ]}
      />

      <section className="bg-gradient-to-r from-amber-600 to-orange-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Study Down Under?</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Get personalized guidance from our Australia education specialists.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-amber-900 hover:bg-amber-50 text-lg px-8 py-6 h-auto">
                Book Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('StudentPortal')}>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 h-auto">
                Access Student Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}