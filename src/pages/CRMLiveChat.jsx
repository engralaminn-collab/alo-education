import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import LiveChatDashboard from '@/components/crm/LiveChatDashboard';

export default function CRMLiveChat() {
  return (
    <CRMLayout title="Live Chat Support">
      <LiveChatDashboard />
    </CRMLayout>
  );
}