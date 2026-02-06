import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, CheckCircle, Clock, Globe, 
  Phone, ArrowRight, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function IELTSPrep() {
  const preparation = [
    'Free initial language assessment',
    'Target band score planning based on university and visa needs',
    'Guidance for each module (Listening, Reading, Writing, Speaking)',
    'Writing and speaking feedback strategy',
    'Mock test guidance and exam readiness'
  ];

  const benefits = [
    'University-focused score planning',
    'Visa-compliant preparation',
    'Speaking and writing confidence building',
    'Honest assessment and guidance',
    'Faster achievement of required band score'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to={createPageUrl('LanguagePrep')} className="text-white/80 hover:text-white mb-4 flex items-center gap-2">
              ← Back to Language Prep
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">IELTS Preparation</h1>
            <p className="text-xl text-white/90 mb-6">
              Prepare strategically to achieve your required IELTS band score for admission and visa compliance.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl">
          {/* Overview */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">IELTS Test Overview</h2>
            
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Test Details</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Badge className="bg-education-blue">Paper/Computer</Badge>
                      <span className="text-slate-600">Test Type</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-education-blue" />
                      <span className="text-slate-600">~2 hours 45 minutes</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-education-blue" />
                      <span className="text-slate-600">Band Score 0–9</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Modules</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-alo-orange rounded-full"></span>
                      Listening (30 minutes)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-alo-orange rounded-full"></span>
                      Reading (60 minutes)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-alo-orange rounded-full"></span>
                      Writing (60 minutes)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-alo-orange rounded-full"></span>
                      Speaking (11–14 minutes)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-alo-orange">
              <CardContent className="p-6">
                <p className="text-slate-600">
                  <strong>Results:</strong> Within 13 days<br />
                  <strong>Acceptance:</strong> Universities, professional bodies, and visa authorities in UK, Australia, Canada, Europe, and many other countries
                </p>
              </CardContent>
            </Card>
          </motion.section>

          {/* Preparation Process */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">IELTS Preparation with ALO</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg">Preparation Process</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {preparation.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-education-blue text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600">{item}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-emerald-50">
                  <CardTitle className="text-lg">Benefits</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {benefits.map((benefit, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-600">{benefit}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Visa & Admission */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">IELTS for Visa & Admission</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">UK Student Visa</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-education-blue" />
                      Accepted by UK universities
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-education-blue" />
                      IELTS UKVI may be required for visa routes
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-education-blue" />
                      Band requirements vary by course
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">International Acceptance</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-alo-orange" />
                      Australia & New Zealand universities
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-alo-orange" />
                      Canada & US universities
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-alo-orange" />
                      European institutions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-brand text-white rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Prepare for IELTS?</h2>
            <p className="text-white/90 mb-6">
              Start your IELTS journey with expert guidance from ALO Education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('BookConsultation')}>
                <Button className="bg-white text-education-blue hover:bg-slate-100 text-lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Book Free IELTS Counselling
                </Button>
              </Link>
              <Button variant="outline" className="border-white text-white hover:bg-white/20 text-lg">
                Prepare with ALO
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />
    </div>
  );
}