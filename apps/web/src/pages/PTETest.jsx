import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Clock, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function PTETest() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F37021' }}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0066CC' }}>PTE Academic</h1>
                <p className="text-xl text-slate-600">Pearson Test of English</p>
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
                <CardTitle style={{ color: '#F37021' }}>What is PTE Academic?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-6">
                  PTE Academic is a fully computer-based English test that uses AI scoring technology, ensuring accuracy and fairness. It assesses Listening, Reading, Writing, and Speaking in an integrated format.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F37021' }}>Why Choose PTE?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Fast results usually within 2-5 days',
                    'No face-to-face speaking test',
                    'Accepted by universities in UK Australia Canada Europe',
                    'Increasingly accepted for UK student visas',
                    'AI-based objective scoring',
                    'Flexible test dates and locations'
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
                <CardTitle style={{ color: '#F37021' }}>PTE Score Requirements (Typical)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: '#0066CC' }}>
                        <th className="text-left p-4 font-semibold">Study Level</th>
                        <th className="text-left p-4 font-semibold">PTE Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Foundation', '42-50'],
                        ['Undergraduate', '50-58'],
                        ['Postgraduate', '58-65']
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
                  <Clock className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Result Time</p>
                    <p className="text-sm text-slate-600">2-5 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Test Format</p>
                    <p className="text-sm text-slate-600">100% Computer-based</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                  <div>
                    <p className="font-semibold text-slate-900">Scoring</p>
                    <p className="text-sm text-slate-600">AI-based objective</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: '#0066CC' }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Ready for PTE?</h3>
                <p className="text-white/90 text-sm">
                  Get preparation support and university admission guidance.
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