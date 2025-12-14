import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function KaplanTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section 
        className="relative py-24 bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(8, 145, 178, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/90 to-cyan-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <BookOpen className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Kaplan English Test</h1>
            <p className="text-2xl mb-4">Kaplan International English Test</p>
            <p className="text-lg text-cyan-100 leading-relaxed">
              Widely accepted English proficiency test for university admissions and visa purposes.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>Test Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Recognized</h3>
                  <p className="text-slate-600">Accepted globally</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Efficient</h3>
                  <p className="text-slate-600">Quick testing process</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Comprehensive</h3>
                  <p className="text-slate-600">All language skills tested</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>Need Kaplan Test Guidance?</h2>
            <p className="text-slate-600 text-lg mb-8">Get expert advice on Kaplan test requirements and preparation.</p>
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