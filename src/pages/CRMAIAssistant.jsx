import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import AIAssistant from '@/components/crm/AIAssistant';

export default function CRMAIAssistant() {
  return (
    <CRMLayout title="AI Assistant">
      <AIAssistant />
    </CRMLayout>
  );
}