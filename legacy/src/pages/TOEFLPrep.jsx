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

export default function TOEFLPrep() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to={createPageUrl('LanguagePrep')} className="text-white/80 hover:text-white mb-4 flex items-center gap-2">
              ← Back to Language Prep
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">TOEFL iBT Preparation</h1>
            <p className="text-xl text-white/90 mb-6">
              Prepare for the TOEFL iBT test to study in the USA, Canada, and other English-speaking universities.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl">
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">TOEFL iBT Test Overview</h2>
            
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Test Details</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Badge className="bg-blue-600">Internet-Based</Badge>
                      <span className="text-slate-600">Test Type</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-slate-600">~3 hours</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span className="text-slate-600">Score 0–120</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Sections</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Reading (54–72 minutes)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Listening (41–57 minutes)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Writing (50 minutes)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Speaking (16 minutes)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <p className="text-slate-600">
                  <strong>Results:</strong> Within 6–10 days<br />
                  <strong>Acceptance:</strong> Widely accepted in USA, Canada, and many universities globally.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">TOEFL for USA & Canada</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <p className="text-slate-600 mb-6">
                  TOEFL iBT is the preferred English proficiency test for universities in the United States and Canada. Most institutions require specific minimum scores for undergraduate and graduate programs.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Typical Score Requirements</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• Undergraduate: 61–79</li>
                      <li>• Graduate/MBA: 80–100</li>
                      <li>• Top-tier universities: 100–120</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Preparation Tips</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• Focus on academic English</li>
                      <li>• Practice integrated tasks</li>
                      <li>• Improve speaking confidence</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Prepare for TOEFL?</h2>
            <p className="text-white/90 mb-6">
              Achieve your target score for USA and Canadian universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('BookConsultation')}>
                <Button className="bg-white text-blue-600 hover:bg-slate-100 text-lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />
    </div>
  );
}