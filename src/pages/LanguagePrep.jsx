import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Award, Clock, Users, TrendingUp, Globe, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';

export default function LanguagePrep() {
  const tests = [
    {
      name: 'IELTS',
      subtitle: 'International English Language Testing System',
      icon: Globe,
      description: 'Most widely accepted English proficiency test worldwide',
      features: ['11,000+ universities', 'Academic & General', 'UK Visa approved', '2-year validity'],
      page: 'IELTSTest',
      color: '#0066CC'
    },
    {
      name: 'PTE Academic',
      subtitle: 'Pearson Test of English',
      icon: Zap,
      description: 'Computer-based test with AI scoring and fast results',
      features: ['2-5 days results', 'No face-to-face', 'UK/AUS accepted', 'AI scoring'],
      page: 'PTETest',
      color: '#F37021'
    },
    {
      name: 'OIETC - ELLT',
      subtitle: 'Oxford International English Test',
      icon: Award,
      description: 'Widely accepted by UK universities and pathway providers',
      features: ['UK pathways', 'Fast results', 'Alternative to IELTS', 'Foundation programs'],
      page: 'OIETCTest',
      color: '#0066CC'
    },
    {
      name: 'TOEFL iBT',
      subtitle: 'Test of English as a Foreign Language',
      icon: BookOpen,
      description: 'Preferred test for USA and Canadian universities',
      features: ['USA/Canada focus', 'Academic English', '6-10 days results', 'University level'],
      page: 'TOEFLTest',
      color: '#F37021'
    },
    {
      name: 'Duolingo English Test',
      subtitle: 'Online English Proficiency Test',
      icon: Target,
      description: 'Affordable, fast online test from home',
      features: ['48-hour results', 'Take from home', 'Lower cost', 'Adaptive format'],
      page: 'DuolingoTest',
      color: '#0066CC'
    },
    {
      name: 'LanguageCert',
      subtitle: 'UKVI Approved English Test',
      icon: CheckCircle,
      description: 'Modern alternative to IELTS with online options',
      features: ['UKVI approved', 'Online option', 'Fast results', 'Growing acceptance'],
      page: 'LanguageCertTest',
      color: '#F37021'
    },
    {
      name: 'Kaplan English Test',
      subtitle: 'University Pathway Test',
      icon: TrendingUp,
      description: 'For Kaplan pathway programs to top UK universities',
      features: ['Pathway entry', 'Fast admission', 'Top universities', 'Academic focus'],
      page: 'KaplanTest',
      color: '#0066CC'
    },
    {
      name: 'OET',
      subtitle: 'Occupational English Test',
      icon: Users,
      description: 'For healthcare professionals and medical students',
      features: ['Healthcare focus', 'Medical context', 'Professional use', 'UK registration'],
      page: 'OETTest',
      color: '#F37021'
    }
  ];

  const otherTests = [
    { name: 'CAE / CPE', description: 'Cambridge Advanced English' },
    { name: 'GRE', description: 'Graduate Record Examination' },
    { name: 'GMAT', description: 'Graduate Management Admission Test' },
    { name: 'SAT', description: 'Scholastic Assessment Test' },
    { name: 'ACT', description: 'American College Testing' }
  ];

  const reasons = [
    'Understand academic lectures and reading materials',
    'Write assignments, essays, and research papers',
    'Communicate confidently with lecturers and peers',
    'Integrate into an English-speaking academic environment'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#0066CC' }}>
              English Language Tests for <span style={{ color: '#F37021' }}>University Entry</span>
            </h1>
            <p className="text-xl text-slate-700 mb-8">
              Choosing the right English language test is a crucial step in your study abroad journey. Universities across the UK, USA, Canada, Australia, and Europe require proof of English proficiency.
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" style={{ backgroundColor: '#F37021', color: '#000000' }} className="font-bold">
                Book Free Consultation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Why Tests are Required */}
        <section className="mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#0066CC' }}>
                Why English Language Tests Are Required for University Admission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-6">
                English language tests assess a student's ability to:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {reasons.map((reason, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0066CC' }} />
                    <span className="text-slate-700">{reason}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-700 mt-6">
                Most universities and visa authorities require international students to submit an approved English test score as part of the admission or visa process.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Main Tests */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#0066CC' }}>
            All English Language Tests
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-white border-2 hover:shadow-xl transition-all h-full group cursor-pointer"
                  style={{ borderColor: '#0066CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F37021'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0066CC'}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: test.color + '15' }}>
                      <test.icon className="w-8 h-8" style={{ color: test.color }} />
                    </div>
                    <CardTitle className="text-xl mb-2 group-hover:text-[#F37021] transition-colors" style={{ color: '#F37021' }}>
                      {test.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600">{test.subtitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700">{test.description}</p>
                    <div className="space-y-2">
                      {test.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-3 h-3" style={{ color: '#0066CC' }} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={createPageUrl(test.page)}>
                      <Button className="w-full font-semibold" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                        Learn More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Other Tests */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#0066CC' }}>Other Standardized Tests</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {otherTests.map((test) => (
              <Card key={test.name} className="border-2" style={{ borderColor: '#0066CC' }}>
                <CardContent className="p-4 text-center">
                  <h4 className="font-bold text-lg mb-1" style={{ color: '#F37021' }}>{test.name}</h4>
                  <p className="text-xs text-slate-600">{test.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#0066CC' }}>
                English Language Tests Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: '#0066CC' }}>
                      <th className="text-left p-4 font-semibold">Test</th>
                      <th className="text-left p-4 font-semibold">Result Time</th>
                      <th className="text-left p-4 font-semibold">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium" style={{ color: '#F37021' }}>IELTS</td>
                      <td className="p-4 text-slate-700">3-13 days</td>
                      <td className="p-4 text-slate-700">UK, AUS, CAN, EU</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium" style={{ color: '#F37021' }}>PTE</td>
                      <td className="p-4 text-slate-700">2-5 days</td>
                      <td className="p-4 text-slate-700">Fast results, UK/AUS</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium" style={{ color: '#F37021' }}>TOEFL</td>
                      <td className="p-4 text-slate-700">6-10 days</td>
                      <td className="p-4 text-slate-700">USA, Canada</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium" style={{ color: '#F37021' }}>Duolingo</td>
                      <td className="p-4 text-slate-700">48 hours</td>
                      <td className="p-4 text-slate-700">Quick, online</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium" style={{ color: '#F37021' }}>OIETC</td>
                      <td className="p-4 text-slate-700">Fast</td>
                      <td className="p-4 text-slate-700">UK Pathways</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium" style={{ color: '#F37021' }}>Uni Test / MOI</td>
                      <td className="p-4 text-slate-700">Immediate</td>
                      <td className="p-4 text-slate-700">Waiver-based entry</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why ALO */}
        <section className="mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#0066CC' }}>
                Why Choose ALO Education for English Test & Admission Support?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-6">
                At ALO Education, we don't just prepare you for English tests — we guide you through your entire study abroad journey.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Free English test counselling',
                  'Test selection based on university & visa rules',
                  'Mock tests and preparation support',
                  'IELTS waiver & alternative pathway guidance',
                  'University admission + visa assistance',
                  'Expert counsellors available 24/7'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-5 h-5" style={{ color: '#0066CC' }} />
                    <span className="font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <Card className="border-0 shadow-xl text-white" style={{ backgroundColor: '#0066CC' }}>
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Start?</h3>
            <p className="mb-6 text-white/90 text-lg">
              Your global education journey starts here. Book a free consultation today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" style={{ backgroundColor: '#F37021', color: '#000000' }} className="font-bold">
                  Book Free Consultation
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="bg-white text-slate-900 hover:bg-slate-100">
                WhatsApp an Expert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}