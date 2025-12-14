import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  GraduationCap, CheckCircle, Clock, Globe, Monitor, 
  FileText, Headphones, Award, ArrowRight 
} from 'lucide-react';
import Footer from '@/components/landing/Footer';

const tests = [
  {
    name: "IELTS",
    type: "Academic / UKVI",
    resultTime: "3-13 days",
    bestFor: "UK, Australia, Canada, EU",
    score: "6.0 - 7.5",
    icon: Globe,
    features: ["Most widely accepted", "11,000+ institutions", "2-year validity"]
  },
  {
    name: "PTE Academic",
    type: "Pearson Test",
    resultTime: "2-5 days",
    bestFor: "Fast results, UK/AUS",
    score: "50 - 65",
    icon: Monitor,
    features: ["AI-scored", "No face-to-face", "Fast results"]
  },
  {
    name: "TOEFL iBT",
    type: "Internet-based",
    resultTime: "6-10 days",
    bestFor: "USA, Canada",
    score: "70 - 100",
    icon: FileText,
    features: ["American English", "Academic focus", "University level"]
  },
  {
    name: "Duolingo",
    type: "Online Test",
    resultTime: "48 hours",
    bestFor: "Quick, online",
    score: "95 - 120",
    icon: Clock,
    features: ["Take from home", "48hr results", "Lower cost"]
  },
  {
    name: "OIETC",
    type: "Oxford Test",
    resultTime: "Fast",
    bestFor: "UK Pathways",
    score: "5.5 - 6.5",
    icon: Award,
    features: ["Foundation entry", "IELTS alternative", "UK pathways"]
  },
  {
    name: "LanguageCert",
    type: "UKVI Approved",
    resultTime: "Very fast",
    bestFor: "UK visa & university",
    score: "B1 - C1",
    icon: CheckCircle,
    features: ["UKVI-approved SELT", "Online option", "Fast results"]
  },
  {
    name: "Kaplan Test",
    type: "Pathway Test",
    resultTime: "Fast",
    bestFor: "Kaplan pathways",
    score: "Varies",
    icon: Headphones,
    features: ["Kaplan universities", "Academic focused", "Faster admission"]
  },
  {
    name: "University Test",
    type: "Internal / MOI",
    resultTime: "Immediate",
    bestFor: "Waiver entry",
    score: "Waived",
    icon: GraduationCap,
    features: ["No IELTS needed", "English medium", "Faster process"]
  }
];

const requirements = [
  { level: "Foundation", ielts: "4.5 - 5.5", pte: "42 - 50", toefl: "60 - 70" },
  { level: "Undergraduate", ielts: "6.0 - 6.5", pte: "50 - 58", toefl: "70 - 80" },
  { level: "Postgraduate", ielts: "6.5 - 7.0", pte: "58 - 65", toefl: "80 - 100" },
  { level: "PhD", ielts: "6.5 - 7.5", pte: "65 - 73", toefl: "90 - 100" }
];

export default function EnglishTests() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20" style={{ backgroundColor: 'var(--alo-blue)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-4" style={{ backgroundColor: 'var(--alo-orange)' }}>
              English Language Tests
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              English Language Tests for University Entry
            </h1>
            <p className="text-xl mb-8 text-white/90">
              IELTS | PTE | TOEFL | Duolingo | OIETC | LanguageCert | Kaplan | University Tests
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                Get Free Test Counselling
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Why English Tests */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>
              Why English Language Tests Are Required
            </h2>
            <p className="text-lg text-slate-600">
              Universities require proof of English proficiency to ensure students can succeed academically and communicate effectively in an English-speaking environment.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: FileText, text: "Understand lectures & reading" },
              { icon: Headphones, text: "Write essays & research papers" },
              { icon: Globe, text: "Communicate with peers" },
              { icon: Award, text: "Meet visa requirements" }
            ].map((item, idx) => (
              <Card key={idx} className="text-center border" style={{ borderColor: 'var(--alo-blue)' }}>
                <CardContent className="p-6">
                  <item.icon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--alo-orange)' }} />
                  <p style={{ color: 'var(--alo-blue)' }}>{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Tests Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>
            Choose Your <span style={{ color: 'var(--alo-orange)' }}>English Test</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tests.map((test, idx) => (
              <Card key={idx} className="border hover:shadow-lg transition-all" style={{ borderColor: 'var(--alo-blue)', backgroundColor: 'var(--alo-blue)', color: 'white' }}>
                <CardHeader>
                  <test.icon className="w-12 h-12 mb-3" style={{ color: 'var(--alo-orange)' }} />
                  <CardTitle className="text-white">{test.name}</CardTitle>
                  <p className="text-sm text-white/80">{test.type}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: 'var(--alo-orange)' }} />
                      <span className="text-sm">{test.resultTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" style={{ color: 'var(--alo-orange)' }} />
                      <span className="text-sm">{test.bestFor}</span>
                    </div>
                    <div className="pt-3 border-t border-white/20">
                      {test.features.map((feature, i) => (
                        <p key={i} className="text-xs text-white/80 mb-1">✓ {feature}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Score Requirements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--alo-blue)' }}>
            Minimum Score Requirements
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border" style={{ borderColor: 'var(--alo-blue)' }}>
                <thead style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
                  <tr>
                    <th className="p-4 text-left">Study Level</th>
                    <th className="p-4">IELTS</th>
                    <th className="p-4">PTE</th>
                    <th className="p-4">TOEFL</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req, idx) => (
                    <tr key={idx} className="border-t" style={{ borderColor: 'var(--alo-blue)' }}>
                      <td className="p-4 font-semibold" style={{ color: 'var(--alo-blue)' }}>{req.level}</td>
                      <td className="p-4 text-center">{req.ielts}</td>
                      <td className="p-4 text-center">{req.pte}</td>
                      <td className="p-4 text-center">{req.toefl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Detailed Test Info */}
        <section className="mb-16 space-y-12">
          {/* IELTS */}
          <Card className="border" style={{ borderColor: 'var(--alo-blue)' }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: 'var(--alo-blue)' }}>
                IELTS – International English Language Testing System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                IELTS is the world's most widely accepted English proficiency test, recognized by 11,000+ universities, employers, and immigration authorities. It evaluates Listening, Reading, Writing, and Speaking skills.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>IELTS Academic</h4>
                  <p className="text-sm text-slate-600">For university admissions (UG, PG, PhD)</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>IELTS General</h4>
                  <p className="text-sm text-slate-600">For migration and work purposes</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>IELTS for UKVI</h4>
                  <p className="text-sm text-slate-600">Required for UK visa applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LanguageCert */}
          <Card className="border" style={{ borderColor: 'var(--alo-blue)' }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: 'var(--alo-blue)' }}>
                LanguageCert – UKVI Approved English Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                LanguageCert is an internationally recognized English test approved by UK Home Office for Student Visas (SELT). It offers online and test-centre options, making it a flexible alternative to IELTS.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge style={{ backgroundColor: 'var(--alo-orange)', color: 'white' }}>UKVI Approved</Badge>
                <Badge style={{ backgroundColor: 'var(--alo-orange)', color: 'white' }}>Online Option</Badge>
                <Badge style={{ backgroundColor: 'var(--alo-orange)', color: 'white' }}>Fast Results</Badge>
                <Badge style={{ backgroundColor: 'var(--alo-orange)', color: 'white' }}>CEFR Based</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Kaplan */}
          <Card className="border" style={{ borderColor: 'var(--alo-blue)' }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: 'var(--alo-blue)' }}>
                Kaplan English Test – University Pathway Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                The Kaplan English Test is designed for students applying to Kaplan International Pathways programs (Foundation, IY1, Pre-Master's). It focuses on academic readiness and offers a simpler route to top UK universities.
              </p>
              <p className="text-sm text-slate-500">
                <strong>Partner Universities:</strong> University of Birmingham, Nottingham, York, Glasgow, City London, Queen Mary, and more.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section>
          <Card className="border-0 shadow-xl text-white" style={{ backgroundColor: 'var(--alo-blue)' }}>
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Need Help Choosing the Right Test?</h3>
              <p className="mb-6 text-white/90">
                Get personalized guidance from our English test experts at ALO Education
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl('Contact')}>
                  <Button size="lg" className="text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                    Book Free Consultation
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl('Courses')}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
}