import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function OIETCTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0066CC' }}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>OIETC - ELLT</h1>
                <p className="text-xl text-slate-600">Oxford International English Test Centre</p>
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
                <CardTitle style={{ color: '#F37021' }}>What is OIETC?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-6">
                  OIETC is an English proficiency test widely accepted by UK universities and pathway providers, especially those working with:
                </p>
                <div className="space-y-2">
                  {[
                    'Oxford International (OIEG)',
                    'ONCAMPUS',
                    'Navitas',
                    'International Study Centres'
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <CheckCircle className="w-5 h-5" style={{ color: '#0066CC' }} />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Who Should Choose OIETC?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Students applying for UK Foundation IY1 or Pre-Masters',
                    'Students seeking an alternative to IELTS',
                    'Applicants with lower IELTS scores',
                    'Students looking for fast pathway admission'
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
                <CardTitle style={{ color: '#F37021' }}>Typical OIETC Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: '#0066CC' }}>
                        <th className="text-left p-4 font-semibold">Level</th>
                        <th className="text-left p-4 font-semibold">OIETC Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Foundation', '5.5 / 5.0'],
                        ['Undergraduate Pathway', '6.0 / 5.5'],
                        ['Pre-Masters', '6.5 / 6.0']
                      ].map(([level, score], index) => (
                        <tr key={index} className="border-b">
                          <td className="p-4 font-medium" style={{ color: '#0066CC' }}>{level}</td>
                          <td className="p-4 text-slate-700">{score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Key Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                  <div>
                    <p className="font-semibold text-slate-900">UK Pathway Focus</p>
                    <p className="text-sm text-slate-600">Specifically for UK foundation & pathway programs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Fast Results</p>
                    <p className="text-sm text-slate-600">Quicker than IELTS</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Alternative Route</p>
                    <p className="text-sm text-slate-600">Great IELTS alternative</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: '#0066CC' }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Need OIETC Guidance?</h3>
                <p className="text-white/90 text-sm">
                  Get expert support for UK pathway programs.
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