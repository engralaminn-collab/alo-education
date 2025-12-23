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
      duration: '~2 hours 45 minutes',
      results: '13 days',
      scoring: 'Band score (0–9)',
      cost: 'Varies by country',
      acceptance: 'Accepted by UK, Australia, Canada, Europe, and many global universities.',
      page: 'IELTSTest',
      icon: Globe
    },
    {
      name: 'IELTS UKVI',
      duration: '~2 hours 45 minutes',
      results: '13 days',
      scoring: 'Band score (0–9)',
      cost: 'Slightly higher than standard IELTS',
      acceptance: 'UK government-approved version of IELTS for visa applications.',
      page: 'IELTSTest',
      icon: Globe
    },
    {
      name: 'PTE Academic',
      duration: '~2 hours',
      results: '2–5 days',
      scoring: '10–90 scale',
      cost: 'Mid-range',
      acceptance: 'Computer-based test accepted by many universities and immigration authorities.',
      page: 'PTETest',
      icon: Zap
    },
    {
      name: 'OIETC – ELLT',
      duration: '~2 hours',
      results: 'Fast',
      scoring: 'Pass-based',
      cost: 'Lower than IELTS',
      acceptance: 'Online English test accepted by selected UK universities.',
      page: 'OIETCTest',
      icon: Award
    },
    {
      name: 'TOEFL iBT',
      duration: '~3 hours',
      results: '6–10 days',
      scoring: '0–120',
      cost: 'Higher than most tests',
      acceptance: 'Widely accepted, especially in the USA and Canada.',
      page: 'TOEFLTest',
      icon: BookOpen
    },
    {
      name: 'Duolingo English Test',
      duration: '~1 hour',
      results: 'Within 48 hours',
      scoring: '10–160',
      cost: 'Low',
      acceptance: 'Online test accepted by many universities globally.',
      page: 'DuolingoTest',
      icon: Target
    },
    {
      name: 'LanguageCert',
      duration: 'Varies',
      results: 'Fast',
      scoring: 'CEFR levels',
      cost: 'Moderate',
      acceptance: 'UK-based English qualification accepted by selected institutions.',
      page: 'LanguageCertTest',
      icon: CheckCircle
    },
    {
      name: 'Kaplan English Test',
      duration: 'Short',
      results: 'Fast',
      scoring: 'Internal scale',
      cost: 'Low',
      acceptance: 'Accepted by Kaplan partner universities.',
      page: 'KaplanTest',
      icon: TrendingUp
    },
    {
      name: 'OET',
      duration: '~3 hours',
      results: '14 days',
      scoring: 'Grade-based',
      cost: 'High',
      acceptance: 'Designed for healthcare courses and professionals.',
      page: 'OETTest',
      icon: Users
    }
  ];

  const academicTests = [
    { name: 'GRE', description: 'Required for many postgraduate programs' },
    { name: 'GMAT', description: 'Required for MBA and business programs' },
    { name: 'SAT', description: 'Undergraduate admission test' },
    { name: 'ACT', description: 'Alternative undergraduate admission test' }
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
              Language Prep Page
            </h1>
            <p className="text-xl text-slate-700 mb-4">
              English tests for university entry
            </p>
            <p className="text-lg text-slate-600 mb-8">
              Access study materials, practice tests, and expert guidance to achieve your required score
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" style={{ backgroundColor: '#F37021', color: 'white' }} className="font-bold">
                Book Free Counselling
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Introduction */}
        <section className="mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#0066CC' }}>
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                English language proficiency is a core requirement for admission to universities in the UK, USA, Canada, Australia, Europe, and other study destinations. Most institutions and visa authorities require proof of English ability to ensure students can understand lectures, complete assignments, and communicate effectively.
              </p>
              <p className="text-slate-700">
                ALO Education helps students select the right English test, prepare efficiently, and meet both university admission and visa compliance requirements with confidence.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Why Take Tests */}
        <section className="mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#0066CC' }}>
                Why take an English language proficiency test to study abroad?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Universities require international students to meet minimum English language standards to ensure academic success. These standards are verified through recognised English proficiency tests such as IELTS, PTE, TOEFL, and others.
              </p>
              <p className="text-slate-700">
                Although these standardised tests can be challenging, the right preparation strategy can significantly improve your score. Many tests also allow retakes, giving students multiple chances to meet their required band or score.
              </p>
              <p className="text-slate-700 font-semibold">
                ALO Education provides personalised English language preparation support, helping students:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Choose the correct test',
                  'Understand test formats and scoring',
                  'Prepare effectively within their timeline',
                  'Meet university and visa requirements'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0066CC' }} />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* English Language Tests */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-3 text-center" style={{ color: '#0066CC' }}>
            English language proficiency tests for international students
          </h2>
          <p className="text-center text-slate-600 mb-8 max-w-3xl mx-auto">
            Understanding the format, duration, scoring system, cost, and acceptance of each test helps students choose the best option for their study plans.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-white border-2 hover:shadow-xl transition-all h-full"
                  style={{ borderColor: '#0066CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F37021'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0066CC'}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0066CC15' }}>
                        <test.icon className="w-6 h-6" style={{ color: '#0066CC' }} />
                      </div>
                      <CardTitle className="text-xl" style={{ color: '#F37021' }}>
                        {test.name}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-slate-700">{test.acceptance}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duration:</span>
                        <span className="font-medium text-slate-900">{test.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Results:</span>
                        <span className="font-medium text-slate-900">{test.results}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Scoring:</span>
                        <span className="font-medium text-slate-900">{test.scoring}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cost:</span>
                        <span className="font-medium text-slate-900">{test.cost}</span>
                      </div>
                    </div>
                    <Link to={createPageUrl(test.page)}>
                      <Button className="w-full font-semibold mt-4" style={{ backgroundColor: '#F37021', color: 'white' }}>
                        Learn More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Academic Tests */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#0066CC' }}>Academic / Aptitude Tests</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {academicTests.map((test) => (
              <Card key={test.name} className="border-2" style={{ borderColor: '#0066CC' }}>
                <CardContent className="p-6 text-center">
                  <h4 className="font-bold text-xl mb-2" style={{ color: '#F37021' }}>{test.name}</h4>
                  <p className="text-sm text-slate-600">{test.description}</p>
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
                Test Comparison Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: '#0066CC' }}>
                      <th className="text-left p-3 font-semibold" style={{ color: '#0066CC' }}>Test</th>
                      <th className="text-left p-3 font-semibold" style={{ color: '#0066CC' }}>Duration</th>
                      <th className="text-left p-3 font-semibold" style={{ color: '#0066CC' }}>Result Time</th>
                      <th className="text-left p-3 font-semibold" style={{ color: '#0066CC' }}>Scoring</th>
                      <th className="text-left p-3 font-semibold" style={{ color: '#0066CC' }}>Cost</th>
                      <th className="text-left p-3 font-semibold" style={{ color: '#0066CC' }}>Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-3 font-semibold" style={{ color: '#F37021' }}>IELTS</td>
                      <td className="p-3 text-slate-700">2h 45m</td>
                      <td className="p-3 text-slate-700">13 days</td>
                      <td className="p-3 text-slate-700">Band 0–9</td>
                      <td className="p-3 text-slate-700">Medium</td>
                      <td className="p-3 text-slate-700">UK, Australia, Canada</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-3 font-semibold" style={{ color: '#F37021' }}>IELTS UKVI</td>
                      <td className="p-3 text-slate-700">2h 45m</td>
                      <td className="p-3 text-slate-700">13 days</td>
                      <td className="p-3 text-slate-700">Band 0–9</td>
                      <td className="p-3 text-slate-700">Slightly higher</td>
                      <td className="p-3 text-slate-700">UK visa</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-3 font-semibold" style={{ color: '#F37021' }}>PTE Academic</td>
                      <td className="p-3 text-slate-700">~2h</td>
                      <td className="p-3 text-slate-700">2–5 days</td>
                      <td className="p-3 text-slate-700">10–90</td>
                      <td className="p-3 text-slate-700">Medium</td>
                      <td className="p-3 text-slate-700">Australia, UK</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-3 font-semibold" style={{ color: '#F37021' }}>TOEFL iBT</td>
                      <td className="p-3 text-slate-700">~3h</td>
                      <td className="p-3 text-slate-700">6–10 days</td>
                      <td className="p-3 text-slate-700">0–120</td>
                      <td className="p-3 text-slate-700">High</td>
                      <td className="p-3 text-slate-700">USA, Canada</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-3 font-semibold" style={{ color: '#F37021' }}>Duolingo</td>
                      <td className="p-3 text-slate-700">~1h</td>
                      <td className="p-3 text-slate-700">48 hours</td>
                      <td className="p-3 text-slate-700">10–160</td>
                      <td className="p-3 text-slate-700">Low</td>
                      <td className="p-3 text-slate-700">Fast applications</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold" style={{ color: '#F37021' }}>OET</td>
                      <td className="p-3 text-slate-700">~3h</td>
                      <td className="p-3 text-slate-700">14 days</td>
                      <td className="p-3 text-slate-700">Grade-based</td>
                      <td className="p-3 text-slate-700">High</td>
                      <td className="p-3 text-slate-700">Healthcare courses</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ALO Support */}
        <section className="mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#0066CC' }}>
                ALO Education – Language Prep Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-6">
                ALO Education provides end-to-end language preparation support, including:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Test selection based on university & visa rules',
                  'Free language assessment',
                  'Score planning strategy',
                  'Study material guidance',
                  'Mock tests & feedback',
                  'Language waiver (MOI) eligibility check',
                  'University-specific acceptance guidance'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0066CC' }} />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-700 mt-6 font-semibold">
                We focus on results, not just registration.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <Card className="border-0 shadow-xl text-white mb-16" style={{ backgroundColor: '#0066CC' }}>
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Not sure which English test you need?</h3>
            <p className="mb-8 text-white/90 text-lg">
              Our experts will guide you based on your profile and destination.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" style={{ backgroundColor: '#F37021', color: 'white' }} className="font-bold">
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('LanguagePrep')}>
                <Button size="lg" variant="outline" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                  Prepare with ALO
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <section>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#0066CC' }}>
                FAQ – Language Tests, Visa & Admission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  q: 'Which English test is best for UK study?',
                  a: 'IELTS or IELTS UKVI, depending on visa requirements.'
                },
                {
                  q: 'Can I apply without IELTS?',
                  a: 'Some universities accept Duolingo, PTE, or MOI, subject to eligibility.'
                },
                {
                  q: 'Is English test mandatory for visa?',
                  a: 'In most cases, yes. Requirements vary by country and course level.'
                },
                {
                  q: "Can I retake the test if I don't meet the score?",
                  a: 'Yes. Most English tests allow multiple attempts.'
                },
                {
                  q: 'Does ALO provide coaching?',
                  a: 'We provide preparation guidance, resources, and strategy support.'
                }
              ].map((faq, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-2" style={{ color: '#0066CC' }}>Q: {faq.q}</h4>
                  <p className="text-slate-700">A: {faq.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
}