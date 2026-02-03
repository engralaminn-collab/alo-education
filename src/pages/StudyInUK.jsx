import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  GraduationCap, Building2, Clock, TrendingUp, 
  CheckCircle, Monitor, Bell, Calendar, FileCheck,
  MessageSquare, Award, BookOpen
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

export default function StudyInUK() {
  const { data: universities = [] } = useQuery({
    queryKey: ['uk-universities'],
    queryFn: async () => {
      const all = await base44.entities.University.filter({ country: 'United Kingdom' }, 'ranking');
      return all.filter(u => u.show_on_country_page !== false);
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['uk-courses'],
    queryFn: async () => {
      return await base44.entities.Course.filter({ country: 'United Kingdom' });
    }
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials-uk'],
    queryFn: async () => {
      const all = await base44.entities.Testimonial.filter({ country: 'United Kingdom', status: 'approved' });
      return all;
    }
  });

  const benefits = [
    {
      icon: <Building2 className="w-7 h-7 text-white" />,
      title: '3-year undergraduate programs',
      description: 'Complete your bachelor\'s degree faster than most countries, saving both time and money.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Clock className="w-7 h-7 text-white" />,
      title: '1-year master\'s programs',
      description: 'Accelerated postgraduate degrees recognized globally, allowing you to enter the workforce sooner.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-white" />,
      title: '2-year post-study work visa',
      description: 'Graduate Route visa allows you to work or look for work in the UK after completing your degree.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Award className="w-7 h-7 text-white" />,
      title: 'Scholarships for Bangladeshi students',
      description: 'Access to various merit-based and need-based scholarships from universities and external organizations.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <GraduationCap className="w-7 h-7 text-white" />,
      title: 'High academic reputation',
      description: 'Home to world-leading universities with research excellence and globally recognized qualifications.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: <BookOpen className="w-7 h-7 text-white" />,
      title: 'Multicultural environment',
      description: 'Study alongside students from over 200 countries in one of the world\'s most diverse education systems.',
      color: 'from-rose-500 to-red-500'
    }
  ];

  const portalFeatures = [
    { 
      icon: <Monitor className="w-5 h-5 text-white" />, 
      title: 'Online application dashboard',
      description: 'Track all your applications in one place'
    },
    { 
      icon: <CheckCircle className="w-5 h-5 text-white" />, 
      title: 'Live application status tracking',
      description: 'Real-time updates on your application progress'
    },
    { 
      icon: <FileCheck className="w-5 h-5 text-white" />, 
      title: 'Document upload & verification',
      description: 'Secure document submission with instant verification'
    },
    { 
      icon: <Award className="w-5 h-5 text-white" />, 
      title: 'IELTS waiver checker',
      description: 'Check eligibility for English test waivers'
    },
    { 
      icon: <Calendar className="w-5 h-5 text-white" />, 
      title: 'Offer letter timeline',
      description: 'Track expected offer dates and deadlines'
    },
    { 
      icon: <FileCheck className="w-5 h-5 text-white" />, 
      title: 'CAS progress tracker',
      description: 'Monitor your CAS application status'
    },
    { 
      icon: <CheckCircle className="w-5 h-5 text-white" />, 
      title: 'Visa checklist & reminders',
      description: 'Never miss a visa requirement or deadline'
    },
    { 
      icon: <Bell className="w-5 h-5 text-white" />, 
      title: 'WhatsApp, SMS & email alerts',
      description: 'Multi-channel notifications for important updates'
    },
    { 
      icon: <MessageSquare className="w-5 h-5 text-white" />, 
      title: 'Pre-departure training module',
      description: 'Comprehensive orientation before you travel'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <CountryHero
        country="United Kingdom"
        flagUrl="https://flagcdn.com/w80/gb.png"
        title="Study in the United Kingdom"
        subtitle="Unlock a world-class education in the United Kingdom with expert guidance from ALO Education Bangladesh. The UK is home to top-ranked universities, globally recognised degrees, and excellent career opportunities for international students."
        highlights={[
          { 
            icon: <Building2 className="w-5 h-5 text-white" />, 
            label: '160+ Universities', 
            value: 'World-class institutions' 
          },
          { 
            icon: <Clock className="w-5 h-5 text-white" />, 
            label: 'Shorter Degrees', 
            value: '3-year UG, 1-year PG' 
          },
          { 
            icon: <TrendingUp className="w-5 h-5 text-white" />, 
            label: '2-Year Work Visa', 
            value: 'Graduate Route' 
          }
        ]}
        gradientFrom="from-blue-900"
        gradientTo="to-blue-700"
      />

      <WhyChooseCountry
        country="the UK"
        benefits={benefits}
        portalFeatures={portalFeatures}
      />

      <UniversityGrid universities={universities} country="United Kingdom" />

      <CourseFilter courses={courses} country="United Kingdom" />

      <AIEligibilityChecker country="the UK" />

      <StudyJourneyTimeline />

      <TestimonialGrid testimonials={testimonials} country="United Kingdom" />

      <CostVisaInfo
        tuitionFees={{
          undergraduate: '£11,000 – £38,000',
          postgraduate: '£12,000 – £40,000',
          note: 'Exact fees vary by university and subject. Medicine and lab-based courses tend to be higher.'
        }}
        livingCost="£9,000 – £12,000"
        workRights="20 hours/week during term"
        postStudyWork="2 years after graduation"
        visaProcessingTime="15-20 working days"
        additionalInfo={[
          'Dependents can accompany on student visa (certain conditions apply)',
          'Healthcare surcharge (IHS) required for visa application',
          'Bank statement must show funds for tuition + living costs for 9 months',
          'Most universities accept IELTS, PTE, or Duolingo for English proficiency'
        ]}
      />

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your UK Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get personalized guidance from certified counsellors in Bangladesh through our smart CRM-powered system.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-6 h-auto">
                Book Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('StudentPortal')}>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 h-auto"
              >
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