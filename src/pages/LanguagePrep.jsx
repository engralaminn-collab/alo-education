import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BookOpen, CheckCircle, Clock, DollarSign, Globe, 
  Zap, ArrowRight, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

const tests = [
  {
    name: 'IELTS',
    duration: '2h 45m',
    results: '13 days',
    scoring: 'Band 0–9',
    cost: 'Medium',
    acceptance: 'UK, Australia, Canada, Europe',
    page: 'IELTSPrep',
    description: 'Most widely accepted English proficiency test'
  },
  {
    name: 'IELTS UKVI',
    duration: '2h 45m',
    results: '13 days',
    scoring: 'Band 0–9',
    cost: 'Medium-High',
    acceptance: 'UK Visa & Universities',
    page: 'IELTSPrep',
    description: 'UK government-approved for visa applications'
  },
  {
    name: 'PTE Academic',
    duration: '~2h',
    results: '2–5 days',
    scoring: '10–90',
    cost: 'Medium',
    acceptance: 'Australia, UK, Canada',
    page: 'PTEPrep',
    description: 'Computer-based with fast results'
  },
  {
    name: 'TOEFL iBT',
    duration: '~3h',
    results: '6–10 days',
    scoring: '0–120',
    cost: 'High',
    acceptance: 'USA, Canada, Global',
    page: 'TOEFLPrep',
    description: 'Preferred for US and Canadian universities'
  },
  {
    name: 'Duolingo English Test',
    duration: '~1h',
    results: '48 hours',
    scoring: '10–160',
    cost: 'Low',
    acceptance: 'Global universities',
    page: 'DuolingoPrep',
    description: 'Fastest online English proficiency test'
  },
  {
    name: 'OET (Healthcare)',
    duration: '~3h',
    results: '14 days',
    scoring: 'Grade-based',
    cost: 'High',
    acceptance: 'Health professional courses',
    page: 'OETPrep',
    description: 'Specialized for healthcare professionals'
  }
];

const comparisonData = [
  { test: 'IELTS', duration: '2h 45m', results: '13 days', scoring: 'Band 0–9', cost: '£180–250', best: 'UK, Australia, Canada' },
  { test: 'IELTS UKVI', duration: '2h 45m', results: '13 days', scoring: 'Band 0–9', cost: '£200–270', best: 'UK Visa' },
  { test: 'PTE Academic', duration: '~2h', results: '2–5 days', scoring: '10–90', cost: '$185–300', best: 'Australia, UK' },
  { test: 'TOEFL iBT', duration: '~3h', results: '6–10 days', scoring: '0–120', cost: '$220', best: 'USA, Canada' },
  { test: 'Duolingo', duration: '~1h', results: '48 hours', scoring: '10–160', cost: '$59', best: 'Quick applications' },
  { test: 'OET', duration: '~3h', results: '14 days', scoring: 'Grade-based', cost: '$250–380', best: 'Healthcare' }
];

const faqs = [
  {
    q: 'Which English test is best for UK study?',
    a: 'IELTS or IELTS UKVI are most widely accepted by UK universities. IELTS UKVI is specifically required for UK visa routes.'
  },
  {
    q: 'Can I apply without an English proficiency test?',
    a: 'Some universities accept alternative pathways like Duolingo or MOI (Medium of Instruction) waiver. Check with your chosen university.'
  },
  {
    q: 'Is an English test mandatory for visa approval?',
    a: 'Yes, in most cases. Requirements vary by country, course level, and immigration rules. Always verify with your destination country.'
  },
  {
    q: 'Can I retake the test if I don\'t meet my required score?',
    a: 'Yes. Most English tests allow multiple attempts. Plan retakes well in advance of application deadlines.'
  },
  {
    q: 'Does ALO provide English coaching?',
    a: 'ALO provides comprehensive preparation guidance, study strategies, resources, and mock test support to help you achieve your target score.'
  },
  {
    q: 'How much should I score on IELTS for university admission?',
    a: 'Most universities require IELTS 6.0–7.5. Check specific university requirements for your course. Visa requirements may be different.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    destination: 'UK',
    test: 'IELTS',
    score: '7.0',
    story: 'Required IELTS 6.5 for undergraduate admission. Achieved 7.0 with ALO guidance and secured visa approval smoothly.'
  },
  {
    name: 'Priya Patel',
    destination: 'Australia',
    test: 'PTE Academic',
    score: '79/90',
    story: 'Struggled with IELTS writing. Switched to PTE with ALO counselling and achieved required score within 1 month.'
  },
  {
    name: 'Ahmed Hassan',
    destination: 'Canada',
    test: 'Duolingo',
    score: '140/160',
    story: 'Applied late for intake. Used Duolingo English Test and received offer letter within days.'
  }
];

export default function LanguagePrep() {
  const [activeTab, setActiveTab] = useState('tests');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Language Prep</h1>
            <p className="text-xl text-white/90 mb-6">
              English tests for university entry. Access study materials, practice tests, and expert guidance to achieve your required score.
            </p>
            <Link to={createPageUrl('BookConsultation')}>
              <Button className="bg-white text-education-blue hover:bg-slate-100 text-lg">
                <Phone className="w-4 h-4 mr-2" />
                Book Free Counselling
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Introduction Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 max-w-4xl"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why English Language Proficiency Matters</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            English language proficiency is a core requirement for admission to universities in the UK, USA, Canada, Australia, Europe, and other study destinations. Most institutions and visa authorities require proof of English ability to ensure students can understand lectures, complete assignments, and communicate effectively.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            ALO Education helps students select the right English test, prepare efficiently, and meet both university admission and visa compliance requirements with confidence.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-slate-900 mb-4">ALO Education helps you:</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-education-blue flex-shrink-0" />
                Choose the correct test for your profile
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-education-blue flex-shrink-0" />
                Understand test formats and scoring
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-education-blue flex-shrink-0" />
                Prepare effectively within your timeline
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-education-blue flex-shrink-0" />
                Meet university and visa requirements
              </li>
            </ul>
          </div>
        </motion.section>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tests">English Tests</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* English Tests Tab */}
          <TabsContent value="tests" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">English Language Tests</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test, idx) => (
                  <motion.div
                    key={test.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="h-full border-2 border-education-blue hover:shadow-lg transition-all">
                      <CardHeader className="border-b border-education-blue bg-white">
                        <CardTitle className="text-alo-orange">{test.name}</CardTitle>
                        <p className="text-sm text-slate-600 mt-2">{test.description}</p>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Duration: <strong>{test.duration}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Results: <strong>{test.results}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Score: <strong>{test.scoring}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Cost: <strong>{test.cost}</strong></span>
                          </div>
                        </div>
                        <Badge className="w-full justify-center bg-blue-50 text-education-blue border border-education-blue">
                          {test.acceptance}
                        </Badge>
                        <Link to={createPageUrl(test.page)}>
                          <Button className="w-full bg-alo-orange hover:bg-orange-600">
                            Learn More
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Academic Tests Section */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Academic & Aptitude Tests</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { name: 'GRE', desc: 'Required for many postgraduate programs' },
                  { name: 'GMAT', desc: 'Required for MBA and business programs' },
                  { name: 'SAT', desc: 'Undergraduate admission test' },
                  { name: 'ACT', desc: 'Alternative undergraduate admission test' }
                ].map(test => (
                  <Card key={test.name} className="border border-slate-200">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-slate-900">{test.name}</h4>
                      <p className="text-sm text-slate-600 mt-2">{test.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button className="w-full mt-6 bg-education-blue hover:bg-blue-700">
                Learn More About Academic Tests
              </Button>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Test Comparison Overview</h2>
              <p className="text-slate-600 mb-6">
                Compare all tests based on duration, result timeline, scoring system, cost, and university & visa acceptance.
              </p>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Scoring</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Best For</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonData.map((row) => (
                      <TableRow key={row.test}>
                        <TableCell className="font-medium">{row.test}</TableCell>
                        <TableCell>{row.duration}</TableCell>
                        <TableCell>{row.results}</TableCell>
                        <TableCell>{row.scoring}</TableCell>
                        <TableCell>{row.cost}</TableCell>
                        <TableCell>{row.best}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
              
              <Accordion type="single" collapsible className="w-full max-w-3xl">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`}>
                    <AccordionTrigger className="font-semibold text-slate-900">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>

        {/* ALO Education Support Section */}
        <section className="my-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">ALO Education – Your Language Prep Partner</h2>
          <p className="text-slate-600 mb-6">
            We provide end-to-end language preparation support, including:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              'Test selection based on university & visa rules',
              'Free language assessment',
              'Score planning strategy',
              'Study material guidance',
              'Mock tests & feedback',
              'Language waiver (MOI) eligibility check'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-education-blue flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 italic font-semibold">We focus on results, not just registration.</p>
        </section>

        {/* Testimonials Section */}
        <section className="my-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Student Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                        <p className="text-sm text-slate-600">{testimonial.destination}</p>
                      </div>
                      <Badge className="bg-education-blue">{testimonial.test}</Badge>
                    </div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-education-blue">{testimonial.score}</p>
                      <p className="text-xs text-slate-600">Final Score</p>
                    </div>
                    <p className="text-slate-600 text-sm">{testimonial.story}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="my-16 bg-alo-orange rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Not Sure Which English Test You Need?</h2>
          <p className="text-lg mb-8 text-white/90">
            Our experts will guide you based on your profile and destination.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-alo-orange hover:bg-slate-100 text-lg">
              Learn More
            </Button>
            <Link to={createPageUrl('BookConsultation')}>
              <Button variant="outline" className="border-white text-white hover:bg-white/20 text-lg w-full sm:w-auto">
                <Phone className="w-4 h-4 mr-2" />
                Book Free Counselling
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}