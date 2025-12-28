import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plane } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import AIVisaGuidance from '@/components/visa/AIVisaGuidance';

export default function VisaGuidance() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Plane className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI-Powered Visa Guidance
            </h1>
            <p className="text-xl opacity-90">
              Get personalized visa eligibility assessment, document checklists, and AI-generated essays
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <AIVisaGuidance studentProfile={studentProfile} />
        </div>
      </div>

      <Footer />
    </div>
  );
}