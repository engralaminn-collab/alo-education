import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Globe, Award, MessageSquare, FileText, ArrowRight, Clock, DollarSign, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function EnglishTests() {
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
    'Universities require proof of English proficiency for admission',
    'Visa authorities need standardized test scores for student visa applications',
    'Demonstrates ability to succeed in English-speaking academic environments',
    'Opens doors to scholarships and financial aid opportunities'
  ];

  const testComparison = [
    { 
      name: 'IELTS', 
      duration: '2h 45min', 
      score: '0-9 bands', 
      cost: '$190-240', 
      results: '13 days',
      page: 'IELTSTest'
    },
    { 
      name: 'IELTS UKVI', 
      duration: '2h 45min', 
      score: '0-9 bands', 
      cost: '$200-250', 
      results: '13 days',
      page: 'IELTSUKVITest'
    },
    { 
      name: 'PTE Academic', 
      duration: '2h', 
      score: '10-90', 
      cost: '$185-220', 
      results: '2-5 days',
      page: 'PTETest'
    },
    { 
      name: 'OIETC - ELLT', 
      duration: '2h 30min', 
      score: 'A1-C2', 
      cost: '$150-180', 
      results: '7 days',
      page: 'OIETCTest'
    },
    { 
      name: 'TOEFL iBT', 
      duration: '3h', 
      score: '0-120', 
      cost: '$180-300', 
      results: '6 days',
      page: 'TOEFLTest'
    },
    { 
      name: 'Duolingo', 
      duration: '1h', 
      score: '10-160', 
      cost: '$59', 
      results: '48 hours',
      page: 'DuolingoTest'
    },
    { 
      name: 'LanguageCert', 
      duration: '2h 30min', 
      score: 'A1-C2', 
      cost: '$140-170', 
      results: '3-5 days',
      page: 'LanguageCertTest'
    },
    { 
      name: 'Kaplan', 
      duration: '2h 15min', 
      score: '0-9', 
      cost: '$160-200', 
      results: '7-10 days',
      page: 'KaplanTest'
    },
    { 
      name: 'OET', 
      duration: '3h', 
      score: 'A-E grades', 
      cost: '$400-500', 
      results: '16 days',
      page: 'OETTest'
    },
    { 
      name: 'CAE/CPE', 
      duration: '4h', 
      score: '80-230', 
      cost: '$180-220', 
      results: '4 weeks',
      page: 'CambridgeTest'
    },
    { 
      name: 'GRE', 
      duration: '3h 45min', 
      score: '260-340', 
      cost: '$220', 
      results: '10-15 days',
      page: 'GRETest'
    },
    { 
      name: 'GMAT', 
      duration: '3h 7min', 
      score: '200-800', 
      cost: '$275', 
      results: 'Immediate',
      page: 'GMATTest'
    },
    { 
      name: 'SAT', 
      duration: '3h', 
      score: '400-1600', 
      cost: '$60-120', 
      results: '2 weeks',
      page: 'SATTest'
    },
    { 
      name: 'ACT', 
      duration: '2h 55min', 
      score: '1-36', 
      cost: '$60-85', 
      results: '2-8 weeks',
      page: 'ACTTest'
    }
  ];

  const aloSupport = [
    {
      icon: Target,
      title: 'Test Selection Guidance',
      description: 'Expert advice on choosing the right test based on your destination country, university requirements, and visa needs'
    },
    {
      icon: BookOpen,
      title: 'Preparation Courses',
      description: 'Comprehensive training programs with practice materials, mock tests, and personalized coaching'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book test slots and preparation sessions that fit your timeline and study schedule'
    },
    {
      icon: Award,
      title: 'Score Improvement',
      description: 'Proven strategies and techniques to achieve your target score for admission and visa requirements'
    }
  ];

  const faqs = [
    {
      question: 'Which English test is best for UK student visa?',
      answer: 'For UK student visa applications, IELTS UKVI (Academic) or IELTS for UKVI is typically required. Some universities also accept IELTS Academic, PTE Academic, or other SELT (Secure English Language Tests) approved by UKVI. Always check your specific university and visa requirements.'
    },
    {
      question: 'Can I study abroad without IELTS?',
      answer: 'Yes, many universities accept alternative tests like PTE, TOEFL, Duolingo, or may offer conditional admission with English language courses. Some institutions also accept proof of previous education in English or conduct their own English proficiency tests. Contact ALO Education for personalized guidance.'
    },
    {
      question: 'How long are English test scores valid?',
      answer: 'Most English test scores are valid for 2 years from the test date. However, some universities may require more recent scores. Always verify the validity requirements with your chosen university and visa authorities.'
    },
    {
      question: 'What score do I need for university admission?',
      answer: 'Required scores vary by university, program, and level of study. Undergraduate programs typically require IELTS 6.0-6.5, while postgraduate programs often need 6.5-7.0. Top universities may require higher scores. Our counselors can help you understand specific requirements for your target universities.'
    },
    {
      question: 'How can ALO Education help with test preparation?',
      answer: 'ALO Education offers comprehensive test preparation including expert coaching, practice materials, mock tests, score analysis, and personalized study plans. We also provide guidance on test selection, registration, and meeting university and visa requirements.'
    }
  ];

  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section 
        className="relative py-24"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 102, 204, 0.92)' }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              English Tests for University Entry
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
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-white/90 mt-8 text-lg leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              English language proficiency is a core requirement for admission to universities in the UK, USA, Canada, Australia, Europe, and beyond. ALO Education helps students choose the right test, prepare effectively, and meet both university and visa requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Why Take English Test */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Why Take an English Language Proficiency Test to Study Abroad?
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto text-lg" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Universities require international students to meet specific English language proficiency standards to ensure they can understand course materials and successfully complete their studies. A variety of proficiency tests, such as IELTS and PTE, are widely accepted as proof of English language skills.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {whyTakeTest.map((reason, index) => (
                <Card key={index} className="bg-white border-2 shadow-sm hover:shadow-md transition-all" style={{ borderColor: 'var(--alo-blue)' }}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 shrink-0" style={{ color: 'var(--alo-orange)' }} />
                    <p className="text-slate-700 font-medium">{reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-slate-600 text-lg" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              These standardised tests can be challenging, but with the right preparation, you can improve your performance. Many tests also allow retakes to help you achieve the required score. ALO Education's English language training courses offer personalised support to help you improve your English proficiency and secure the score you need for admission to your chosen university.
            </p>
          </div>
        </div>
      </section>

      {/* English Language Tests */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              English Language Proficiency Tests for International Students
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto text-lg" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Understanding the format, scoring system, and requirements for each proficiency exam can help you choose the test that best aligns with your study abroad plans.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {englishTests.map((test, index) => (
                <Card 
                  key={index} 
                  className="bg-white border-2 shadow-sm hover:shadow-lg transition-all duration-300 h-full group"
                  style={{ borderColor: 'var(--alo-blue)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--alo-orange)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--alo-blue)'}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
                      {test.name}
                    </h3>
                    <p className="text-slate-600 mb-6 flex-grow" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {test.description}
                    </p>
                    <Link to={createPageUrl(test.page)}>
                      <Button 
                        className="w-full text-white"
                        style={{ backgroundColor: 'var(--alo-orange)' }}
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Academic / Aptitude Tests
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto text-lg" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Standardized tests required for graduate and undergraduate admissions in USA and other countries.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aptitudeTests.map((test, index) => (
                <Card 
                  key={index} 
                  className="bg-white border-2 shadow-sm hover:shadow-lg transition-all duration-300 h-full group"
                  style={{ borderColor: 'var(--alo-blue)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--alo-orange)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--alo-blue)'}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
                      {test.name}
                    </h3>
                    <p className="text-slate-600 mb-6 flex-grow text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {test.description}
                    </p>
                    <Link to={createPageUrl(test.page)}>
                      <Button 
                        className="w-full text-white"
                        style={{ backgroundColor: 'var(--alo-orange)' }}
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
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
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Compare Tests at a Glance
            </h2>
            <p className="text-center text-slate-600 mb-12 text-lg" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Duration, scoring, cost, and result timelines
            </p>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl shadow-lg">
                <thead>
                  <tr style={{ backgroundColor: 'var(--alo-blue)' }}>
                    <th className="px-6 py-4 text-left text-white font-bold">Test Name</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Duration</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Score Range</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Cost (USD)</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Results</th>
                  </tr>
                </thead>
                <tbody>
                  {testComparison.map((test, index) => (
                    <tr 
                      key={index} 
                      className="border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link to={createPageUrl(test.page)}>
                          <span className="font-bold hover:underline" style={{ color: 'var(--alo-blue)' }}>
                            {test.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{test.duration}</td>
                      <td className="px-6 py-4 text-slate-600">{test.score}</td>
                      <td className="px-6 py-4 text-slate-600">{test.cost}</td>
                      <td className="px-6 py-4 text-slate-600">{test.results}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ALO Support Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              How ALO Education Supports Your Test Preparation
            </h2>
            <p className="text-center text-slate-600 mb-12 text-lg max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              We provide comprehensive support throughout your English test journey, from selection to achieving your target score.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {aloSupport.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card 
                    key={index} 
                    className="bg-white border-2 shadow-md hover:shadow-xl transition-all"
                    style={{ borderColor: 'var(--alo-blue)' }}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--alo-orange)' }}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
                            {item.title}
                          </h3>
                          <p className="text-slate-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg" 
                  className="text-white text-lg px-8"
                  style={{ backgroundColor: 'var(--alo-orange)' }}
                >
                  Start Your Preparation with ALO
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-center text-slate-600 mb-12 text-lg" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Get answers to common questions about English tests for visa and admission
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="bg-white border-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  style={{ borderColor: openFAQ === index ? 'var(--alo-orange)' : 'var(--alo-blue)' }}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold flex-grow" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>
                        {faq.question}
                      </h3>
                      {openFAQ === index ? (
                        <ChevronUp className="w-5 h-5 shrink-0" style={{ color: 'var(--alo-orange)' }} />
                      ) : (
                        <ChevronDown className="w-5 h-5 shrink-0" style={{ color: 'var(--alo-blue)' }} />
                      )}
                    </div>
                    {openFAQ === index && (
                      <p className="mt-4 text-slate-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {faq.answer}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20" style={{ backgroundColor: 'var(--alo-blue)' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Ready to Start Your Test Preparation?
          </h2>
          <p className="text-xl text-white/90 mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Get expert guidance from our counselors and achieve your target score
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