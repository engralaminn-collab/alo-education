import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  GraduationCap, Building2, Clock, TrendingUp, 
  CheckCircle, Monitor, Bell, Calendar, FileCheck,
  MessageSquare, Award, MapPin, Users, DollarSign
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

export default function StudyInCanada() {
  const { data: universities = [] } = useQuery({
    queryKey: ['canada-universities'],
    queryFn: async () => {
      const all = await base44.entities.University.filter({ country: 'Canada' }, 'ranking');
      return all.filter(u => u.show_on_country_page !== false);
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['canada-courses'],
    queryFn: async () => {
      return await base44.entities.Course.filter({ country: 'Canada' });
    }
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials-canada'],
    queryFn: async () => {
      const all = await base44.entities.Testimonial.filter({ country: 'Canada', status: 'approved' });
      return all;
    }
  });

  const benefits = [
    {
      icon: <DollarSign className="w-7 h-7 text-white" />,
      title: 'Affordable tuition fees',
      description: 'Lower tuition costs compared to US and UK, making quality education accessible.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: <Users className="w-7 h-7 text-white" />,
      title: 'Multicultural society',
      description: 'Welcoming environment with diverse communities from around the world.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-white" />,
      title: 'Post-graduation work permit',
      description: 'Up to 3 years of work permit after graduation, leading to PR opportunities.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Award className="w-7 h-7 text-white" />,
      title: 'Top-ranked institutions',
      description: 'Home to universities consistently ranked among the world\'s best.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <CheckCircle className="w-7 h-7 text-white" />,
      title: 'Co-op programs',
      description: 'Gain valuable work experience during your studies through co-op placements.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <MapPin className="w-7 h-7 text-white" />,
      title: 'Pathway to PR',
      description: 'Clear immigration pathways for international students to become permanent residents.',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  const portalFeatures = [
    { icon: <Monitor className="w-5 h-5 text-white" />, title: 'Application tracking dashboard' },
    { icon: <CheckCircle className="w-5 h-5 text-white" />, title: 'Real-time status updates' },
    { icon: <FileCheck className="w-5 h-5 text-white" />, title: 'Document management system' },
    { icon: <Award className="w-5 h-5 text-white" />, title: 'SDS eligibility checker' },
    { icon: <Calendar className="w-5 h-5 text-white" />, title: 'LOA tracking' },
    { icon: <FileCheck className="w-5 h-5 text-white" />, title: 'GIC process guidance' },
    { icon: <CheckCircle className="w-5 h-5 text-white" />, title: 'Study permit checklist' },
    { icon: <Bell className="w-5 h-5 text-white" />, title: 'Multi-channel alerts' },
    { icon: <MessageSquare className="w-5 h-5 text-white" />, title: 'Pre-departure orientation' }
  ];

  return (
<<<<<<< HEAD
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
                src="https://flagcdn.com/w80/ca.png" 
                alt="Canada Flag" 
                className="w-16 h-12 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--alo-blue)' }}>
                Study in <span style={{ color: 'var(--alo-orange)' }}>Canada</span>
              </h1>
            </div>
            <p className="text-xl mb-8" style={{ color: 'var(--alo-text)' }}>
              Affordable education, multicultural environment, and excellent immigration pathways.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Courses') + '?country=canada'}>
                <Button size="lg" variant="outline" style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}>
                  Find Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
=======
    <div className="min-h-screen bg-white">
      <CountryHero
        country="Canada"
        flagUrl="https://flagcdn.com/w80/ca.png"
        title="Study in Canada"
        subtitle="Experience world-class education in Canada with ALO Education Bangladesh. Canada offers affordable tuition, a multicultural environment, and excellent immigration pathways for international students."
        highlights={[
          { icon: <Building2 className="w-5 h-5 text-white" />, label: '100+ Universities', value: 'Top-ranked globally' },
          { icon: <DollarSign className="w-5 h-5 text-white" />, label: 'Affordable', value: 'Lower cost than US/UK' },
          { icon: <TrendingUp className="w-5 h-5 text-white" />, label: '3-Year PGWP', value: 'Post-graduation work' }
        ]}
        gradientFrom="from-red-600"
        gradientTo="to-red-700"
      />
>>>>>>> last/main

      <WhyChooseCountry country="Canada" benefits={benefits} portalFeatures={portalFeatures} />
      <UniversityGrid universities={universities} country="Canada" />
      <CourseFilter courses={courses} country="Canada" />
      <AIEligibilityChecker country="Canada" />
      <StudyJourneyTimeline />
      <TestimonialGrid testimonials={testimonials} country="Canada" />

      <CostVisaInfo
        tuitionFees={{
          undergraduate: 'CAD 15,000 – 35,000',
          postgraduate: 'CAD 18,000 – 40,000',
          note: 'College programs typically range from CAD 7,000 – 22,000 per year'
        }}
        livingCost="CAD 10,000 – 15,000"
        workRights="20 hours/week during semester"
        postStudyWork="Up to 3 years PGWP"
        visaProcessingTime="4-12 weeks"
        additionalInfo={[
          'SDS stream available for faster visa processing',
          'GIC (Guaranteed Investment Certificate) required for SDS applicants',
          'Spouse can get open work permit while you study',
          'Provincial Nominee Programs available for PR pathway'
        ]}
      />

<<<<<<< HEAD
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Intakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <span className="font-medium">January</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <span className="font-medium">May</span>
                <Badge variant="outline" className="ml-2 text-xs">Limited</Badge>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <span className="font-medium">September</span>
                <Badge className="ml-2 bg-purple-600 text-white text-xs">Main</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl text-white" style={{ backgroundColor: 'var(--alo-blue)' }}>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Study in Canada?</h3>
            <p className="mb-6 text-white/90">
              Get personalized guidance from our expert counselors
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                Book Free Counselling
=======
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Study in Canada?</h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Get expert guidance from our certified Canadian education consultants.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-red-900 hover:bg-red-50 text-lg px-8 py-6 h-auto">
                Book Free Consultation
>>>>>>> last/main
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