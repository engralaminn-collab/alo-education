import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Globe, Calendar, Award, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function IELTSTest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0066CC' }}>
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>IELTS</h1>
                <p className="text-xl text-slate-600">International English Language Testing System</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What is IELTS */}
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>What is IELTS?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  IELTS (International English Language Testing System) is the most widely accepted English proficiency test in the world. It evaluates four language skills:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {['Listening', 'Reading', 'Writing', 'Speaking'].map(skill => (
                    <div key={skill} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <CheckCircle className="w-5 h-5" style={{ color: '#0066CC' }} />
                      <span className="font-medium">{skill}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-700">
                  IELTS is accepted by 11,000+ universities, employers, and immigration authorities worldwide. Test results are valid for 2 years.
                </p>
              </CardContent>
            </Card>

            {/* Test Types */}
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>IELTS Test Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#0066CC' }}>IELTS Academic</h3>
                  <p className="text-slate-700 mb-3">Designed for students applying to:</p>
                  <div className="space-y-2">
                    {['Undergraduate programs', 'Postgraduate Masters programs', 'PhD and research degrees'].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: '#0066CC' }} />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#0066CC' }}>IELTS General Training</h3>
                  <p className="text-slate-700 mb-3">Designed for:</p>
                  <div className="space-y-2">
                    {['Migration purposes', 'Work and training', 'Some professional registrations'].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: '#0066CC' }} />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#0066CC' }}>IELTS for UKVI</h3>
                  <p className="text-slate-700 mb-3">
                    Required for UK visa purposes under Secure English Language Test (SELT) rules. This is mandatory for:
                  </p>
                  <div className="space-y-2">
                    {['UK Foundation and Pathway programs', 'Certain Student Visa routes', 'UK Pre-sessional English courses'].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: '#0066CC' }} />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Requirements */}
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Minimum IELTS Score for Universities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: '#0066CC' }}>
                        <th className="text-left p-4 font-semibold">Level of Study</th>
                        <th className="text-left p-4 font-semibold">Typical IELTS Requirement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Foundation', '4.5 – 5.5'],
                        ['Undergraduate', '6.0 – 6.5'],
                        ['Postgraduate', '6.5 – 7.0'],
                        ['PhD', '6.5 – 7.5']
                      ].map(([level, score], index) => (
                        <tr key={index} className="border-b">
                          <td className="p-4 font-medium" style={{ color: '#0066CC' }}>{level}</td>
                          <td className="p-4 text-slate-700">{score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  * Requirements vary by university and course
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Acceptance</p>
                    <p className="text-sm text-slate-600">11,000+ institutions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Validity</p>
                    <p className="text-sm text-slate-600">2 years</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Result Time</p>
                    <p className="text-sm text-slate-600">3-13 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Test Format</p>
                    <p className="text-sm text-slate-600">Paper-based or Computer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: '#0066CC' }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Need IELTS Guidance?</h3>
                <p className="text-white/90 text-sm">
                  Get expert counseling, preparation support, and university admission assistance.
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