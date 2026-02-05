import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, Clock, Award, Monitor, MessageSquare, Zap } from 'lucide-react';
import Footer from '@/components/landing/Footer';

const benefits = [
  'Fast result-oriented strategy',
  'Computer-based test familiarity',
  'Clear score mapping for universities',
  'Suitable alternative to IELTS'
];

const prepSteps = [
  'Skill level evaluation',
  'Understanding PTE scoring algorithm',
  'Section-wise preparation strategy',
  'Time management and exam techniques',
  'Final readiness guidance'
];

export default function PTEPrep() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-education-blue to-alo-orange">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">PTE Academic Preparation</h1>
          <p className="text-xl mb-8">
            Computer-based English proficiency test with fast results
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-education-blue hover:bg-white/90 gap-2">
                <MessageSquare size={20} />
                Book Free PTE Counselling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* Overview */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About PTE Academic</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              PTE Academic is a computer-based English proficiency test accepted by many universities and immigration 
              authorities, including Australia, the UK, and Canada.
            </p>
            <p>
              It is ideal for students who prefer fast results and computer-based assessment.
            </p>
          </div>
        </section>

        {/* Test Overview */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">PTE Test Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-education-blue">
              <CardContent className="p-6">
                <Monitor className="text-alo-orange mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Test Type</h3>
                <p className="text-gray-600">Fully computer-based</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-education-blue">
              <CardContent className="p-6">
                <Clock className="text-alo-orange mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Duration</h3>
                <p className="text-gray-600">Approximately 2 hours</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-education-blue">
              <CardContent className="p-6">
                <Award className="text-alo-orange mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Scoring</h3>
                <p className="text-gray-600">10–90 scale</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-education-blue">
              <CardContent className="p-6">
                <Zap className="text-alo-orange mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Results</h3>
                <p className="text-gray-600">Usually within 2–5 days</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-education-blue">
              <CardContent className="p-6">
                <CheckCircle className="text-alo-orange mb-3" size={32} />
                <h3 className="font-bold text-lg mb-2">Acceptance</h3>
                <p className="text-gray-600">Universities and immigration bodies</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Preparation Process */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">PTE Preparation Process with ALO</h2>
          <div className="space-y-4">
            {prepSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-education-blue text-white flex items-center justify-center flex-shrink-0 font-bold">
                  {index + 1}
                </div>
                <p className="text-lg text-gray-700 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of PTE Preparation with ALO</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow">
                <CheckCircle className="text-alo-orange flex-shrink-0" size={24} />
                <span className="text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Visa & Admission */}
        <section className="bg-gradient-to-br from-education-blue/10 to-alo-orange/10 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">PTE for Visa & Admission</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Accepted by many Australian universities</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Accepted by UK and Canada institutions</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Score requirements vary by course</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Fast results ideal for tight deadlines</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-education-blue to-alo-orange rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your PTE Journey?</h2>
          <p className="text-xl mb-8">Get expert guidance and achieve your target score quickly</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-education-blue hover:bg-white/90">
                Book Free PTE Counselling
              </Button>
            </Link>
            <Link to={createPageUrl('LanguagePrep')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Compare Tests
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}