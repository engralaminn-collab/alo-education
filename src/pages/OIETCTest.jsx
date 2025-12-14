import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function OIETCTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section 
        className="relative py-24 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(109, 40, 217, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-purple-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <FileText className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">OIETC – ELLT</h1>
            <p className="text-2xl mb-4">Oxford International English Language Test</p>
            <p className="text-lg text-purple-100 leading-relaxed">
              Accepted by select UK universities for admission purposes. Quick results and affordable testing.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">UK Universities</h3>
                  <p className="text-slate-600">Accepted by many UK institutions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Quick Results</h3>
                  <p className="text-slate-600">Results within 72 hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Affordable</h3>
                  <p className="text-slate-600">Cost-effective option</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>Is OIETC Right for You?</h2>
            <p className="text-slate-600 text-lg mb-8">Consult with our experts to determine if OIETC is accepted by your chosen university.</p>
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