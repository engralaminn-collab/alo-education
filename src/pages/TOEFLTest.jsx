import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Globe, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function TOEFLTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section 
        className="relative py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(22, 101, 52, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Globe className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">TOEFL iBT</h1>
            <p className="text-2xl mb-4">Test of English as a Foreign Language (Internet-Based)</p>
            <p className="text-lg text-green-100 leading-relaxed">
              The premier English test for US universities. Accepted by 11,000+ institutions in 150+ countries.
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
                  <p className="text-slate-600">3 hours total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Score Range</h3>
                  <p className="text-slate-600">0-120 points</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Validity</h3>
                  <p className="text-slate-600">2 years</p>
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
                { section: 'Reading', duration: '54-72 minutes', description: '30-40 questions on 3-4 academic passages' },
                { section: 'Listening', duration: '41-57 minutes', description: '28-39 questions on lectures and conversations' },
                { section: 'Speaking', duration: '17 minutes', description: '4 tasks expressing opinions on familiar topics' },
                { section: 'Writing', duration: '50 minutes', description: '2 tasks - integrated and independent essay' }
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
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>Need TOEFL Preparation?</h2>
            <p className="text-slate-600 text-lg mb-8">Get expert guidance to achieve your target TOEFL score.</p>
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