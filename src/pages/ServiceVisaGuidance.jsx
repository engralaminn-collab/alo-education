import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';

export default function ServiceVisaGuidance() {
  const processSteps = [
    'Visa requirement briefing',
    'Financial and document preparation',
    'Mock interview and credibility checks',
    'Visa submission support'
  ];

  const benefits = [
    'Higher visa approval rate',
    'Reduced stress and confusion',
    'Proper financial presentation',
    'Expert support'
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Visa Guidance</h1>
            <p className="text-xl text-slate-600">
              End-to-end visa support for successful applications
            </p>
          </div>

          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-education-blue/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-education-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">About This Service</h2>
                  <p className="text-slate-600 leading-relaxed">
                    We provide end-to-end visa guidance, ensuring your application meets embassy requirements 
                    and credibility standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-alo-orange" />
                  Process Steps
                </h3>
                <ul className="space-y-3">
                  {processSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-education-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-education-blue">{index + 1}</span>
                      </div>
                      <span className="text-slate-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Benefits
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-alo-orange bg-gradient-to-br from-education-blue/5 to-alo-orange/5">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-alo-orange mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready for Your Visa?</h3>
              <p className="text-slate-600 mb-6">Get expert visa guidance and support</p>
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-gradient-to-r from-education-blue to-alo-orange">
                  Prepare Your Visa with Experts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}