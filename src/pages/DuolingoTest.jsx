import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Target, Zap, Home, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function DuolingoTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0066CC' }}>
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>Duolingo English Test</h1>
                <p className="text-xl text-slate-600">Online English Proficiency Test</p>
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
                <CardTitle style={{ color: '#F37021' }}>What is Duolingo English Test?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-6">
                  The Duolingo English Test is an online English proficiency test that can be taken from home. It is affordable, fast, and accepted by many universities worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Advantages of Duolingo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: Zap, text: 'Results within 48 hours' },
                    { icon: Home, text: 'Can be taken from home' },
                    { icon: DollarSign, text: 'Lower cost compared to IELTS' },
                    { icon: Target, text: 'Adaptive test format' }
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: '#0066CC' }} />
                      <span className="text-slate-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Duolingo Score Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: '#0066CC' }}>
                        <th className="text-left p-4 font-semibold">IELTS Equivalent</th>
                        <th className="text-left p-4 font-semibold">Duolingo Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['6.0', '95-100'],
                        ['6.5', '105-110'],
                        ['7.0', '115-120']
                      ].map(([ielts, duolingo], index) => (
                        <tr key={index} className="border-b">
                          <td className="p-4 font-medium" style={{ color: '#0066CC' }}>{ielts}</td>
                          <td className="p-4 text-slate-700">{duolingo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  * Acceptance depends on university and course
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Why Choose Duolingo?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Convenience', desc: 'Test from anywhere' },
                  { title: 'Speed', desc: '48-hour results' },
                  { title: 'Affordability', desc: 'Lower cost' },
                  { title: 'Growing', desc: 'More universities accepting' }
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
                <h3 className="text-xl font-bold">Ready for Duolingo?</h3>
                <p className="text-white/90 text-sm">
                  Get guidance on universities accepting Duolingo.
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