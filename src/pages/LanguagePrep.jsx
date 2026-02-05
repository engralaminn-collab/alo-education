import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, Calendar, DollarSign, Award, ArrowRight, CheckCircle, MessageSquare } from 'lucide-react';
import Footer from '@/components/landing/Footer';

const englishTests = [
  {
    name: 'IELTS',
    description: 'Accepted by UK, Australia, Canada, Europe, and many global universities.',
    duration: '~2 hours 45 minutes',
    results: '13 days',
    scoring: 'Band score (0–9)',
    cost: 'Varies by country',
    link: 'IELTSPrep'
  },
  {
    name: 'IELTS UKVI',
    description: 'UK government-approved version of IELTS for visa applications.',
    duration: '~2 hours 45 minutes',
    results: '13 days',
    scoring: 'Band score (0–9)',
    cost: 'Slightly higher than standard IELTS',
    link: 'IELTSPrep'
  },
  {
    name: 'PTE Academic',
    description: 'Computer-based test accepted by many universities and immigration authorities.',
    duration: '~2 hours',
    results: '2–5 days',
    scoring: '10–90 scale',
    cost: 'Mid-range',
    link: 'PTEPrep'
  },
  {
    name: 'OIETC – ELLT',
    description: 'Online English test accepted by selected UK universities.',
    duration: '~2 hours',
    results: 'Fast',
    scoring: 'Pass-based',
    cost: 'Lower than IELTS',
    link: null
  },
  {
    name: 'TOEFL iBT',
    description: 'Widely accepted, especially in the USA and Canada.',
    duration: '~3 hours',
    results: '6–10 days',
    scoring: '0–120',
    cost: 'Higher than most tests',
    link: null
  },
  {
    name: 'Duolingo English Test',
    description: 'Online test accepted by many universities globally.',
    duration: '~1 hour',
    results: 'Within 48 hours',
    scoring: '10–160',
    cost: 'Low',
    link: null
  },
  {
    name: 'LanguageCert',
    description: 'UK-based English qualification accepted by selected institutions.',
    duration: 'Varies',
    results: 'Fast',
    scoring: 'CEFR levels',
    cost: 'Moderate',
    link: null
  },
  {
    name: 'Kaplan English Test',
    description: 'Accepted by Kaplan partner universities.',
    duration: 'Short',
    results: 'Fast',
    scoring: 'Internal scale',
    cost: 'Low',
    link: null
  },
  {
    name: 'OET (for Health Professionals)',
    description: 'Designed for healthcare courses and professionals.',
    duration: '~3 hours',
    results: '14 days',
    scoring: 'Grade-based',
    cost: 'High',
    link: null
  },
  {
    name: 'CAE / CPE',
    description: 'Cambridge English advanced certifications.',
    duration: 'Long format',
    results: 'Several weeks',
    scoring: 'Grade-based',
    cost: 'High',
    link: null
  }
];

const academicTests = [
  { name: 'GRE', description: 'Required for many postgraduate programs.' },
  { name: 'GMAT', description: 'Required for MBA and business programs.' },
  { name: 'SAT', description: 'Undergraduate admission test.' },
  { name: 'ACT', description: 'Alternative undergraduate admission test.' }
];

const comparisonData = [
  { test: 'IELTS', duration: '2h 45m', results: '13 days', scoring: 'Band 0–9', cost: 'Medium', bestFor: 'UK, Australia, Canada' },
  { test: 'IELTS UKVI', duration: '2h 45m', results: '13 days', scoring: 'Band 0–9', cost: 'Slightly higher', bestFor: 'UK visa' },
  { test: 'PTE Academic', duration: '~2h', results: '2–5 days', scoring: '10–90', cost: 'Medium', bestFor: 'Australia, UK' },
  { test: 'TOEFL iBT', duration: '~3h', results: '6–10 days', scoring: '0–120', cost: 'High', bestFor: 'USA, Canada' },
  { test: 'Duolingo', duration: '~1h', results: '48 hours', scoring: '10–160', cost: 'Low', bestFor: 'Fast applications' },
  { test: 'OET', duration: '~3h', results: '14 days', scoring: 'Grade-based', cost: 'High', bestFor: 'Healthcare courses' }
];

const faqs = [
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
    q: 'Can I retake the test if I don\'t meet the score?',
    a: 'Yes. Most English tests allow multiple attempts.'
  },
  {
    q: 'Does ALO provide coaching?',
    a: 'We provide preparation guidance, resources, and strategy support.'
  }
];

export default function LanguagePrep() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-education-blue to-alo-orange">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Language Preparation</h1>
          <p className="text-xl md:text-2xl mb-6">
            English tests for university entry
          </p>
          <p className="text-lg mb-8">
            Access study materials, practice tests, and expert guidance to achieve your required score
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button size="lg" className="bg-white text-education-blue hover:bg-white/90 gap-2">
              <MessageSquare size={20} />
              Book Free Counselling
            </Button>
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* Introduction */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              English language proficiency is a core requirement for admission to universities in the UK, USA, Canada, 
              Australia, Europe, and other study destinations. Most institutions and visa authorities require proof of 
              English ability to ensure students can understand lectures, complete assignments, and communicate effectively.
            </p>
            <p>
              ALO Education helps students select the right English test, prepare efficiently, and meet both university 
              admission and visa compliance requirements with confidence.
            </p>
          </div>
        </section>

        {/* Why Take English Tests */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why take an English language proficiency test to study abroad?
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Universities require international students to meet minimum English language standards to ensure academic success. 
              These standards are verified through recognised English proficiency tests such as IELTS, PTE, TOEFL, and others.
            </p>
            <p>
              Although these standardised tests can be challenging, the right preparation strategy can significantly improve 
              your score. Many tests also allow retakes, giving students multiple chances to meet their required band or score.
            </p>
            <p className="font-semibold text-education-blue">ALO Education provides personalised English language preparation support, helping students:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-alo-orange flex-shrink-0 mt-1" size={20} />
                <span>Choose the correct test</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-alo-orange flex-shrink-0 mt-1" size={20} />
                <span>Understand test formats and scoring</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-alo-orange flex-shrink-0 mt-1" size={20} />
                <span>Prepare effectively within their timeline</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-alo-orange flex-shrink-0 mt-1" size={20} />
                <span>Meet university and visa requirements</span>
              </li>
            </ul>
          </div>
        </section>

        {/* English Language Tests */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">English Language Proficiency Tests</h2>
          <p className="text-lg text-gray-600 mb-8">
            Understanding the format, duration, scoring system, cost, and acceptance of each test helps students 
            choose the best option for their study plans.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {englishTests.map((test) => (
              <Card key={test.name} className="border-2 border-education-blue hover:shadow-xl transition-all group">
                <CardHeader className="bg-gradient-to-br from-education-blue/5 to-alo-orange/5">
                  <CardTitle className="text-alo-orange">{test.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-gray-600 min-h-[3rem]">{test.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-education-blue" />
                      <span><strong>Duration:</strong> {test.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-education-blue" />
                      <span><strong>Results:</strong> {test.results}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-education-blue" />
                      <span><strong>Scoring:</strong> {test.scoring}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-education-blue" />
                      <span><strong>Cost:</strong> {test.cost}</span>
                    </div>
                  </div>

                  {test.link ? (
                    <Link to={createPageUrl(test.link)}>
                      <Button className="w-full bg-alo-orange hover:bg-alo-orange/90 gap-2 group-hover:gap-3 transition-all">
                        Learn More
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full bg-alo-orange hover:bg-alo-orange/90" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Academic Tests */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Academic / Aptitude Tests</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {academicTests.map((test) => (
              <Card key={test.name} className="border-2 border-alo-orange hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-education-blue mb-2">{test.name}</h3>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Test Comparison Overview</h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-education-blue to-alo-orange text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Test</th>
                    <th className="px-6 py-4 text-left">Duration</th>
                    <th className="px-6 py-4 text-left">Results</th>
                    <th className="px-6 py-4 text-left">Scoring</th>
                    <th className="px-6 py-4 text-left">Cost</th>
                    <th className="px-6 py-4 text-left">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={row.test} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 font-semibold text-education-blue">{row.test}</td>
                      <td className="px-6 py-4">{row.duration}</td>
                      <td className="px-6 py-4">{row.results}</td>
                      <td className="px-6 py-4">{row.scoring}</td>
                      <td className="px-6 py-4">{row.cost}</td>
                      <td className="px-6 py-4">{row.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ALO Support */}
        <section className="bg-gradient-to-br from-education-blue/10 to-alo-orange/10 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">ALO Education – Language Prep Support</h2>
          <p className="text-lg text-gray-700 mb-6">
            ALO Education provides end-to-end language preparation support, including:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              'Test selection based on university & visa rules',
              'Free language assessment',
              'Score planning strategy',
              'Study material guidance',
              'Mock tests & feedback',
              'Language waiver (MOI) eligibility check',
              'University-specific acceptance guidance'
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="text-alo-orange flex-shrink-0" size={20} />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xl font-bold text-education-blue">We focus on results, not just registration.</p>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">FAQ – Language Tests, Visa & Admission</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-bold text-education-blue mb-2">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-education-blue to-alo-orange rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Not sure which English test you need?</h2>
          <p className="text-xl mb-8">Our experts will guide you based on your profile and destination.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-education-blue hover:bg-white/90">
                Book Free Counselling
              </Button>
            </Link>
            <Link to={createPageUrl('IELTSPrep')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Prepare with ALO
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}