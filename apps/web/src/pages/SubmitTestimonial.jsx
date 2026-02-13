import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Footer from '@/components/landing/Footer';

export default function SubmitTestimonial() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-16">
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            <p>Testimonial submission form coming soon</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}