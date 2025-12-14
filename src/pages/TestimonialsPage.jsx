import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Footer from '@/components/landing/Footer';

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: 'var(--alo-blue)' }}>
          Student Testimonials
        </h1>
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            <p>Testimonials page coming soon</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}