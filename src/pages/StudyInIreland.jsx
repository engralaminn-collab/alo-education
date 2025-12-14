import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, DollarSign, BookOpen, Calendar, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function StudyInIreland() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://flagcdn.com/w80/ie.png" 
                alt="Ireland Flag" 
                className="w-16 h-12 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--alo-blue)' }}>
                Study in <span style={{ color: 'var(--alo-orange)' }}>Ireland</span>
              </h1>
            </div>
            <p className="text-xl mb-8" style={{ color: 'var(--alo-text)' }}>
              English-speaking EU nation, tech hub, and friendly environment for international students.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Courses') + '?country=ireland'}>
                <Button size="lg" variant="outline" style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}>
                  Find Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Tuition Fees (Non-EU / International)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-900 mb-2">Undergraduate</h4>
                <p className="text-2xl font-bold text-green-600">€9,850 – €55,000</p>
                <p className="text-sm text-green-700">per year</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl">
                <h4 className="font-semibold text-emerald-900 mb-2">Postgraduate</h4>
                <p className="text-2xl font-bold text-emerald-600">€9,950 – €35,000</p>
                <p className="text-sm text-emerald-700">per year</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                Entry Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Undergraduate</h4>
                <p className="text-slate-600">HSC/Foundation + IELTS 6.0–6.5</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Postgraduate</h4>
                <p className="text-slate-600">Bachelor + IELTS 6.5</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Intakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <span className="font-medium">September</span>
                <Badge className="ml-2 bg-purple-600 text-white text-xs">Main Intake</Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <span className="font-medium">January</span>
                <Badge variant="outline" className="ml-2 text-xs">Limited</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl text-white" style={{ backgroundColor: 'var(--alo-blue)' }}>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Study in Ireland?</h3>
            <p className="mb-6 text-white/90">
              Get personalized guidance from our expert counselors
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                Book Free Counselling
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}