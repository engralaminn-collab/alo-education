import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Building2 } from 'lucide-react';
import ComparisonTool from '@/components/comparison/ComparisonTool';
import Footer from '@/components/landing/Footer';

export default function Compare() {
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonType, setComparisonType] = useState('university');

  const openComparison = (type) => {
    setComparisonType(type);
    setShowComparison(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-20" style={{ background: 'linear-gradient(135deg, var(--alo-blue) 0%, #004999 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Compare Universities & Courses
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Make informed decisions by comparing universities and programs side-by-side
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div
              className="p-8 bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl"
              style={{ borderColor: 'var(--alo-blue)' }}
              onClick={() => openComparison('university')}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--alo-blue)' }}>
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
                Compare Universities
              </h3>
              <p className="text-center text-slate-600 mb-6">
                Compare rankings, student population, acceptance rates, and more
              </p>
              <Button className="w-full text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                Start Comparison
              </Button>
            </div>

            <div
              className="p-8 bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl"
              style={{ borderColor: 'var(--alo-blue)' }}
              onClick={() => openComparison('course')}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--alo-orange)' }}>
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4" style={{ color: 'var(--alo-blue)' }}>
                Compare Courses
              </h3>
              <p className="text-center text-slate-600 mb-6">
                Compare tuition fees, duration, entry requirements, and intakes
              </p>
              <Button className="w-full text-white" style={{ backgroundColor: 'var(--alo-orange)' }}>
                Start Comparison
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ComparisonTool
        open={showComparison}
        onClose={() => setShowComparison(false)}
        type={comparisonType}
      />

      <Footer />
    </div>
  );
}