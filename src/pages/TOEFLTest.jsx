import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function TOEFLTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F37021' }}>
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>TOEFL iBT</h1>
                <p className="text-xl text-slate-600">Test of English as a Foreign Language</p>
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
                <CardTitle style={{ color: '#F37021' }}>What is TOEFL iBT?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-6">
                  TOEFL iBT is a globally recognised English test, especially popular in the USA and Canada. It focuses heavily on academic English and university-level communication.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Who Should Choose TOEFL?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Students applying to USA or Canadian universities',
                    'Research-based or academically intensive programs',
                    'Students comfortable with American English accents',
                    'PhD and graduate school applicants'
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
                <CardTitle style={{ color: '#F37021' }}>TOEFL Score Requirements (Typical)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: '#0066CC' }}>
                        <th className="text-left p-4 font-semibold">Study Level</th>
                        <th className="text-left p-4 font-semibold">TOEFL iBT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Undergraduate', '70-80'],
                        ['Postgraduate', '80-100'],
                        ['Top Universities', '100+']
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
                <CardTitle style={{ color: '#F37021' }}>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Best For</p>
                    <p className="text-sm text-slate-600">USA & Canada</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Result Time</p>
                    <p className="text-sm text-slate-600">6-10 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: '#0066CC' }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Need TOEFL Support?</h3>
                <p className="text-white/90 text-sm">
                  Get preparation and USA/Canada admission guidance.
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