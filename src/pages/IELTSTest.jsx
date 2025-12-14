import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Globe, Clock, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function IELTSTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section 
        className="relative py-24 bg-gradient-to-br from-red-900 via-red-800 to-red-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(220, 38, 38, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-red-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Globe className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              IELTS
            </h1>
            <p className="text-2xl mb-4">International English Language Testing System</p>
            <p className="text-lg text-red-100 leading-relaxed">
              The world's most popular English test for study, work, and migration. Accepted by 11,500+ organizations globally.
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>
              About IELTS
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Test Format</h3>
                  <p className="text-slate-600">Listening, Reading, Writing, Speaking</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Duration</h3>
                  <p className="text-slate-600">2 hours 45 minutes total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Validity</h3>
                  <p className="text-slate-600">2 years from test date</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Test Sections */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>
              Test Sections
            </h2>
            <div className="space-y-6">
              {[
                { section: 'Listening', duration: '30 minutes', description: '40 questions based on recordings of native English speakers' },
                { section: 'Reading', duration: '60 minutes', description: '40 questions from three long texts (Academic) or practical texts (General Training)' },
                { section: 'Writing', duration: '60 minutes', description: 'Two tasks - graph/chart description and essay writing' },
                { section: 'Speaking', duration: '11-14 minutes', description: 'Face-to-face interview with certified examiner in three parts' }
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 mt-1" style={{ color: 'var(--alo-orange)' }} />
                      <div className="flex-1">
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

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>
              Need IELTS Preparation Guidance?
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              Our expert counselors can help you prepare effectively and achieve your target band score.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('EnglishTests')}>
                <Button size="lg" variant="outline">
                  View All Tests
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}