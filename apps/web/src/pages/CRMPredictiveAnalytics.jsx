import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import PredictiveAnalyticsDashboard from '@/components/analytics/PredictiveAnalyticsDashboard';

export default function CRMPredictiveAnalytics() {
  return (
    <CRMLayout title="AI Analytics">
      <div className="p-6">
        <PredictiveAnalyticsDashboard />
      </div>
    </CRMLayout>
  );
}