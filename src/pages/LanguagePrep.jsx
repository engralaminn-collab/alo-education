import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Award, Clock, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function LanguagePrep() {
  const tests = [
    {
      name: 'IELTS Preparation',
      icon: BookOpen,
      description: 'Comprehensive IELTS training for academic and general modules',
      features: ['Reading', 'Writing', 'Listening', 'Speaking'],
      duration: '8-12 weeks',
      color: 'bg-blue-500'
    },
    {
      name: 'TOEFL Preparation',
      icon: Award,
      description: 'Expert TOEFL coaching for US university admissions',
      features: ['iBT Format', 'Practice Tests', 'Score Improvement', 'Test Strategies'],
      duration: '8-10 weeks',
      color: 'bg-emerald-500'
    },
    {
      name: 'PTE Academic',
      icon: TrendingUp,
      description: 'Prepare for PTE with our specialized training program',
      features: ['Computer-based', 'Quick Results', 'Speaking & Writing', 'Mock Tests'],
      duration: '6-8 weeks',
      color: 'bg-purple-500'
    },
    {
      name: 'Duolingo English Test',
      icon: Users,
      description: 'Fast and affordable English proficiency test preparation',
      features: ['Online Format', 'Quick Certification', 'Adaptive Testing', 'Flexible Schedule'],
      duration: '4-6 weeks',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Language Test Preparation
            </h1>
            <p className="text-xl text-white/90">
              Get expert coaching for IELTS, TOEFL, PTE, and Duolingo to achieve your target scores
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {tests.map((test, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl ${test.color} flex items-center justify-center mb-4`}>
                  <test.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-900">{test.name}</CardTitle>
                <p className="text-slate-600">{test.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {test.duration}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">What you'll learn:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {test.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link to={createPageUrl('Contact')}>
                    <Button className="w-full mt-4" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                      Enroll Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#0066CC' }}>
          <CardContent className="p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Preparation?</h2>
            <p className="text-white/90 text-lg mb-6">
              Book a free consultation to discuss your language test preparation needs
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" style={{ backgroundColor: '#F37021', color: '#000000' }} className="font-semibold">
                Book Free Consultation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}