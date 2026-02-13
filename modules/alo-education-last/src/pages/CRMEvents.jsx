import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import EventManagementDashboard from '@/components/events/EventManagementDashboard';

export default function CRMEvents() {
  return (
    <CRMLayout title="Event Management">
      <div className="p-6">
        <EventManagementDashboard />
      </div>
    </CRMLayout>
  );
}