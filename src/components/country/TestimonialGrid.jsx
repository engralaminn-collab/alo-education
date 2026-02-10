import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestimonialGrid({ testimonials = [], country }) {
  // Filter testimonials by country if provided
  const filtered = country 
    ? testimonials.filter(t => t.country === country && t.status === 'approved')
    : testimonials.filter(t => t.status === 'approved');

  if (filtered.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">
            Success Stories
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Hear from students who achieved their dream of studying in {country}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filtered.slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-blue-200 mb-4" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-slate-700 mb-6 leading-relaxed line-clamp-4">
                    "{testimonial.testimonial_text}"
                  </p>

                  {/* Student Info */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Avatar className="w-12 h-12">
                      {testimonial.student_photo ? (
                        <AvatarImage src={testimonial.student_photo} alt={testimonial.student_name} />
                      ) : null}
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {testimonial.student_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">
                        {testimonial.student_name}
                      </p>
                      <p className="text-sm text-slate-600 truncate">
                        {testimonial.course}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {testimonial.university}
                      </p>
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {testimonial.is_featured && (
                    <Badge className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Featured Story
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}