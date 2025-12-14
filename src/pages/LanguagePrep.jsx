import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, CheckCircle, Globe, Award, 
  ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const tests = [
  {
    name: 'IELTS',
    description: 'The International English Language Testing System (IELTS) is one of the most recognised English proficiency tests for university admission. It is available in Academic and General Training formats.',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'Duolingo',
    description: 'The Duolingo English test is a fully online English proficiency test that takes only one hour to complete. Over 5,500 universities and institutions worldwide accept this test.',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'PTE',
    description: 'The Pearson Test of English (PTE) is a fully computer-based exam widely chosen by students applying to universities abroad. Its AI-driven scoring system ensures accuracy, and results are typically available within 48 hours, making it a fast and efficient option.',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'TOEFL',
    description: 'The Test of English as a Foreign Language (TOEFL) is an English language proficiency test that assesses your academic English skills. It is accepted by most universities worldwide.',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  },
  {
    name: 'Password English Language Test',
    description: 'Password Skills Plus is an online English language test for international students applying to universities abroad. This test is a popular choice for students planning to study in the UK.',
    countries: ['UK']
  },
  {
    name: 'LanguageCert',
    description: 'LanguageCert is a multilevel English language proficiency test that can be taken at home or a test centre, depending on your preference. It is accepted by over 2,500 institutions in 100+ countries.',
    countries: ['UK', 'Australia', 'Ireland', 'Canada', 'New Zealand', 'USA', 'Dubai']
  }
];

const faqs = [
  {
    question: 'Do all universities require proof of English proficiency for admission?',
    answer: 'Yes, international students must demonstrate their English language ability to qualify for university admission. This typically requires completing a recognised English proficiency test and meeting the required score. However, some students may be exempt if they have completed previous education in an English-speaking country or can provide proof that English was the medium of instruction in their school.'
  },
  {
    question: 'Which test should I take, IELTS or PTE?',
    answer: 'Both IELTS and PTE are widely accepted by universities. IELTS is more traditional with face-to-face speaking tests, while PTE is fully computer-based with faster results. Choose based on your comfort level and university requirements.'
  },
  {
    question: 'What is the minimum English proficiency test score required for universities abroad?',
    answer: 'Minimum scores vary by university and program. Typically, universities require IELTS 6.0-7.5 or equivalent scores in other tests. Always check specific requirements for your chosen course and institution.'
  },
  {
    question: 'How can StudyIn help me prepare for the IELTS?',
    answer: 'StudyIn offers personalised English language training courses with expert tutors who can help you improve your skills and achieve the score you need for admission.'
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
              Study English for university entry
            </h1>
            <p className="text-xl text-slate-300">
              Qualify for admission to your preferred university by taking an English language proficiency test with expert support from ALO Education.
            </p>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.filter(test => test.countries.includes(selectedCountry)).map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-all h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle>{test.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{test.description}</p>
                    <Button variant="outline" className="w-full">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
                Take the first step towards studying abroad!
              </h2>
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
                  Book free counselling
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}