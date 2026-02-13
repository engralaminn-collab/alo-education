import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent } from "@/components/ui/card";

export default function CRMTasks() {
  return (
    <CRMLayout title="Tasks">
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          <p>Tasks management coming soon</p>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}