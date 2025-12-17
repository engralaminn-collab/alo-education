import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Heart, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function OETTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F37021' }}>
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>OET</h1>
                <p className="text-xl text-slate-600">Occupational English Test for Healthcare</p>
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
                <CardTitle style={{ color: '#F37021' }}>What is OET?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  OET (Occupational English Test) is an international English language test that assesses the language and communication skills of healthcare professionals who seek to register and practise in an English-speaking environment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Who Should Take OET?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Doctors',
                    'Nurses',
                    'Dentists',
                    'Pharmacists',
                    'Physiotherapists',
                    'Occupational Therapists',
                    'Radiographers',
                    'Dietitians'
                  ].map(profession => (
                    <div key={profession} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <Users className="w-5 h-5" style={{ color: '#0066CC' }} />
                      <span className="font-medium">{profession}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Why Choose OET?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Healthcare-specific English test',
                    'Recognised by regulatory healthcare bodies',
                    'Medical context scenarios',
                    'Accepted for UK professional registration',
                    'Suitable for visa and immigration',
                    'More relevant than general English tests'
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
                <CardTitle style={{ color: '#F37021' }}>Test Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Listening', desc: 'Healthcare consultations' },
                  { title: 'Reading', desc: 'Medical texts' },
                  { title: 'Writing', desc: 'Referral letters' },
                  { title: 'Speaking', desc: 'Role-plays' }
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <Award className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
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
                <h3 className="text-xl font-bold">Healthcare Professional?</h3>
                <p className="text-white/90 text-sm">
                  Get OET preparation and UK healthcare registration support.
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