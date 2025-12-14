import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function GRETest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section 
        className="relative py-24 bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(109, 40, 217, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 to-violet-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <BookOpen className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">GRE</h1>
            <p className="text-2xl mb-4">Graduate Record Examination</p>
            <p className="text-lg text-violet-100 leading-relaxed">
              Required for most graduate programs in the USA. Measures verbal reasoning, quantitative reasoning, and analytical writing.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>Test Overview</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Duration</h3>
                  <p className="text-slate-600">3 hours 45 minutes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Score Range</h3>
                  <p className="text-slate-600">260-340 points</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Validity</h3>
                  <p className="text-slate-600">5 years</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>Test Sections</h2>
            <div className="space-y-6">
              {[
                { section: 'Verbal Reasoning', description: 'Reading comprehension, text completion, sentence equivalence' },
                { section: 'Quantitative Reasoning', description: 'Arithmetic, algebra, geometry, data analysis' },
                { section: 'Analytical Writing', description: 'Two essays - analyze an issue and analyze an argument' }
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 mt-1" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--alo-blue)' }}>
                          {item.section}
                        </h3>
                        <p className="text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>Need GRE Preparation?</h2>
            <p className="text-slate-600 text-lg mb-8">Get expert guidance to achieve your target GRE score for graduate admissions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('EnglishTests')}>
                <Button size="lg" variant="outline">View All Tests</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}