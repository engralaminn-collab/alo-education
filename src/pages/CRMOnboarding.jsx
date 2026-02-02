import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import StudentOnboardingWorkflow from '@/components/crm/StudentOnboardingWorkflow';

export default function CRMOnboarding() {
  return (
    <CRMLayout title="Student Onboarding">
      <StudentOnboardingWorkflow />
    </CRMLayout>
  );
}