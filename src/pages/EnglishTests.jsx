import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

const mainTests = [
  {
    name: 'IELTS',
    subtitle: 'International English Language Testing System',
    description: 'Most widely accepted English proficiency test worldwide',
    features: ['12,000+ universities', 'Paper or computer', '2h 45 min'],
    icon: '📘',
    color: 'from-blue-500 to-blue-600',
    link: 'IELTSPrep'
  },
  {
    name: 'PTE Academic',
    subtitle: 'Pearson Test of English',
    description: 'Computer-based test with AI scoring and fast results',
    features: ['3,000+ universities', '3-5 day results', '~2 hours'],
    icon: '⚡',
    color: 'from-orange-500 to-orange-600',
    link: 'PTEPrep'
  },
  {
    name: 'OIETC - ELLT',
    subtitle: 'Oxford International English Test',
    description: 'Globally accepted by UK universities and pathway providers',
    features: ['UK pathway', '3-5 results', 'Alternative to IELTS'],
    icon: '🎓',
    color: 'from-cyan-500 to-cyan-600',
    link: 'LanguagePrep'
  },
  {
    name: 'TOEFL iBT',
    subtitle: 'Test of English as a Foreign Language',
    description: 'Preferred test for USA and Canadian universities',
    features: ['USA/Canada', 'Academic English', '3-4h duration'],
    icon: '🇺🇸',
    color: 'from-red-500 to-red-600',
    link: 'TOEFLPrep'
  },
  {
    name: 'Duolingo English Test',
    subtitle: 'Online English Proficiency Test',
    description: 'Affordable, fast online test from home',
    features: ['Online only', '~1 hour', 'Rapid 48h'],
    icon: '🦉',
    color: 'from-green-500 to-green-600',
    link: 'DuolingoPrep'
  },
  {
    name: 'LanguageCert',
    subtitle: 'UK-Approved English Test',
    description: 'Efficient alternative to IELTS with online options',
    features: ['UK accepted', 'Online/paper', 'Fast results'],
    icon: '✓',
    color: 'from-purple-500 to-purple-600',
    link: 'LanguagePrep'
  },
  {
    name: 'Kaplan English Test',
    subtitle: 'University Pathway Test',
    description: 'For highly-selective programs in the US universities',
    features: ['US pathways', 'Fast admission', '~90 minutes'],
    icon: '🎯',
    color: 'from-indigo-500 to-indigo-600',
    link: 'LanguagePrep'
  },
  {
    name: 'OET',
    subtitle: 'Occupational English Test',
    description: 'For healthcare professionals and medical students',
    features: ['Healthcare', 'Medical context', '~3 hours'],
    icon: '⚕️',
    color: 'from-pink-500 to-pink-600',
    link: 'OETPrep'
  }
];

const otherTests = [
  { name: 'CAE / CPE', subtitle: 'Cambridge Advanced English' },
  { name: 'GRE', subtitle: 'Graduate Record Examination' },
  { name: 'GMAT', subtitle: 'Graduate Management Admission Test' },
  { name: 'SAT', subtitle: 'Scholastic Assessment Test' },
  { name: 'ACT', subtitle: 'American College Testing' }
];

export default function EnglishTests() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              English Language Tests for{' '}
              <span className="text-alo-orange">University Entry</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Choosing the right English language test is a crucial step in your study abroad journey. Universities across the UK, USA, Canada, Australia, and Europe require proof of English proficiency.
            </p>
            <Link to={createPageUrl('BookConsultation')}>
              <Button className="bg-alo-orange hover:bg-alo-orange/90 text-white h-12 px-8 text-lg">
                Book Free Consultation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Why English Tests Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Why English Language Tests Are Required for University Admission
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-education-blue mt-1 flex-shrink-0" />
                <p className="text-slate-700">English tests assess a student's ability to:</p>
              </div>
              <div className="ml-8 space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-alo-orange mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Understand academic lectures and reading materials</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-alo-orange mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Communicate confidently with lecturers and peers</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-education-blue mt-1 flex-shrink-0" />
                <p className="text-slate-700">Universities use test scores to:</p>
              </div>
              <div className="ml-8 space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-alo-orange mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Write assignments, essays, and research papers</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-alo-orange mt-1 flex-shrink-0" />
                  <p className="text-slate-600">Integrate into an English-speaking academic environment</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-slate-600">
            Most universities and visa authorities require international students to submit an approved English test score as part of the admission or visa process.
          </p>
        </section>

        {/* All English Language Tests */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            All English Language Tests
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainTests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl(test.link)}>
                  <Card className="h-full border-2 border-slate-200 hover:border-alo-orange hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-2xl">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${test.color} flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform`}>
                        {test.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{test.name}</h3>
                      <p className="text-sm text-slate-500 mb-3">{test.subtitle}</p>
                      <p className="text-sm text-slate-600 mb-4">{test.description}</p>
                      
                      <ul className="space-y-2 mb-6">
                        {test.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button className="w-full bg-alo-orange hover:bg-alo-orange/90 group-hover:bg-alo-orange/80">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Other Standardized Tests */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Other Standardized Tests
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {otherTests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-2 border-slate-200 hover:border-alo-orange hover:shadow-lg transition-all cursor-pointer text-center rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-alo-orange mb-1">{test.name}</h3>
                    <p className="text-xs text-slate-600">{test.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            English Language Tests Comparison
          </h2>
          
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">Test</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Result Time</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Best For</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Duration</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-4 font-semibold">IELTS</td>
                      <td className="p-4 text-slate-600">13 days</td>
                      <td className="p-4 text-slate-600">UK, Australia, Canada</td>
                      <td className="p-4 text-slate-600">2h 45min</td>
                      <td className="p-4 text-slate-600">$$</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-4 font-semibold">PTE Academic</td>
                      <td className="p-4 text-slate-600">2-5 days</td>
                      <td className="p-4 text-slate-600">Australia, UK, Canada</td>
                      <td className="p-4 text-slate-600">~2 hours</td>
                      <td className="p-4 text-slate-600">$$</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-4 font-semibold">TOEFL iBT</td>
                      <td className="p-4 text-slate-600">6-10 days</td>
                      <td className="p-4 text-slate-600">USA, Canada</td>
                      <td className="p-4 text-slate-600">~3 hours</td>
                      <td className="p-4 text-slate-600">$$$</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-4 font-semibold">Duolingo</td>
                      <td className="p-4 text-slate-600">48 hours</td>
                      <td className="p-4 text-slate-600">Quick results needed</td>
                      <td className="p-4 text-slate-600">~1 hour</td>
                      <td className="p-4 text-slate-600">$</td>
                    </tr>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-4 font-semibold">LanguageCert</td>
                      <td className="p-4 text-slate-600">3-5 days</td>
                      <td className="p-4 text-slate-600">UK universities</td>
                      <td className="p-4 text-slate-600">~2 hours</td>
                      <td className="p-4 text-slate-600">$$</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-4 font-semibold">OET</td>
                      <td className="p-4 text-slate-600">14 days</td>
                      <td className="p-4 text-slate-600">Healthcare professionals</td>
                      <td className="p-4 text-slate-600">~3 hours</td>
                      <td className="p-4 text-slate-600">$$$</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-education-blue to-alo-orange text-white rounded-2xl">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Not Sure Which Test Is Right For You?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Our expert counselors will guide you to the best English test based on your destination and goals
              </p>
              <Link to={createPageUrl('BookConsultation')}>
                <Button className="bg-white text-alo-orange hover:bg-slate-100 h-12 px-8 text-lg">
                  Get Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
}