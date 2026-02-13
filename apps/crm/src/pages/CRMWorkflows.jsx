import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import WorkflowAutomationBuilder from '@/components/crm/WorkflowAutomationBuilder';

export default function CRMWorkflows() {
  return (
    <CRMLayout title="Workflow Automation">
      <div className="p-6">
        <WorkflowAutomationBuilder />
      </div>
    </CRMLayout>
  );
}