import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Award, Loader2 } from 'lucide-react';
import AIScholarshipMatcher from '@/components/scholarships/AIScholarshipMatcher';
import Footer from '@/components/landing/Footer';

export default function ScholarshipFinder() {
  const { data: user } = useQuery({
    queryKey: ['current-user-scholarships'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile-scholarships', user?.id],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container mx-auto px-6 py-12 text-center">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
          <p className="text-slate-600 mb-6">
            To get personalized scholarship recommendations, please complete your student profile first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-cyan-600 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center text-white max-w-3xl mx-auto">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI Scholarship Finder
            </h1>
            <p className="text-xl text-white/90">
              Discover scholarships tailored to your profile with AI-powered matching
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <AIScholarshipMatcher studentProfile={profile} />
        </div>
      </div>

      <Footer />
    </div>
  );
}