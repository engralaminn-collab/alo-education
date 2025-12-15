import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Globe, Award, MessageSquare, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function EnglishTests() {
  const [expandedTest, setExpandedTest] = useState(null);

  const englishTests = [
    {
      name: 'IELTS',
      fullName: 'International English Language Testing System',
      description: 'The most widely accepted English test globally, required by UK universities and visa authorities.',
      icon: Globe,
      color: 'bg-red-50 text-red-600',
      page: 'IELTSTest'
    },
    {
      name: 'IELTS UKVI',
      fullName: 'IELTS for UK Visas and Immigration',
      description: 'Specific IELTS test required for UK visa applications and some UK university programs.',
      icon: Award,
      color: 'bg-red-50 text-red-700',
      page: 'IELTSUKVITest'
    },
    {
      name: 'PTE Academic',
      fullName: 'Pearson Test of English Academic',
      description: 'Computer-based test with fast results, accepted by universities in UK, Australia, and Canada.',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      page: 'PTETest'
    },
    {
      name: 'OIETC – ELLT',
      fullName: 'Oxford International English Language Test',
      description: 'Accepted by select UK universities for admission purposes.',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600',
      page: 'OIETCTest'
    },
    {
      name: 'TOEFL iBT',
      fullName: 'Test of English as a Foreign Language (Internet-Based)',
      description: 'Popular in US and Canadian universities, measures academic English proficiency.',
      icon: Globe,
      color: 'bg-green-50 text-green-600',
      page: 'TOEFLTest'
    },
    {
      name: 'Duolingo English Test',
      fullName: 'Duolingo English Test',
      description: 'Online, affordable test accepted by universities in USA, Canada, and UK.',
      icon: MessageSquare,
      color: 'bg-emerald-50 text-emerald-600',
      page: 'DuolingoTest'
    },
    {
      name: 'LanguageCert',
      fullName: 'LanguageCert International ESOL',
      description: 'UK-approved English test for university admission and visa purposes.',
      icon: Award,
      color: 'bg-indigo-50 text-indigo-600',
      page: 'LanguageCertTest'
    },
    {
      name: 'Kaplan English Test',
      fullName: 'Kaplan International English Test',
      description: 'Widely accepted English proficiency test for university admissions.',
      icon: BookOpen,
      color: 'bg-cyan-50 text-cyan-600',
      page: 'KaplanTest'
    },
    {
      name: 'OET (for Health)',
      fullName: 'Occupational English Test',
      description: 'English test for healthcare professionals seeking to practice in English-speaking countries.',
      icon: CheckCircle,
      color: 'bg-pink-50 text-pink-600',
      page: 'OETTest'
    },
    {
      name: 'CAE / CPE',
      fullName: 'Cambridge Advanced / Proficiency English',
      description: 'Advanced Cambridge English qualifications accepted by universities worldwide.',
      icon: Award,
      color: 'bg-orange-50 text-orange-600',
      page: 'CambridgeTest'
    }
  ];

  const aptitudeTests = [
    {
      name: 'GRE',
      fullName: 'Graduate Record Examination',
      description: 'Required for most graduate programs in USA, measures verbal, quantitative, and analytical writing.',
      icon: BookOpen,
      color: 'bg-violet-50 text-violet-600',
      page: 'GRETest'
    },
    {
      name: 'GMAT',
      fullName: 'Graduate Management Admission Test',
      description: 'Required for MBA and business school admissions, assesses analytical and problem-solving skills.',
      icon: Award,
      color: 'bg-blue-50 text-blue-700',
      page: 'GMATTest'
    },
    {
      name: 'SAT',
      fullName: 'Scholastic Assessment Test',
      description: 'Standardized test for undergraduate admissions in US universities.',
      icon: FileText,
      color: 'bg-teal-50 text-teal-600',
      page: 'SATTest'
    },
    {
      name: 'ACT',
      fullName: 'American College Testing',
      description: 'Alternative to SAT for US undergraduate admissions, tests English, math, reading, and science.',
      icon: CheckCircle,
      color: 'bg-amber-50 text-amber-600',
      page: 'ACTTest'
    }
  ];

  const whyTakeTest = [
    'Universities require international students to meet specific English language proficiency standards',
    'Ensures you can understand course materials and successfully complete your studies',
    'Required for visa applications in most English-speaking countries',
    'Standardized tests provide consistent evaluation across institutions',
    'Many tests allow retakes to help you achieve the required score'
  ];

  const testComparison = [
    { test: 'IELTS', duration: '2h 45m', results: '13 days', score: '0-9 bands', cost: '$190-240', page: 'IELTSTest' },
    { test: 'IELTS UKVI', duration: '2h 45m', results: '13 days', score: '0-9 bands', cost: '$235-250', page: 'IELTSUKVITest' },
    { test: 'PTE Academic', duration: '2h', results: '48 hours', score: '10-90', cost: '$200-250', page: 'PTETest' },
    { test: 'OIETC – ELLT', duration: '2h 30m', results: '10 days', score: 'A1-C2', cost: '$150-180', page: 'OIETCTest' },
    { test: 'TOEFL iBT', duration: '3h', results: '6 days', score: '0-120', cost: '$180-300', page: 'TOEFLTest' },
    { test: 'Duolingo', duration: '1h', results: '48 hours', score: '10-160', cost: '$59', page: 'DuolingoTest' },
    { test: 'LanguageCert', duration: '2h 30m', results: '3-5 days', score: 'A1-C2', cost: '$130-160', page: 'LanguageCertTest' },
    { test: 'Kaplan', duration: '2h', results: '7 days', score: 'A1-C2', cost: '$150-200', page: 'KaplanTest' },
    { test: 'OET', duration: '3h', results: '16 days', score: 'A-E grades', cost: '$575', page: 'OETTest' },
    { test: 'CAE/CPE', duration: '4h', results: '3 weeks', score: '160-230', cost: '$180-220', page: 'CambridgeTest' },
    { test: 'GRE', duration: '3h 45m', results: '10-15 days', score: '260-340', cost: '$220', page: 'GRETest' },
    { test: 'GMAT', duration: '3h 7m', results: 'Instant', score: '200-800', cost: '$275', page: 'GMATTest' },
    { test: 'SAT', duration: '3h', results: '2-4 weeks', score: '400-1600', cost: '$60-115', page: 'SATTest' },
    { test: 'ACT', duration: '3h 35m', results: '2-8 weeks', score: '1-36', cost: '$60-85', page: 'ACTTest' }
  ];

  const faqs = [
    {
      question: 'Which English test is best for UK visa applications?',
      answer: 'IELTS UKVI and IELTS Academic are the most widely accepted for UK visa purposes. Some institutions also accept PTE Academic, LanguageCert, and other SELT-approved tests.'
    },
    {
      question: 'Can I study abroad without IELTS?',
      answer: 'Yes, some universities accept alternatives like PTE, TOEFL, Duolingo, or may offer internal English tests. Some also waive English requirements for students from English-medium backgrounds.'
    },
    {
      question: 'How long are test scores valid?',
      answer: 'Most English test scores are valid for 2 years from the test date. Check specific university and visa requirements as they may vary.'
    },
    {
      question: 'What score do I need for university admission?',
      answer: 'Requirements vary by university and program. Typically, undergraduate programs require IELTS 6.0-6.5, while postgraduate programs require 6.5-7.0. Some competitive programs may require higher scores.'
    },
    {
      question: 'How can ALO Education help with test preparation?',
      answer: 'We provide personalized test selection guidance, study materials, practice tests, expert training, and ongoing support to help you achieve your target score.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative py-32"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 102, 204, 0.88)' }} />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              English Tests for <span style={{ color: 'var(--alo-orange)' }}>University Entry</span>
            </h1>
            <p className="text-xl mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Access study materials, practice tests, and expert guidance to achieve your required score
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg" 
                className="text-white text-lg px-8 py-6"
                style={{ backgroundColor: 'var(--alo-orange)' }}
              >
                Book Free Counselling
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Intro Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-slate-700 leading-relaxed">
              English language proficiency is a core requirement for admission to universities in the UK, USA, Canada, Australia, Europe, and beyond. 
              ALO Education helps students choose the right test, prepare effectively, and meet both university and visa requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Why Take English Language Proficiency Test */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Why Take an English Language Proficiency Test to Study Abroad?
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto text-lg">
              Universities require international students to meet specific English language proficiency standards to ensure they can understand course materials and successfully complete their studies.
            </p>
            
            <div className="space-y-4">
              {whyTakeTest.map((reason, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-6 flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 shrink-0" style={{ color: 'var(--alo-orange)' }} />
                    <p className="text-slate-700 font-medium">{reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-12 p-8 rounded-2xl" style={{ backgroundColor: 'var(--alo-blue)' }}>
              <p className="text-white text-center text-lg">
                <strong>ALO Education's English language training courses</strong> offer personalized support to help you improve your English proficiency and secure the score you need for admission to your chosen university.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* English Language Proficiency Tests */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              English Language Proficiency Tests for International Students
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto text-lg">
              Understanding the format, scoring system, and requirements for each proficiency exam can help you choose the test that best aligns with your study abroad plans.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {englishTests.map((test, index) => (
                <Card 
                  key={index} 
                  className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer h-full group bg-white"
                  style={{ borderColor: 'var(--alo-blue)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--alo-orange)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--alo-blue)'}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
                      {test.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 flex-grow">
                      {test.description}
                    </p>
                    <Link to={createPageUrl(test.page)}>
                      <Button 
                        className="w-full text-white mt-auto"
                        style={{ backgroundColor: 'var(--alo-orange)' }}
                      >
                        Learn More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Academic / Aptitude Tests */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Academic / Aptitude Tests
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto text-lg">
              Standardized tests required for graduate and undergraduate admissions in USA and other countries.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aptitudeTests.map((test, index) => (
                <Card 
                  key={index}
                  className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer h-full bg-white"
                  style={{ borderColor: 'var(--alo-blue)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--alo-orange)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--alo-blue)'}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
                      {test.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 flex-grow">
                      {test.description}
                    </p>
                    <Link to={createPageUrl(test.page)}>
                      <Button 
                        className="w-full text-white mt-auto"
                        style={{ backgroundColor: 'var(--alo-orange)' }}
                      >
                        Learn More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Test Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Compare Tests: Duration, Results, Score & Cost
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-lg rounded-xl overflow-hidden">
                <thead>
                  <tr style={{ backgroundColor: 'var(--alo-blue)' }}>
                    <th className="p-4 text-left text-white font-bold">Test</th>
                    <th className="p-4 text-left text-white font-bold">Duration</th>
                    <th className="p-4 text-left text-white font-bold">Results</th>
                    <th className="p-4 text-left text-white font-bold">Score Range</th>
                    <th className="p-4 text-left text-white font-bold">Cost</th>
                    <th className="p-4 text-left text-white font-bold"></th>
                  </tr>
                </thead>
                <tbody>
                  {testComparison.map((test, index) => (
                    <tr 
                      key={index} 
                      className="border-b hover:bg-slate-50 transition-colors"
                      style={{ borderColor: '#e2e8f0' }}
                    >
                      <td className="p-4 font-bold" style={{ color: 'var(--alo-blue)' }}>{test.test}</td>
                      <td className="p-4 text-slate-600">{test.duration}</td>
                      <td className="p-4 text-slate-600">{test.results}</td>
                      <td className="p-4 text-slate-600">{test.score}</td>
                      <td className="p-4 text-slate-600 font-semibold">{test.cost}</td>
                      <td className="p-4">
                        <Link to={createPageUrl(test.page)}>
                          <Button 
                            size="sm"
                            variant="outline"
                            style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}
                          >
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ALO Support Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              How ALO Education Helps You Succeed
            </h2>
            <p className="text-center text-slate-600 mb-12 text-lg">
              From test selection to achieving your target score, we're with you every step of the way
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--alo-orange)' }}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--alo-blue)' }}>Personalized Test Selection</h3>
                  <p className="text-slate-600">
                    We help you choose the right English test based on your target country, university requirements, and personal strengths.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--alo-orange)' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--alo-blue)' }}>Expert Training & Materials</h3>
                  <p className="text-slate-600">
                    Access comprehensive study materials, practice tests, and expert-led training sessions tailored to your chosen test.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--alo-orange)' }}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--alo-blue)' }}>Score Improvement Guarantee</h3>
                  <p className="text-slate-600">
                    Our proven methods and personalized coaching help you achieve significant score improvements and reach your target.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--alo-orange)' }}>
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--alo-blue)' }}>Visa & University Support</h3>
                  <p className="text-slate-600">
                    We ensure your test scores meet both university admission and visa requirements for your destination country.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg"
                  className="text-white text-lg px-8 py-6 mr-4"
                  style={{ backgroundColor: 'var(--alo-orange)' }}
                >
                  Prepare with ALO
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-2 rounded-xl px-6"
                  style={{ borderColor: 'var(--alo-blue)' }}
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-bold text-lg" style={{ color: 'var(--alo-blue)' }}>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--alo-blue)' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Ready to Achieve Your Target Score?
          </h2>
          <p className="text-xl text-white/90 mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Get personalized guidance and expert training from ALO Education
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button 
              size="lg"
              className="text-white text-lg px-8 py-6"
              style={{ backgroundColor: 'var(--alo-orange)' }}
            >
              Book Free Consultation
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}