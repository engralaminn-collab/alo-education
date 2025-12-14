import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Award, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function ACTTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section 
        className="relative py-24 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(146, 64, 14, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/90 to-amber-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Award className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">ACT</h1>
            <p className="text-2xl mb-4">American College Testing</p>
            <p className="text-lg text-amber-100 leading-relaxed">
              Alternative to SAT for US undergraduate admissions. Tests English, math, reading, science, and optional writing.
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
                  <p className="text-slate-600">2 hours 55 minutes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Score Range</h3>
                  <p className="text-slate-600">1-36 composite</p>
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
                { section: 'English', duration: '45 minutes', description: 'Grammar, punctuation, sentence structure' },
                { section: 'Math', duration: '60 minutes', description: 'Algebra, geometry, trigonometry' },
                { section: 'Reading', duration: '35 minutes', description: 'Comprehension of prose passages' },
                { section: 'Science', duration: '35 minutes', description: 'Data interpretation and scientific reasoning' },
                { section: 'Writing (Optional)', duration: '40 minutes', description: 'Essay on a contemporary issue' }
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 mt-1" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--alo-blue)' }}>
                          {item.section} ({item.duration})
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
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>ACT Preparation Support</h2>
            <p className="text-slate-600 text-lg mb-8">Get expert guidance on ACT preparation and US university applications.</p>
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