import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import TaskAutomation from '@/components/crm/TaskAutomation';

export default function CRMTaskTemplates() {
  return (
    <CRMLayout title="Task Automation">
      <div className="max-w-5xl">
        <TaskAutomation />
      </div>
    </CRMLayout>
  );
}