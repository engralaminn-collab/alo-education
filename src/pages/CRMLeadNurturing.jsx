import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent } from "@/components/ui/card";

export default function CRMLeadNurturing() {
  return (
    <CRMLayout title="Lead Nurturing">
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          <p>Lead nurturing features coming soon</p>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}