import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function TestimonialsPage() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ['approved-testimonials'],
    queryFn: async () => {
      const all = await base44.entities.Testimonial.filter({ status: 'approved' }, '-created_date');
      return all;
    },
  });

  const featured = testimonials.filter(t => t.is_featured);
  const regular = testimonials.filter(t => !t.is_featured);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-emerald-600 to-cyan-600 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Student Success Stories</h1>
            <p className="text-xl text-emerald-100">
              Real experiences from students who achieved their study abroad dreams with ALO Education
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Featured Testimonials */}
        {featured.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" />
              Featured Stories
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featured.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-cyan-50 h-full">
                    <CardContent className="p-8">
                      <Quote className="w-10 h-10 text-emerald-300 mb-4" />
                      <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                        "{testimonial.testimonial_text}"
                      </p>
                      <div className="flex items-center gap-4">
                        {testimonial.student_photo ? (
                          <img 
                            src={testimonial.student_photo} 
                            alt={testimonial.student_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                            {testimonial.student_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900">{testimonial.student_name}</h4>
                          <p className="text-sm text-slate-600">{testimonial.course}</p>
                          <p className="text-sm text-slate-500">{testimonial.university} • {testimonial.country}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating 
                                    ? 'fill-amber-400 text-amber-400' 
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Testimonials */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">All Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {regular.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-4 line-clamp-4">
                      "{testimonial.testimonial_text}"
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      {testimonial.student_photo ? (
                        <img 
                          src={testimonial.student_photo} 
                          alt={testimonial.student_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {testimonial.student_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h5 className="font-semibold text-slate-900">{testimonial.student_name}</h5>
                        <p className="text-xs text-slate-500">{testimonial.university}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No testimonials yet</h3>
            <p className="text-slate-500">Be the first to share your success story!</p>
          </div>
        )}

        {/* CTA */}
        <Card className="mt-16 border-0 shadow-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Have Your Own Success Story?</h3>
            <p className="text-emerald-100 mb-6">
              Share your experience and inspire future students
            </p>
            <Link to={createPageUrl('SubmitTestimonial')}>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                Share Your Story
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}