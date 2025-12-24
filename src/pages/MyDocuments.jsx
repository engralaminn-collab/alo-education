import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import DocumentManager from '@/components/documents/DocumentManager';
import Footer from '@/components/landing/Footer';

export default function MyDocuments() {
  const { data: user } = useQuery({
    queryKey: ['current-user-docs'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-docs', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#0066CC' }}>
              <FileText className="w-8 h-8" />
              My Documents
            </h1>
            <p className="text-slate-600 mt-2">
              Upload and manage your application documents
            </p>
          </div>

          {studentProfile ? (
            <DocumentManager studentId={studentProfile.id} />
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-600">Loading...</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}