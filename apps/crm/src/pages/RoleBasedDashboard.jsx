import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import CRMDashboard from './CRMDashboard';
import VisaOfficerPortal from './VisaOfficerPortal';
import AccountsPortal from './AccountsPortal';
import PartnerPortal from './PartnerPortal';
import StudentPortal from './StudentPortal';

export default function RoleBasedDashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: staffRole } = useQuery({
    queryKey: ['staff-role', user?.id],
    queryFn: () => base44.entities.StaffRole.filter({ user_id: user?.id }),
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-education-blue" />
      </div>
    );
  }

  const role = staffRole?.[0]?.role || user?.role || 'student';

  // Route based on role - Partners get full CRM access like counselors
  switch (role) {
    case 'admin':
    case 'counsellor':
    case 'partner':
      return role === 'partner' ? <PartnerPortal /> : <CRMDashboard />;
    case 'visa_officer':
      return <VisaOfficerPortal />;
    case 'accounts':
      return <AccountsPortal />;
    case 'student':
    default:
      return <StudentPortal />;
  }
}