import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

const languageTests = [
  {
    name: 'IELTS',
    description: 'The International English Language Testing System (IELTS) is one of the most recognised English proficiency tests for university admission. It is available in Academic and General Training formats.',
    icon: '🎓'
  },
  {
    name: 'Duolingo',
    description: 'The Duolingo English test is a fully online English proficiency test that takes only one hour to complete. Over 5,500 universities and institutions worldwide accept this test.',
    icon: '🎓'
  },
  {
    name: 'PTE',
    description: 'The Pearson Test of English (PTE) is a fully computer-based exam widely chosen by students applying to universities abroad. Its AI-driven scoring system ensures accuracy, and results are typically available within 48 hours, making it a fast and efficient option.',
    icon: '🎓'
  },
  {
    name: 'TOEFL',
    description: 'The Test of English as a Foreign Language (TOEFL) is an English language proficiency test that assesses your academic English skills. It is accepted by most universities worldwide.',
    icon: '🎓'
  },
  {
    name: 'Password English Language Test',
    description: 'Password Skills Plus is an online English language test for international students applying to universities abroad. This test is a popular choice for students planning to study in the UK.',
    icon: '🎓'
  },
  {
    name: 'LanguageCert',
    description: 'LanguageCert is a multilevel English language proficiency test that can be taken at home or a test centre, depending on your preference. It is accepted by over 2,500 institutions in 100+ countries.',
    icon: '🎓'
  }
];

const bandScale = [
  { band: 9, skill: 'Expert', overview: 'Fully operational command of the language. Accurate and fluent with complete understanding' },
  { band: 8, skill: 'Very good', overview: 'Fully operational command with occasional minor errors. Handles complex language well' },
  { band: 7, skill: 'Good', overview: 'Strong command with occasional inaccuracies and misunderstandings in unfamiliar situations' },
  { band: 6, skill: 'Competent', overview: 'Generally effective command, though with some errors and misunderstandings' },
  { band: 5, skill: 'Modest', overview: 'Partial command, coping with overall meaning but frequent errors' },
  { band: 4, skill: 'Limited', overview: 'Basic competence in familiar situations, but difficulties in understanding and expressing complex ideas' },
  { band: 3, skill: 'Extremely limited', overview: 'Conveys and understands only the general meaning in very familiar situations and experiences frequent breakdowns in communication' },
  { band: 2, skill: 'Intermittent', overview: 'Great difficulty understanding spoken and written English and struggles to communicate basic ideas' },
  { band: 1, skill: 'Non-user', overview: 'No ability to use the language except for a few isolated words' },
  { band: 0, skill: 'Did not attempt the test', overview: 'The test was not taken, or there is no assessable English proficiency' }
];

export default function LanguagePrep() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero - Blue Background with Image */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                IELTS for university entry
              </h1>
              <p className="text-lg text-blue-50 leading-relaxed">
                Access study materials, practice tests, and one-on-one tutoring with ALO Education, giving yourself the best chance of hitting the score you need.
              </p>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop"
                alt="Students studying"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is IELTS Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop"
                alt="IELTS Building"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">What is IELTS?</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                IELTS, the International English Language Testing System, is a test of English language proficiency and one of the world's most popular and respected forms of English in education and migration. Intended for non-native speakers who are looking to study or work in an English-speaking environment, IELTS training is an internationally recognised system for testing English language ability in four categories:
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-700">Reading</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-700">Speaking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-700">Writing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-700">Listening</span>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Since its introduction in 1989, IELTS preparation has become one of the most trusted forms of English-language assessment and is accepted by over 8,000 universities, employers, and immigration organisations worldwide.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                At ALO Education, you have access to a range of free and paid resources and IELTS coaching, giving you a better chance of meeting the entry requirements of your preferred university.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IELTS Course Types */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">IELTS course types</h2>
            <p className="text-slate-600">
              There are two different types of IELTS tests, and once graded, your IELTS score is valid for two years.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-slate-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Academic IELTS</h3>
                <p className="text-slate-600">
                  Academic IELTS is for international students who wish to study at a university or join an institute of higher education.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-slate-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">General IELTS</h3>
                <p className="text-slate-600">
                  Classes focus on English survival skills and social and workplace language, ideal for those planning to migrate to English-speaking countries such as Australia, Canada, or New Zealand.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* IELTS 9-Band Scale */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">IELTS 9-Band Scale</h2>
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-4 px-6 text-left">Score</th>
                  <th className="py-4 px-6 text-left">Skill</th>
                  <th className="py-4 px-6 text-left">Skill overview</th>
                </tr>
              </thead>
              <tbody>
                {bandScale.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="py-4 px-6 font-semibold">Band {item.band}</td>
                    <td className="py-4 px-6 font-medium">{item.skill}</td>
                    <td className="py-4 px-6 text-slate-600">{item.overview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Language Tests Grid - Blue Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {languageTests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-blue-600 text-white border-0 h-full hover:shadow-xl transition-all">
                  <CardContent className="p-8">
                    <GraduationCap className="w-12 h-12 text-orange-400 mb-4" />
                    <h3 className="text-2xl font-bold mb-4">{test.name}</h3>
                    <p className="text-blue-50 mb-6 leading-relaxed">{test.description}</p>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}