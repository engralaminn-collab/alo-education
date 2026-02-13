import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent } from "@/components/ui/card";

export default function CRMAutomation() {
  return (
    <CRMLayout title="Automation">
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          <p>Automation features coming soon</p>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}