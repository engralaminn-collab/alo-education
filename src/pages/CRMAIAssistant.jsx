import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent } from "@/components/ui/card";

export default function CRMAIAssistant() {
  return (
    <CRMLayout title="AI Assistant">
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          <p>AI Assistant features coming soon</p>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}