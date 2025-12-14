import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, DollarSign, BookOpen, Calendar, 
  TrendingUp, ArrowRight, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function StudyInAustralia() {
  const popularSubjects = [
    'IT', 'Engineering', 'Business', 'Nursing', 
    'Public Health', 'Cyber Security', 'Data Analytics'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-amber-600 to-orange-600 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://flagcdn.com/w80/au.png" 
                alt="Australia Flag" 
                className="w-16 h-12 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Study in Australia
              </h1>
            </div>
            <p className="text-xl text-amber-100 mb-8">
              High-quality education, vibrant student life, and excellent post-study work opportunities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-amber-900 hover:bg-amber-50">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Courses') + '?country=australia'}>
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
                Tuition Fees (International)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl">
                <h4 className="font-semibold text-amber-900 mb-2">Undergraduate</h4>
                <p className="text-2xl font-bold text-amber-600">AUD 15,000 – 33,000</p>
                <p className="text-sm text-amber-700">per year</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl">
                <h4 className="font-semibold text-orange-900 mb-2">Postgraduate</h4>
                <p className="text-2xl font-bold text-orange-600">AUD 20,000 – 37,000</p>
                <p className="text-sm text-orange-700">per year</p>
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
                <p className="text-slate-600">HSC/A-Level/Foundation + IELTS 6.0–6.5</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Postgraduate</h4>
                <p className="text-slate-600">Bachelor degree + IELTS 6.5 (some need higher)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Intakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">February</span>
                  <Badge className="bg-purple-600 text-white">Main</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">July</span>
                  <Badge className="bg-purple-600 text-white">Major</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium">November</span>
                  <Badge variant="outline">Limited</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                Popular Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularSubjects.map(subject => (
                  <Badge key={subject} className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Study Down Under?</h3>
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