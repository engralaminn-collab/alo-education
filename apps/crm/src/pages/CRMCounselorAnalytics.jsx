import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import CounselorPerformanceDashboard from '@/components/analytics/CounselorPerformanceDashboard';

export default function CRMCounselorAnalytics() {
  return (
    <CRMLayout title="Counselor Analytics">
      <div className="p-6">
        <CounselorPerformanceDashboard />
      </div>
    </CRMLayout>
  );
}