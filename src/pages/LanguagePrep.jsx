import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, BookOpen, Award, CheckCircle, Clock, DollarSign, Globe, Users, MessageCircle } from 'lucide-react';
import Footer from '@/components/landing/Footer';

const englishTests = [
  { id: 'ielts', name: 'IELTS', fullName: 'International English Language Testing System' },
  { id: 'ielts-ukvi', name: 'IELTS UKVI', fullName: 'IELTS for UK Visas and Immigration' },
  { id: 'pte', name: 'PTE Academic', fullName: 'Pearson Test of English Academic' },
  { id: 'oietc', name: 'OIETC – ELLT', fullName: 'English Language Literacy Test' },
  { id: 'toefl', name: 'TOEFL iBT', fullName: 'Test of English as a Foreign Language' },
  { id: 'duolingo', name: 'Duolingo English Test', fullName: 'Duolingo English Test' },
  { id: 'languagecert', name: 'LanguageCert', fullName: 'LanguageCert International ESOL' },
  { id: 'kaplan', name: 'Kaplan English Test', fullName: 'Kaplan International English Test' },
  { id: 'oet', name: 'OET', fullName: 'Occupational English Test (for Health)' },
  { id: 'cae', name: 'CAE / CPE', fullName: 'Cambridge Advanced English' }
];

const academicTests = [
  { id: 'gre', name: 'GRE', fullName: 'Graduate Record Examination' },
  { id: 'gmat', name: 'GMAT', fullName: 'Graduate Management Admission Test' },
  { id: 'sat', name: 'SAT', fullName: 'Scholastic Assessment Test' },
  { id: 'act', name: 'ACT', fullName: 'American College Testing' }
];

const testComparison = [
  { test: 'IELTS', duration: '2h 45m', scoreRange: '0-9', cost: '£170-190', results: '3-13 days', accepted: 'UK, USA, Canada, Australia, Europe' },
  { test: 'IELTS UKVI', duration: '2h 45m', scoreRange: '0-9', cost: '£190-220', results: '3-13 days', accepted: 'UK (Visa purposes)' },
  { test: 'PTE Academic', duration: '2h', scoreRange: '10-90', cost: '£155-170', results: '2-5 days', accepted: 'UK, USA, Canada, Australia, New Zealand' },
  { test: 'TOEFL iBT', duration: '3h', scoreRange: '0-120', cost: '£180-200', results: '6-10 days', accepted: 'USA, Canada, UK, Europe' },
  { test: 'Duolingo', duration: '1h', scoreRange: '10-160', cost: '$59', results: '2 days', accepted: 'USA, Canada, UK (select universities)' },
  { test: 'LanguageCert', duration: '2h 45m', scoreRange: 'A1-C2', cost: '£95-150', results: '3-5 days', accepted: 'UK, USA, Canada' },
  { test: 'OET', duration: '3h', scoreRange: 'A-E', cost: '£290', results: '16 days', accepted: 'UK, Australia (Healthcare)' },
];

const faqs = [
  {
    question: 'Which English test should I take for my university application?',
    answer: 'The choice depends on your destination country and university requirements. IELTS and PTE Academic are widely accepted globally. IELTS UKVI is specifically required for UK student visas. TOEFL iBT is popular for US universities. We recommend checking your chosen universities\' specific requirements.'
  },
  {
    question: 'Can I use my English test score for both admission and visa?',
    answer: 'In most cases, yes. However, for UK student visas, you must take IELTS UKVI (not regular IELTS) at a UKVI-approved test center. Other countries typically accept standard test results for both admission and visa purposes.'
  },
  {
    question: 'How long is my English test score valid?',
    answer: 'Most English test scores are valid for 2 years from the test date. However, some universities may have different validity requirements, so always check with your chosen institutions.'
  },
  {
    question: 'What score do I need to get admission?',
    answer: 'Required scores vary by university, program, and level of study. Undergraduate programs typically require IELTS 6.0-6.5, while postgraduate programs often require 6.5-7.0. Some competitive programs may require higher scores. We can help you identify the exact requirements for your target universities.'
  },
  {
    question: 'Can I retake the test if I don\'t get my required score?',
    answer: 'Yes, all English proficiency tests allow retakes. There\'s usually a minimum waiting period between attempts (typically 3-7 days depending on the test). With proper preparation, many students improve their scores on retake.'
  },
  {
    question: 'Does ALO Education provide test preparation courses?',
    answer: 'Yes! We offer comprehensive preparation courses for IELTS, PTE, TOEFL, and other English tests. Our courses include practice materials, mock tests, expert guidance, and personalized feedback to help you achieve your target score.'
  }
];

export default function LanguagePrep() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const TestCard = ({ test, type = 'english' }) => (
    <Card 
      className="border-2 transition-all duration-300 h-full"
      style={{ 
        borderColor: hoveredCard === test.id ? 'var(--alo-orange)' : 'var(--alo-blue)',
        backgroundColor: 'white'
      }}
      onMouseEnter={() => setHoveredCard(test.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <CardHeader>
        <CardTitle className="text-xl" style={{ color: 'var(--alo-blue)' }}>
          {test.name}
        </CardTitle>
        <p className="text-sm text-slate-600">{test.fullName}</p>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full text-white"
          style={{ backgroundColor: 'var(--alo-orange)' }}
          onClick={() => window.location.href = createPageUrl('Contact') + `?test=${test.id}`}
        >
          Learn More
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, var(--alo-blue) 0%, #004999 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--alo-orange)' }}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              English Tests for University Entry
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Access study materials, practice tests, and expert guidance to achieve your required score
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 text-white"
                style={{ backgroundColor: 'var(--alo-orange)' }}
              >
                Book Free Counselling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <p className="text-lg text-slate-700 leading-relaxed">
                  English language proficiency is a core requirement for admission to universities in the UK, USA, Canada, Australia, Europe, and beyond. ALO Education helps students choose the right test, prepare effectively, and meet both university and visa requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Take Test Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
              Why take an English language proficiency test to study abroad?
            </h2>
            <p className="text-lg text-center text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Universities require international students to meet specific English language proficiency standards to ensure they can understand course materials and successfully complete their studies. A variety of proficiency tests, such as IELTS and PTE, are widely accepted as proof of English language skills.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--alo-blue)' }}>
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--alo-blue)' }}>University Admission</h3>
                  <p className="text-slate-600">
                    Meet university entry requirements and demonstrate your ability to succeed in an English-speaking academic environment.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--alo-orange)' }}>
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--alo-blue)' }}>Visa Requirements</h3>
                  <p className="text-slate-600">
                    Fulfill visa requirements for student immigration to your destination country with recognized test scores.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--alo-blue)' }}>
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--alo-blue)' }}>Improve Skills</h3>
                  <p className="text-slate-600">
                    Prepare effectively with ALO Education's personalized training to improve your English proficiency and test performance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* English Tests Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
              English Language Proficiency Tests
            </h2>
            <p className="text-center text-slate-600 mb-12">
              Understanding the format, scoring system, and requirements for each proficiency exam can help you choose the test that best aligns with your study abroad plans.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {englishTests.map(test => (
                <TestCard key={test.id} test={test} type="english" />
              ))}
            </div>

            <h3 className="text-2xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
              Academic & Aptitude Tests
            </h3>
            <p className="text-center text-slate-600 mb-8">
              Required for graduate programs and specific undergraduate admissions
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {academicTests.map(test => (
                <TestCard key={test.id} test={test} type="academic" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
              Test Comparison
            </h2>
            <p className="text-center text-slate-600 mb-12">
              Compare duration, scoring, costs, and processing times
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                <thead style={{ backgroundColor: 'var(--alo-blue)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Test</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Duration</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Score Range</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Cost</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Results</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Widely Accepted</th>
                  </tr>
                </thead>
                <tbody>
                  {testComparison.map((test, idx) => (
                    <tr key={test.test} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-6 py-4 font-semibold" style={{ color: 'var(--alo-blue)' }}>{test.test}</td>
                      <td className="px-6 py-4 text-slate-700">{test.duration}</td>
                      <td className="px-6 py-4 text-slate-700">{test.scoreRange}</td>
                      <td className="px-6 py-4 text-slate-700">{test.cost}</td>
                      <td className="px-6 py-4 text-slate-700">{test.results}</td>
                      <td className="px-6 py-4 text-slate-700 text-sm">{test.accepted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ALO Support Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>
                Prepare with ALO Education
              </h2>
              <p className="text-lg text-slate-600">
                Expert guidance and comprehensive resources to help you achieve your target score
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { icon: BookOpen, title: 'Study Materials', desc: 'Access comprehensive study guides and practice questions' },
                { icon: Users, title: 'Expert Tutors', desc: 'Learn from experienced instructors with proven track records' },
                { icon: Clock, title: 'Flexible Schedule', desc: 'Choose class timings that fit your schedule' },
                { icon: Award, title: 'Mock Tests', desc: 'Take full-length practice tests in exam conditions' }
              ].map((item, idx) => (
                <Card key={idx} className="border-0 shadow-sm text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: idx % 2 === 0 ? 'var(--alo-blue)' : 'var(--alo-orange)' }}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold mb-2" style={{ color: 'var(--alo-blue)' }}>{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg"
                  className="text-white px-8"
                  style={{ backgroundColor: 'var(--alo-orange)' }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Your Preparation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-center text-slate-600 mb-12">
              Everything you need to know about English tests for visa and admission
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-6" style={{ borderColor: 'var(--alo-blue)' }}>
                  <AccordionTrigger className="text-left font-semibold hover:no-underline" style={{ color: 'var(--alo-blue)' }}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}