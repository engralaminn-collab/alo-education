import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, CheckCircle, Users, Trophy, Sparkles, ArrowRight, 
  AlertCircle, Mail, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import EnglishTestCard from '@/components/language/EnglishTestCard';
import TestComparisonTable from '@/components/language/TestComparisonTable';
import LanguageTestFAQ from '@/components/language/LanguageTestFAQ';
import SuccessStories from '@/components/language/SuccessStories';

const englishTests = [
  {
    name: 'IELTS',
    description: 'The most widely accepted English proficiency test for university admission and visa purposes.',
    accepted: ['UK', 'Australia', 'Canada', 'Europe'],
    duration: '2 hours 45 minutes',
    results: '13 days',
    scoring: 'Band score (0–9)',
    cost: 'Medium',
    page: 'IELTSPrep'
  },
  {
    name: 'IELTS UKVI',
    description: 'UK government-approved IELTS for visa applications with enhanced security measures.',
    accepted: ['UK Visa'],
    duration: '2 hours 45 minutes',
    results: '13 days',
    scoring: 'Band score (0–9)',
    cost: 'Slightly Higher',
    page: 'IELTSPrep'
  },
  {
    name: 'PTE Academic',
    description: 'Computer-based test with fast results, ideal for students preferring digital assessment.',
    accepted: ['Australia', 'UK', 'Canada'],
    duration: '~2 hours',
    results: '2–5 days',
    scoring: '10–90 scale',
    cost: 'Medium',
    page: 'PTEPrep'
  },
  {
    name: 'TOEFL iBT',
    description: 'Widely accepted in USA and Canada, rigorous assessment of academic English.',
    accepted: ['USA', 'Canada'],
    duration: '~3 hours',
    results: '6–10 days',
    scoring: '0–120',
    cost: 'High',
    page: 'LanguagePrep'
  },
  {
    name: 'Duolingo English Test',
    description: 'Online test with quick results, perfect for students with tight deadlines.',
    accepted: ['Many Universities', 'Global'],
    duration: '~1 hour',
    results: 'Within 48 hours',
    scoring: '10–160',
    cost: 'Low',
    page: 'LanguagePrep'
  },
  {
    name: 'OET',
    description: 'Specialized for healthcare professionals, designed for medical and health-related courses.',
    accepted: ['Healthcare', 'Professional'],
    duration: '~3 hours',
    results: '14 days',
    scoring: 'Grade-based',
    cost: 'High',
    page: 'LanguagePrep'
  }
];

export default function LanguagePrep() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ['language-testimonials'],
    queryFn: async () => {
      const tests = await base44.entities.Testimonial.filter({ status: 'approved' });
      return tests.slice(0, 3);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-education-blue to-alo-orange text-white py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              English Language Preparation
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Master English proficiency tests for university entry. Access study materials, practice tests, and expert guidance to achieve your required score.
            </p>
            <Link to={createPageUrl('BookConsultation')}>
              <Button className="bg-white text-alo-orange hover:bg-slate-100 text-lg h-12 px-8">
                Book Free Counselling
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Introduction */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Why English Language Proficiency Matters</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-4">
              English language proficiency is a core requirement for admission to universities in the UK, USA, Canada, Australia, Europe, and other study destinations. Most institutions and visa authorities require proof of English ability to ensure students can understand lectures, complete assignments, and communicate effectively.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              ALO Education helps students select the right English test, prepare efficiently, and meet both university admission and visa compliance requirements with confidence.
            </p>
          </div>
        </motion.section>

        {/* Why Take English Test */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Take an English Language Proficiency Test?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-slate-600 mb-6">
                Universities require international students to meet minimum English language standards to ensure academic success. These standards are verified through recognised English proficiency tests such as IELTS, PTE, TOEFL, and others. Although these standardised tests can be challenging, the right preparation strategy can significantly improve your score. Many tests also allow retakes, giving students multiple chances to meet their required band or score.
              </p>
              <p className="text-slate-600">
                ALO Education provides personalised English language preparation support, helping students achieve their goals efficiently and confidently.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-alo-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-900">Choose the Correct Test</h4>
                  <p className="text-sm text-slate-600">Select the test best suited for your university and visa requirements.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-alo-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-900">Understand Test Formats</h4>
                  <p className="text-sm text-slate-600">Learn scoring systems, duration, and assessment criteria for each test.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-alo-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-900">Prepare Effectively</h4>
                  <p className="text-sm text-slate-600">Follow a strategic preparation plan aligned with your timeline.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-alo-orange flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-900">Meet Requirements</h4>
                  <p className="text-sm text-slate-600">Achieve both university admission and visa compliance standards.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* English Tests */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-4">English Language Proficiency Tests</h2>
          <p className="text-lg text-slate-600 mb-12">
            Understanding the format, duration, scoring system, cost, and acceptance of each test helps you choose the best option for your study plans.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {englishTests.map((test, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <EnglishTestCard test={test} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Comparison Table */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <TestComparisonTable />
        </motion.section>

        {/* ALO Support */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-3xl">ALO Education Language Prep Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-600 mb-8">
                ALO Education provides end-to-end language preparation support to ensure your success:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: BookOpen, title: 'Test Selection', desc: 'Guidance based on university & visa requirements' },
                  { icon: CheckCircle, title: 'Free Assessment', desc: 'Initial language proficiency evaluation' },
                  { icon: Trophy, title: 'Score Planning', desc: 'Target setting aligned with your goals' },
                  { icon: Users, title: 'Study Materials', desc: 'Comprehensive resources and guidance' },
                  { icon: Sparkles, title: 'Mock Tests', desc: 'Practice with feedback from experts' },
                  { icon: AlertCircle, title: 'Expert Support', desc: 'University-specific acceptance guidance' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex gap-4">
                      <Icon className="w-6 h-6 text-education-blue flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-center mt-8 text-slate-700 font-semibold italic">
                We focus on results, not just registration.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Success Stories */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <SuccessStories />
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <LanguageTestFAQ />
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-12"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-education-blue to-alo-orange text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Not Sure Which English Test You Need?</h2>
              <p className="text-xl text-white/90 mb-8">
                Our experts will guide you based on your profile and destination.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link to={createPageUrl('BookConsultation')}>
                   <Button className="bg-white text-alo-orange hover:bg-slate-100 text-lg h-12 px-8">
                     Book Free Counselling
                   </Button>
                 </Link>
                 <Link to={createPageUrl('InAppMessaging')}>
                   <Button variant="outline" className="border-white text-white hover:bg-white/20 text-lg h-12 px-8">
                     Chat with Counselor
                     <ArrowRight className="w-5 h-5 ml-2" />
                   </Button>
                 </Link>
               </div>
              
              <div className="mt-10 pt-10 border-t border-white/30 flex flex-col sm:flex-row justify-center gap-8">
                <a href="mailto:info@aloeducation.com" className="flex items-center gap-2 text-white hover:text-slate-100">
                  <Mail className="w-5 h-5" />
                  info@aloeducation.com
                </a>
                <a href="https://wa.me/8801805020101" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-slate-100">
                  <Phone className="w-5 h-5" />
                  WhatsApp: +880 180 502 0101
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
}