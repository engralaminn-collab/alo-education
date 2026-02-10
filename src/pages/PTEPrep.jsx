import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, CheckCircle, Clock, Globe, 
  Phone, ArrowRight, Award, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function PTEPrep() {
  const preparation = [
    'Skill level evaluation',
    'Understanding PTE scoring algorithm',
    'Section-wise preparation strategy',
    'Time management and exam techniques',
    'Final readiness guidance'
  ];

  const benefits = [
    'Fast result-oriented strategy',
    'Computer-based test familiarity',
    'Clear score mapping for universities',
    'Suitable alternative to IELTS',
    'Quick pathway to application'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to={createPageUrl('LanguagePrep')} className="text-white/80 hover:text-white mb-4 flex items-center gap-2">
              ← Back to Language Prep
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">PTE Academic Preparation</h1>
            <p className="text-xl text-white/90 mb-6">
              Fast-track your English proficiency with computer-based testing and quick results.
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">PTE Academic Test Overview</h2>
            
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Test Details</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <span className="text-slate-600">Computer-Based</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span className="text-slate-600">~2 hours</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-amber-600" />
                      <span className="text-slate-600">Score 10–90</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Sections</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                      Speaking & Writing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                      Reading
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                      Listening
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-amber-600">
              <CardContent className="p-6">
                <p className="text-slate-600">
                  <strong>Results:</strong> Usually within 2–5 days (fastest of all major tests)<br />
                  <strong>Acceptance:</strong> Australian, UK, and Canadian universities. Widely recognized globally.
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">PTE Preparation with ALO</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-lg">Preparation Strategy</CardTitle>
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
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600">{item}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-lg">Why Choose PTE?</CardTitle>
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
                      <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">PTE for Visa & Admission</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Australia</h3>
                  <p className="text-sm text-slate-600">
                    Widely accepted by Australian universities for student visa applications.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">UK & Europe</h3>
                  <p className="text-sm text-slate-600">
                    Accepted by many UK universities and European institutions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Canada</h3>
                  <p className="text-sm text-slate-600">
                    Recognized by Canadian universities and immigration authorities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Score Mapping */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 bg-blue-50 rounded-lg p-8"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6">PTE Score Mapping</h3>
            <p className="text-slate-600 mb-6">
              PTE scores on a 10–90 scale are equivalent to IELTS bands:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-white rounded border border-blue-200">
                  <span className="font-semibold">PTE 79–86</span>
                  <span className="text-education-blue">≈ IELTS 7.0</span>
                </div>
                <div className="flex justify-between p-3 bg-white rounded border border-blue-200">
                  <span className="font-semibold">PTE 65–78</span>
                  <span className="text-education-blue">≈ IELTS 6.0–6.5</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-white rounded border border-blue-200">
                  <span className="font-semibold">PTE 86+</span>
                  <span className="text-education-blue">≈ IELTS 7.5+</span>
                </div>
                <div className="flex justify-between p-3 bg-white rounded border border-blue-200">
                  <span className="font-semibold">PTE 50–64</span>
                  <span className="text-education-blue">≈ IELTS 5.0–5.5</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Ace PTE?</h2>
            <p className="text-white/90 mb-6">
              Get fast results with strategic PTE preparation from ALO Education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('BookConsultation')}>
                <Button className="bg-white text-amber-600 hover:bg-slate-100 text-lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Book Free PTE Counselling
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