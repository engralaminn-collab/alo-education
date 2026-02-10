import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import CounselorCommunicationDashboard from '@/components/crm/CounselorCommunicationDashboard';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CounselorMessaging() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-education-blue" />
      </div>
    );
  }

  return (
    <CRMLayout>
      <CounselorCommunicationDashboard counselorId={user?.id} />
    </CRMLayout>
  );
}