import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react';
import Footer from '@/components/landing/Footer';

export default function TestimonialsPage() {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => base44.entities.Testimonial.filter({ status: 'approved' }),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <section style={{ background: 'var(--alo-blue)' }} className="py-16">
        <div className="container mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Student Testimonials</h1>
          <p className="text-xl opacity-90">Hear from students who achieved their dreams</p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.id} className="alo-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4">{t.testimonial_text}</p>
                  <div className="flex items-center gap-3">
                    {t.student_photo && (
                      <img src={t.student_photo} alt={t.student_name} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{t.student_name}</p>
                      <p className="text-sm text-slate-500">{t.university}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}