import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, Clock, Globe, Phone, ArrowRight, Award, Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function OETPrep() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to={createPageUrl('LanguagePrep')} className="text-white/80 hover:text-white mb-4 flex items-center gap-2">
              ← Back to Language Prep
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">OET (Occupational English Test)</h1>
            <p className="text-xl text-white/90 mb-6">
              English test specialized for healthcare professionals. Required for nursing, medicine, and allied health courses.
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">OET Test Overview</h2>
            
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Test Details</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-slate-600">Healthcare Focused</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-500" />
                      <span className="text-slate-600">~3 hours</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-red-500" />
                      <span className="text-slate-600">Grade-based (A–E)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Modules</h3>
                  <ul className="space-y-2 text-slate-600 text-sm">
                    <li>✓ Listening (40 minutes)</li>
                    <li>✓ Reading (60 minutes)</li>
                    <li>✓ Writing (42 minutes)</li>
                    <li>✓ Speaking (20 minutes)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <p className="text-slate-600">
                  <strong>Results:</strong> Within 14 days<br />
                  <strong>Specialization:</strong> Designed for nurses, doctors, physiotherapists, dentists, and other healthcare professionals.
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Who Should Take OET?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-lg">Healthcare Professionals</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-2 text-slate-600 text-sm">
                  <p>• Registered/Student Nurses</p>
                  <p>• Doctors & Medical Graduates</p>
                  <p>• Physiotherapists</p>
                  <p>• Occupational Therapists</p>
                  <p>• Dentists & Dental Hygienists</p>
                  <p>• Radiographers</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-pink-50">
                  <CardTitle className="text-lg">Why OET for Healthcare?</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">Medical terminology focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">Real healthcare scenarios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">Professional communication</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">OET Acceptance</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Australia</h4>
                    <p className="text-sm text-slate-600">
                      Widely accepted for nurse registration and healthcare professional migration.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">UK</h4>
                    <p className="text-sm text-slate-600">
                      Accepted for overseas healthcare professional registration.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Global</h4>
                    <p className="text-sm text-slate-600">
                      Recognized by healthcare organizations and universities worldwide.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready for Your OET Journey?</h2>
            <p className="text-white/90 mb-6">
              Healthcare-specialized preparation to achieve your target grade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('BookConsultation')}>
                <Button className="bg-white text-red-600 hover:bg-slate-100 text-lg">
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