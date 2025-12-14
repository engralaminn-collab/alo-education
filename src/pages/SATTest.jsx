import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function SATTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section 
        className="relative py-24 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(19, 78, 74, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-teal-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <FileText className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">SAT</h1>
            <p className="text-2xl mb-4">Scholastic Assessment Test</p>
            <p className="text-lg text-teal-100 leading-relaxed">
              Standardized test for undergraduate admissions in US universities. Measures reading, writing, and math skills.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>Test Information</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Duration</h3>
                  <p className="text-slate-600">3 hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Score Range</h3>
                  <p className="text-slate-600">400-1600 points</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
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
                { section: 'Reading', description: 'Evidence-based reading and comprehension' },
                { section: 'Writing and Language', description: 'Grammar, vocabulary, and editing skills' },
                { section: 'Math', description: 'Algebra, problem solving, data analysis (calculator & no calculator)' },
                { section: 'Essay (Optional)', description: 'Analysis of a provided passage' }
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
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>Planning for US Universities?</h2>
            <p className="text-slate-600 text-lg mb-8">Get comprehensive SAT preparation and US university application guidance.</p>
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