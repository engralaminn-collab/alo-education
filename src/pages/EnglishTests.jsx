import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Globe, Award, MessageSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function EnglishTests() {
  const tests = [
    {
      name: 'IELTS',
      fullName: 'International English Language Testing System',
      description: 'The most widely accepted English test globally, required by UK universities and visa authorities.',
      icon: Globe,
      color: 'bg-red-50 text-red-600'
    },
    {
      name: 'PTE',
      fullName: 'Pearson Test of English Academic',
      description: 'Computer-based test with fast results, accepted by universities in UK, Australia, and Canada.',
      icon: Award,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      name: 'TOEFL',
      fullName: 'Test of English as a Foreign Language',
      description: 'Popular in US and Canadian universities, measures academic English proficiency.',
      icon: BookOpen,
      color: 'bg-green-50 text-green-600'
    },
    {
      name: 'Duolingo',
      fullName: 'Duolingo English Test',
      description: 'Online, affordable test accepted by universities in USA, Canada, and UK.',
      icon: MessageSquare,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      name: 'OIETC',
      fullName: 'Oxford International English Test Centre',
      description: 'Accepted by select UK universities for admission purposes.',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      name: 'University Internal Tests',
      fullName: 'Medium of Instruction (MOI)',
      description: 'Some universities offer their own English tests or accept MOI certificates.',
      icon: CheckCircle,
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  const benefits = [
    'Understand academic lectures and reading materials',
    'Write assignments, essays, and research papers',
    'Communicate confidently with lecturers and peers',
    'Integrate into an English-speaking academic environment'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section 
        className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0, 102, 204, 0.9)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/90" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Globe className="w-5 h-5" />
              <span className="font-semibold">English Language Tests</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              English Language Tests for University Entry
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              IELTS | PTE | TOEFL | Duolingo | OIETC | University Internal Tests
            </p>
            <p className="text-lg text-blue-50 leading-relaxed max-w-3xl mx-auto">
              Choosing the right English language test is a crucial step in your study abroad journey. 
              At ALO Education, we help students select the most suitable English test, prepare effectively, 
              and secure university admission — with or without IELTS, where possible.
            </p>
          </div>
        </div>
      </section>

      {/* Why Tests Are Required */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
              Why English Language Tests Are Required
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto">
              English language tests assess a student's ability to succeed in an English-speaking academic environment. 
              Most universities and visa authorities require international students to submit an approved English test score.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--alo-orange)', opacity: 0.1 }}>
                      <CheckCircle className="w-6 h-6" style={{ color: 'var(--alo-orange)' }} />
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">{benefit}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Types of Tests */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
              Types of English Language Tests
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto">
              Universities accept different English tests depending on country of study, level of study (Foundation, UG, PG, PhD), 
              visa requirements, and university policies.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test, index) => {
                const Icon = test.icon;
                return (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${test.color}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--alo-blue)' }}>
                        {test.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3 font-medium">
                        {test.fullName}
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {test.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Test Selection Factors */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg" style={{ backgroundColor: 'var(--alo-blue)' }}>
              <CardContent className="p-12 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">
                  Universities Accept Tests Based On
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-2">Country of Study</h3>
                    <p className="text-blue-100">UK, USA, Canada, Australia, Europe</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-2">Level of Study</h3>
                    <p className="text-blue-100">Foundation, UG, PG, PhD</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-2">Visa Requirements</h3>
                    <p className="text-blue-100">Immigration authorities' policies</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-2">University Policies</h3>
                    <p className="text-blue-100">Individual institution requirements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>
              Need Help Choosing the Right Test?
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              Our expert counselors will guide you through selecting and preparing for the most suitable English test 
              for your dream university.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg" 
                  className="text-white text-lg px-8"
                  style={{ backgroundColor: 'var(--alo-orange)' }}
                >
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Courses')}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8"
                  style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}
                >
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}