import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent } from "@/components/ui/card";

export default function CRMTestimonials() {
  return (
    <CRMLayout title="Testimonials">
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          <p>Testimonials management coming soon</p>
        </CardContent>
      </Card>
    </CRMLayout>
  );
}