import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, CheckCircle, Globe, Award, 
  ArrowRight, ChevronDown, ChevronUp, Clock, Check, X, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const tests = [
  {
    name: 'IELTS',
    fullName: 'International English Language Testing System',
    description: 'The world\'s most accepted English test for university entry and visa routes.',
    bestFor: 'UK, Australia, Canada, Europe',
    resultTime: '3-13 days',
    online: false,
    ukvi: true,
    typicalScore: '6.0-7.0',
    badge: 'UKVI Available',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'PTE Academic',
    fullName: 'Pearson Test of English',
    description: 'Computer-based test with fast results and AI scoring.',
    bestFor: 'UK, Australia, Canada',
    resultTime: '2-5 days',
    online: false,
    ukvi: 'Some versions',
    typicalScore: '50-65',
    badge: 'Fast Results',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'TOEFL iBT',
    fullName: 'Test of English as a Foreign Language',
    description: 'Academic English test widely used for US and Canadian universities.',
    bestFor: 'USA, Canada',
    resultTime: '6-10 days',
    online: false,
    ukvi: false,
    typicalScore: '70-100',
    badge: 'Academic Focus',
    countries: ['USA', 'Canada', 'Australia', 'UK']
  },
  {
    name: 'Duolingo',
    fullName: 'Duolingo English Test',
    description: 'Online-at-home test with results typically within 48 hours.',
    bestFor: 'Fast deadlines, selected universities',
    resultTime: '~48 hours',
    online: true,
    ukvi: false,
    typicalScore: '95-120',
    badge: 'Online',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'OIETC',
    fullName: 'Oxford International English Test Centre',
    description: 'Popular English test for UK pathway and progression routes.',
    bestFor: 'UK Foundation / Pre-Masters pathways',
    resultTime: 'Fast',
    online: false,
    ukvi: false,
    typicalScore: '6.0/5.5',
    badge: 'Pathway Friendly',
    countries: ['UK']
  },
  {
    name: 'LanguageCert',
    fullName: 'LanguageCert English Test',
    description: 'Recognised English test with online delivery options and UKVI SELT routes.',
    bestFor: 'UK entry + UKVI',
    resultTime: 'Fast',
    online: true,
    ukvi: true,
    typicalScore: 'B2/C1',
    badge: 'UKVI / Online',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'Kaplan Test',
    fullName: 'Kaplan English Test',
    description: 'English assessment used for Kaplan International Pathways partner programs.',
    bestFor: 'Kaplan pathways (Foundation/IY1/Pre-Masters)',
    resultTime: 'Fast',
    online: false,
    ukvi: false,
    typicalScore: 'Pathway-based',
    badge: 'Pathway Only',
    countries: ['UK', 'USA', 'Australia']
  },
  {
    name: 'University Test / MOI',
    fullName: 'University Internal Test',
    description: 'Some universities accept internal tests or MOI letter instead of IELTS.',
    bestFor: 'Waiver-eligible applicants',
    resultTime: 'Immediate',
    online: false,
    ukvi: false,
    typicalScore: 'Internal',
    badge: 'Selected Universities',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  }
];

const faqs = [
  {
    question: 'Which English test is best for UK university admission?',
    answer: 'IELTS Academic is the most widely accepted. If you need a visa-specific Secure English test, you may need IELTS UKVI or another UKVI-approved option depending on your route.'
  },
  {
    question: 'Can I study abroad without IELTS?',
    answer: 'Some universities accept alternatives like PTE, TOEFL, Duolingo, LanguageCert, or internal English tests/MOI. Acceptance depends on the university, course, and visa route.'
  },
  {
    question: 'Is Duolingo accepted for UK universities?',
    answer: 'Some UK universities accept Duolingo for admission, but it is not typically used for UKVI visa requirements. Always verify with the university/course requirements.'
  },
  {
    question: 'Which test gives the fastest results?',
    answer: 'Duolingo is often the fastest (around 48 hours). PTE also offers fast results in many cases.'
  },
  {
    question: 'What is OIETC and who should take it?',
    answer: 'OIETC is commonly used for UK pathway entry under certain providers. It\'s ideal for Foundation/Pre-Masters progression routes where accepted.'
  },
  {
    question: 'What is LanguageCert and is it UKVI approved?',
    answer: 'LanguageCert offers different versions, including UKVI SELT options. Choose the correct version based on the university and visa requirement.'
  },
  {
    question: 'What is the Kaplan English Test?',
    answer: 'It\'s an English assessment used for Kaplan International Pathways partner admissions. It\'s not a general visa test.'
  },
  {
    question: 'What score do I need for undergraduate or postgraduate?',
    answer: 'Typical ranges are UG 6.0-6.5 IELTS and PG 6.5-7.0, but requirements vary by university and course.'
  }
];

export default function LanguagePrep() {
  const [selectedCountry, setSelectedCountry] = useState('UK');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              English Language Tests for University Entry
            </h1>
            <p className="text-xl text-slate-300 mb-4">
              IELTS | PTE | TOEFL | Duolingo | OIETC | LanguageCert | Kaplan Test | University Internal Tests
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Compare IELTS, PTE, TOEFL, Duolingo, OIETC, LanguageCert & university tests. Find the right test for UK, USA, Canada & Australia.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a 
                href={`https://wa.me/8801805020101?text=${encodeURIComponent('Hello ALO Education, I would like guidance on English language tests for university admission.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp: 01805-020101
                </Button>
              </a>
              <Link to={createPageUrl('BookConsultation')}>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Why Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Why take an English language proficiency test to study abroad?
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Universities require international students to meet specific English language proficiency standards to ensure they can understand course materials and successfully complete their studies. A variety of proficiency tests, such as IELTS and PTE, are widely accepted as proof of English language skills.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                These standardised tests can be challenging, but with the right preparation, you can improve your performance. Many tests also allow retakes to help you achieve the required score.
              </p>
              <p className="text-slate-600 leading-relaxed">
                ALO Education's English language training courses offer personalised support to help you improve your English proficiency and secure the score you need for admission to your chosen university.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tests Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              English language proficiency tests for international students
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              Understanding the format, scoring system, and requirements for each proficiency exam can help you choose the test that best aligns with your study abroad plans.
            </p>
          </div>

          {/* Country Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai'].map((country) => (
              <Button
                key={country}
                variant={selectedCountry === country ? 'default' : 'outline'}
                onClick={() => setSelectedCountry(country)}
                className={selectedCountry === country ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {country}
              </Button>
            ))}
          </div>

          {/* Test Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tests.filter(test => test.countries.includes(selectedCountry)).map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-all h-full relative">
                  <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-0">
                    {test.badge}
                  </Badge>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle>{test.name}</CardTitle>
                    <CardDescription className="text-xs">{test.fullName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">{test.description}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="text-slate-600">Best for: {test.bestFor}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className="text-slate-600">Results: {test.resultTime}</span>
                      </div>
                      {test.online && (
                        <div className="flex items-start gap-2">
                          <Globe className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span className="text-slate-600">Online Available</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Test Comparison Table
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              Compare all English tests side-by-side to find the best option for your university and visa requirements.
            </p>
          </div>

          <Card className="border-0 shadow-lg overflow-x-auto">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-900">Test</th>
                    <th className="text-left p-4 font-semibold text-slate-900">Best For</th>
                    <th className="text-left p-4 font-semibold text-slate-900">Result Time</th>
                    <th className="text-center p-4 font-semibold text-slate-900">Online</th>
                    <th className="text-center p-4 font-semibold text-slate-900">UKVI</th>
                    <th className="text-left p-4 font-semibold text-slate-900">Typical Score</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => (
                    <tr key={test.name} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 font-medium text-slate-900">{test.name}</td>
                      <td className="p-4 text-slate-600 text-sm">{test.bestFor}</td>
                      <td className="p-4 text-slate-600 text-sm">{test.resultTime}</td>
                      <td className="p-4 text-center">
                        {test.online ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600">
                        {typeof test.ukvi === 'boolean' ? (test.ukvi ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />) : test.ukvi}
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{test.typicalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Score Equivalency */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Score Equivalency Guide
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              Approximate score equivalents across different tests (universities set final requirements)
            </p>
          </div>

          <Card className="border-0 shadow-lg max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="text-center p-3 font-semibold text-slate-900">IELTS</th>
                      <th className="text-center p-3 font-semibold text-slate-900">PTE</th>
                      <th className="text-center p-3 font-semibold text-slate-900">TOEFL iBT</th>
                      <th className="text-center p-3 font-semibold text-slate-900">Duolingo</th>
                      <th className="text-center p-3 font-semibold text-slate-900">OIETC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="text-center p-3 font-medium text-slate-900">7.0</td>
                      <td className="text-center p-3 text-slate-600">64-73</td>
                      <td className="text-center p-3 text-slate-600">94-101</td>
                      <td className="text-center p-3 text-slate-600">115-120</td>
                      <td className="text-center p-3 text-slate-600">56-60</td>
                    </tr>
                    <tr className="border-b bg-slate-50/50">
                      <td className="text-center p-3 font-medium text-slate-900">6.5</td>
                      <td className="text-center p-3 text-slate-600">58-65</td>
                      <td className="text-center p-3 text-slate-600">79-93</td>
                      <td className="text-center p-3 text-slate-600">105-110</td>
                      <td className="text-center p-3 text-slate-600">51-55</td>
                    </tr>
                    <tr className="border-b">
                      <td className="text-center p-3 font-medium text-slate-900">6.0</td>
                      <td className="text-center p-3 text-slate-600">50-58</td>
                      <td className="text-center p-3 text-slate-600">60-78</td>
                      <td className="text-center p-3 text-slate-600">95-100</td>
                      <td className="text-center p-3 text-slate-600">46-50</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="text-center p-3 font-medium text-slate-900">5.5</td>
                      <td className="text-center p-3 text-slate-600">43-50</td>
                      <td className="text-center p-3 text-slate-600">46-59</td>
                      <td className="text-center p-3 text-slate-600">85-90</td>
                      <td className="text-center p-3 text-slate-600">41-45</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">FAQs</h2>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <p className="text-slate-600 mb-6">
                Find answers to common questions about English language proficiency tests for international students and how ALO Education can help. If you need further assistance, speak to one of our counsellors.
              </p>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-cyan-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Get the Right English Test for Your University & Visa Route
              </h2>
              <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
                Not sure which English language test you need? Share your destination, course level, and intake. Our experts will guide you step-by-step.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href={`https://wa.me/8801805020101?text=${encodeURIComponent('Hello ALO Education, I would like guidance on English language tests for university admission.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp: 01805-020101
                  </Button>
                </a>
                <Link to={createPageUrl('BookConsultation')}>
                  <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                    Book Free Consultation
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}