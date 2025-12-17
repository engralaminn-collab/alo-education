import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award, Globe, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function LanguageCertTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F37021' }}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>LanguageCert</h1>
                <p className="text-xl text-slate-600">Globally Recognised English Language Test</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>What is LanguageCert?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  LanguageCert is an internationally recognised English language test developed by PeopleCert, a global leader in professional certifications. It is accepted by UK universities, pathway providers, professional bodies, and UK Visas & Immigration (UKVI) for specific visa routes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Types of LanguageCert English Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#0066CC' }}>LanguageCert Academic</h3>
                  <p className="text-slate-700 mb-2">For students applying to:</p>
                  <div className="space-y-2">
                    {['Undergraduate programs', 'Postgraduate programs', 'Foundation & Pre-Master's pathways'].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: '#0066CC' }} />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#0066CC' }}>LanguageCert SELT (UKVI Approved)</h3>
                  <p className="text-slate-700 mb-2">Approved by UK Home Office for:</p>
                  <div className="space-y-2">
                    {['UK Student Visa', 'Skilled Worker Visa', 'Family & settlement routes'].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: '#0066CC' }} />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Advantages of LanguageCert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'UKVI-approved SELT option',
                    'Online exam availability',
                    'Faster results',
                    'Flexible test scheduling',
                    'Increasing acceptance across UK universities',
                    'Often lower cost than IELTS'
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0066CC' }} />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                  <div>
                    <p className="font-semibold text-slate-900">UKVI Approved</p>
                    <p className="text-sm text-slate-600">SELT for visa</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Online Option</p>
                    <p className="text-sm text-slate-600">Take from anywhere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Growing Acceptance</p>
                    <p className="text-sm text-slate-600">More universities accepting</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: '#0066CC' }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Need LanguageCert Help?</h3>
                <p className="text-white/90 text-sm">
                  Get UKVI-approved test guidance and visa support.
                </p>
                <Link to={createPageUrl('Contact')}>
                  <Button className="w-full font-bold" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                    Book Free Consultation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}