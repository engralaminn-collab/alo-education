import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import LeadScoringDashboard from '@/components/leads/LeadScoringDashboard';

export default function CRMLeadScoring() {
  return (
    <CRMLayout title="Lead Scoring">
      <div className="p-6">
        <LeadScoringDashboard />
      </div>
    </CRMLayout>
  );
}