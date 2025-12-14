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
      <section 
        className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-20 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&h=600&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-blue-900/80"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Language Prep
            </h1>
            <p className="text-xl text-white/90">
              IELTS for university entry. Access study materials, practice tests, and one-on-one tutoring with ALO Education, giving yourself the best chance of hitting the score you need.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* What is IELTS Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What is IELTS?</h2>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <p className="text-slate-700 leading-relaxed mb-6">
                IELTS, the International English Language Testing System, is a test of English language proficiency and one of the world's most popular and respected forms of English in education and migration. Intended for non-native speakers who are looking to study or work in an English-speaking environment, IELTS training is an internationally recognised system for testing English language ability in four categories:
              </p>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900">Reading</h3>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900">Speaking</h3>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900">Writing</h3>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900">Listening</h3>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed mb-6">
                Since its introduction in 1989, IELTS preparation has become one of the most trusted forms of English-language assessment and is accepted by over 8,000 universities, employers, and immigration organisations worldwide.
              </p>
              <p className="text-slate-700 leading-relaxed">
                At ALO Education, you have access to a range of free and paid resources and IELTS coaching, giving you a better chance of meeting the entry requirements of your preferred university.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* IELTS Course Types */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">IELTS course types</h2>
            <p className="text-slate-600">There are two different types of IELTS tests, and once graded, your IELTS score is valid for two years.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-2xl text-blue-900">Academic IELTS</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-700 leading-relaxed">
                  Academic IELTS is for international students who wish to study at a university or join an institute of higher education.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-2xl text-blue-900">General IELTS</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-700 leading-relaxed">
                  Classes focus on English survival skills and social and workplace language, ideal for those planning to migrate to English-speaking countries such as Australia, Canada, or New Zealand.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* IELTS Band Scale */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">IELTS 9-Band Scale</h2>
          </div>
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Band Score</th>
                    <th className="px-6 py-4 text-left font-semibold">Skill Level</th>
                    <th className="px-6 py-4 text-left font-semibold">Skill Overview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 9</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Expert</td>
                    <td className="px-6 py-4 text-slate-700">Fully operational command of the language. Accurate and fluent with complete understanding</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 8</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Very good</td>
                    <td className="px-6 py-4 text-slate-700">Fully operational command with occasional minor errors. Handles complex language well</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 7</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Good</td>
                    <td className="px-6 py-4 text-slate-700">Strong command with occasional inaccuracies and misunderstandings in unfamiliar situations</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 6</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Competent</td>
                    <td className="px-6 py-4 text-slate-700">Generally effective command, though with some errors and misunderstandings</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 5</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Modest</td>
                    <td className="px-6 py-4 text-slate-700">Partial command, coping with overall meaning but frequent errors</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 4</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Limited</td>
                    <td className="px-6 py-4 text-slate-700">Basic competence in familiar situations, but difficulties in understanding and expressing complex ideas</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 3</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Extremely limited</td>
                    <td className="px-6 py-4 text-slate-700">Conveys and understands only the general meaning in very familiar situations and experiences frequent breakdowns in communication</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 2</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Intermittent</td>
                    <td className="px-6 py-4 text-slate-700">Great difficulty understanding spoken and written English and struggles to communicate basic ideas</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 1</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Non-user</td>
                    <td className="px-6 py-4 text-slate-700">No ability to use the language except for a few isolated words</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">Band 0</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">Did not attempt</td>
                    <td className="px-6 py-4 text-slate-700">The test was not taken, or there is no assessable English proficiency</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                className={selectedCountry === country ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                      <BookOpen className="w-6 h-6 text-blue-600" />
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
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Take the first step towards studying abroad!
              </h2>
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
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