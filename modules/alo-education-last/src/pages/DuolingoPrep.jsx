import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, Clock, Globe, Phone, ArrowRight, Award, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function DuolingoPrep() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to={createPageUrl('LanguagePrep')} className="text-white/80 hover:text-white mb-4 flex items-center gap-2">
              ← Back to Language Prep
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Duolingo English Test</h1>
            <p className="text-xl text-white/90 mb-6">
              Fast, affordable, and accepted by universities worldwide. Get results in 48 hours.
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Duolingo English Test Overview</h2>
            
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Why Duolingo?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-green-500" />
                      <span className="text-slate-600">Fastest results (48 hours)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-slate-600">Most affordable ($59)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-green-500" />
                      <span className="text-slate-600">Globally accepted</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Test Details</h3>
                  <ul className="space-y-2 text-slate-600 text-sm">
                    <li>✓ Duration: ~1 hour</li>
                    <li>✓ Format: Online (take at home)</li>
                    <li>✓ Score: 10–160</li>
                    <li>✓ Results: Within 48 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <p className="text-slate-600">
                  <strong>Perfect for:</strong> Late applications, quick visa processing, students looking for affordable options<br />
                  <strong>Acceptance:</strong> Accepted by 3000+ universities and institutions globally.
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Duolingo vs IELTS/PTE</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Faster & Cheaper</h4>
                      <p className="text-sm text-slate-600">Get results in 48 hours vs 13 days for IELTS. Cost is $59 vs $180+ for others.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Convenient</h4>
                      <p className="text-sm text-slate-600">Take the test from home with your own computer. No test centers needed.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Widely Accepted</h4>
                      <p className="text-sm text-slate-600">Accepted by top universities worldwide including Stanford, Duke, University of Toronto.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Score Requirements</h2>
            <div className="bg-green-50 rounded-lg p-8">
              <p className="text-slate-600 mb-6">
                Most universities accept Duolingo scores of 100+ for admission. Here's a quick guide:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
                    <p className="text-sm text-slate-600">Bachelor's Programs</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">110+</div>
                    <p className="text-sm text-slate-600">Master's Programs</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">120+</div>
                    <p className="text-sm text-slate-600">Top Universities</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Quick Path to University Admission</h2>
            <p className="text-white/90 mb-6">
              Start your Duolingo journey today and get results in 48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('BookConsultation')}>
                <Button className="bg-white text-green-600 hover:bg-slate-100 text-lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Get Expert Guidance
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