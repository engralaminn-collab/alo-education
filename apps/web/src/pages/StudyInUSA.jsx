import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  GraduationCap, Building2, Clock, TrendingUp, 
  CheckCircle, Monitor, Bell, Calendar, FileCheck,
  MessageSquare, Award, Rocket, Briefcase, Users
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

export default function StudyInUSA() {
  const { data: universities = [] } = useQuery({
    queryKey: ['usa-universities'],
    queryFn: async () => {
      const all = await base44.entities.University.filter({ country: 'United States' }, 'ranking');
      return all.filter(u => u.show_on_country_page !== false);
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['usa-courses'],
    queryFn: async () => {
      return await base44.entities.Course.filter({ country: 'United States' });
    }
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials-usa'],
    queryFn: async () => {
      const all = await base44.entities.Testimonial.filter({ country: 'United States', status: 'approved' });
      return all;
    }
  });

  const benefits = [
    {
      icon: <Award className="w-7 h-7 text-white" />,
      title: 'Top-ranked universities',
      description: 'Home to the world\'s best universities including MIT, Harvard, Stanford, and many more.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Rocket className="w-7 h-7 text-white" />,
      title: 'Cutting-edge research',
      description: 'Access to state-of-the-art facilities and groundbreaking research opportunities.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Briefcase className="w-7 h-7 text-white" />,
      title: 'OPT work authorization',
      description: 'Optional Practical Training allows up to 3 years of work experience after graduation (STEM).',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <GraduationCap className="w-7 h-7 text-white" />,
      title: 'Flexible education system',
      description: 'Liberal arts approach allows you to explore diverse subjects before specializing.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Users className="w-7 h-7 text-white" />,
      title: 'Diverse campus life',
      description: 'Vibrant student communities with extensive extracurricular and networking opportunities.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-white" />,
      title: 'Global career prospects',
      description: 'US degrees are highly valued worldwide, opening doors to international careers.',
      color: 'from-rose-500 to-red-500'
    }
  ];

  const portalFeatures = [
    { icon: <Monitor className="w-5 h-5 text-white" />, title: 'Application management' },
    { icon: <CheckCircle className="w-5 h-5 text-white" />, title: 'Status tracking' },
    { icon: <FileCheck className="w-5 h-5 text-white" />, title: 'Document center' },
    { icon: <Award className="w-5 h-5 text-white" />, title: 'SAT/GRE prep resources' },
    { icon: <Calendar className="w-5 h-5 text-white" />, title: 'I-20 tracking' },
    { icon: <FileCheck className="w-5 h-5 text-white" />, title: 'SEVIS fee management' },
    { icon: <CheckCircle className="w-5 h-5 text-white" />, title: 'F-1 visa checklist' },
    { icon: <Bell className="w-5 h-5 text-white" />, title: 'Deadline reminders' },
    { icon: <MessageSquare className="w-5 h-5 text-white" />, title: 'Pre-arrival briefing' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://flagcdn.com/w80/us.png" 
                alt="USA Flag" 
                className="w-16 h-12 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--alo-blue)' }}>
                Study in <span style={{ color: 'var(--alo-orange)' }}>the United States</span>
              </h1>
            </div>
            <p className="text-xl mb-8" style={{ color: 'var(--alo-text)' }}>
              World's top universities, cutting-edge research, and diverse academic opportunities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Courses') + '?country=usa'}>
                <Button size="lg" variant="outline" style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}>
                  Find Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <WhyChooseCountry country="the USA" benefits={benefits} portalFeatures={portalFeatures} />
      <UniversityGrid universities={universities} country="United States" />
      <CourseFilter courses={courses} country="United States" />
      <AIEligibilityChecker country="the USA" />
      <StudyJourneyTimeline />
      <TestimonialGrid testimonials={testimonials} country="United States" />

      <CostVisaInfo
        tuitionFees={{
          undergraduate: '$10,000 – $55,000',
          postgraduate: '$20,000 – $60,000',
          note: 'Community colleges offer more affordable options at $3,000 - $10,000 per year'
        }}
        livingCost="$10,000 – $18,000"
        workRights="On-campus up to 20 hrs/week"
        postStudyWork="1 year OPT (3 years for STEM)"
        visaProcessingTime="2-8 weeks"
        additionalInfo={[
          'SAT/ACT may be optional at many universities',
          'Financial aid and scholarships available for international students',
          'I-20 required for F-1 visa application',
          'SEVIS fee ($350) must be paid before visa interview'
        ]}
      />

        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Intakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <span className="font-medium">Fall (Aug/Sep)</span>
                <Badge className="ml-2 bg-purple-600 text-white text-xs">Main</Badge>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <span className="font-medium">Spring (Jan)</span>
                <Badge className="ml-2 bg-purple-600 text-white text-xs">Major</Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <span className="font-medium">Summer</span>
                <Badge variant="outline" className="ml-2 text-xs">Limited</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl text-white" style={{ backgroundColor: 'var(--alo-blue)' }}>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Study in the USA?</h3>
            <p className="mb-6 text-white/90">
              Get personalized guidance from our expert counselors
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                Book Free Counselling
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