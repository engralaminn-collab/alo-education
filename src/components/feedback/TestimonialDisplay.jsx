import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestimonialDisplay({ testimonials, variant = 'grid' }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className={variant === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Quote className="w-5 h-5 text-alo-orange" />
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>

              <h4 className="font-bold text-slate-900 mb-2">{testimonial.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-4">
                {testimonial.comment}
              </p>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-sm font-semibold text-education-blue">
                  {testimonial.student_name || 'Verified Student'}
                </p>
                {testimonial.milestone && (
                  <p className="text-xs text-slate-500 capitalize">
                    {testimonial.milestone.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}