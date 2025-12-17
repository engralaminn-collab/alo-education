import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, BookOpen, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function KaplanTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0066CC' }}>
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>Kaplan English Test</h1>
                <p className="text-xl text-slate-600">University Pathway English Test</p>
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
                <CardTitle style={{ color: '#F37021' }}>What is the Kaplan English Test?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  The Kaplan English Test (KET) is an English language assessment developed by Kaplan International Pathways, one of the world's most respected education providers. It is designed specifically for international students applying to Kaplan pathway programs, including Foundation, International Year One (IY1), and Pre-Master's courses in the UK, USA, Canada, and Australia.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Who Should Choose the Kaplan English Test?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Students applying to Kaplan partner universities',
                    'Applicants to UK Foundation IY1 or Pre-Masters programs',
                    'Students seeking an alternative to IELTS',
                    'Students who want a simpler and faster English assessment'
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0066CC' }} />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Accepted by Kaplan partner universities',
                    'Online or centre-based',
                    'Academic English focused',
                    'Faster results than IELTS',
                    'Lower score thresholds',
                    'May be taken after conditional offer'
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0066CC' }} />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Universities Using Kaplan Pathways</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">Examples include:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'University of Birmingham',
                    'University of Nottingham',
                    'University of York',
                    'University of Glasgow',
                    'City, University of London',
                    'Queen Mary University of London'
                  ].map(uni => (
                    <div key={uni} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                      <Award className="w-4 h-4" style={{ color: '#F37021' }} />
                      <span className="text-sm text-slate-700">{uni}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-600 mt-4">* Availability varies by intake and country</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Why Choose Kaplan?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Reduced Pressure', desc: 'Less exam stress' },
                  { title: 'Academic Focus', desc: 'Pathway-specific' },
                  { title: 'Fast Decision', desc: 'Quick admission' },
                  { title: 'Top Routes', desc: 'Leading universities' }
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: '#0066CC' }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Kaplan Pathway Support</h3>
                <p className="text-white/90 text-sm">
                  Get expert guidance on Kaplan programs and top UK universities.
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