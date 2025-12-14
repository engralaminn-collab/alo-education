import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Award, Clock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function CambridgeTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section 
        className="relative py-24 bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(194, 65, 12, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-orange-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Award className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">CAE / CPE</h1>
            <p className="text-2xl mb-4">Cambridge Advanced & Proficiency English</p>
            <p className="text-lg text-orange-100 leading-relaxed">
              Prestigious Cambridge English qualifications accepted by universities and employers worldwide.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>Two Prestigious Levels</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <Award className="w-12 h-12 mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--alo-blue)' }}>CAE (C1 Advanced)</h3>
                  <p className="text-slate-600">High-level English proficiency for academic and professional success</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Award className="w-12 h-12 mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--alo-blue)' }}>CPE (C2 Proficiency)</h3>
                  <p className="text-slate-600">Highest level of English mastery - exceptional language ability</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>Why Cambridge?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Global Recognition</h3>
                  <p className="text-slate-600">Accepted worldwide</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Prestigious</h3>
                  <p className="text-slate-600">Cambridge University quality</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <h3 className="font-bold text-lg mb-2">Lifetime Validity</h3>
                  <p className="text-slate-600">No expiration date</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>Aiming for Cambridge?</h2>
            <p className="text-slate-600 text-lg mb-8">Get expert guidance on CAE/CPE preparation and university requirements.</p>
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