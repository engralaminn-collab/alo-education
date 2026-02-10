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

export default function StudyInDubai() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-amber-600 to-red-600 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://flagcdn.com/w80/ae.png" 
                alt="UAE Flag" 
                className="w-16 h-12 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Study in Dubai (UAE)
              </h1>
            </div>
            <p className="text-xl text-amber-100 mb-8">
              Strategic location, modern infrastructure, and growing international university presence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-amber-900 hover:bg-amber-50">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Courses') + '?country=uae'}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
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
                <DollarSign className="w-6 h-6 text-amber-600" />
                Tuition Fees (Indicative)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 p-4 rounded-xl">
                <h4 className="font-semibold text-amber-900 mb-2">International Students</h4>
                <p className="text-2xl font-bold text-amber-600">€5,000 – €27,650</p>
                <p className="text-sm text-amber-700">per year (varies by institution/program)</p>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                You can also store UAE fees in AED on course pages.
              </p>
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
                <p className="text-slate-600">HSC/A-Level/Foundation (varies)</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Postgraduate</h4>
                <p className="text-slate-600">Bachelor degree</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">English</h4>
                <p className="text-slate-600">IELTS often required, but some universities accept alternatives or waivers (case-by-case)</p>
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
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <span className="font-medium">January</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <span className="font-medium">September</span>
                <Badge className="ml-2 bg-purple-600 text-white text-xs">Main</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-r from-amber-600 to-red-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Study in Dubai?</h3>
            <p className="text-amber-100 mb-6">
              Get personalized guidance from our expert counselors
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50">
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