import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah Ahmed',
    university: 'University of Manchester',
    course: 'MSc Computer Science',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    rating: 5,
    text: 'ALO Education made my dream of studying in the UK a reality. Their guidance through the entire process was invaluable!',
    video: null
  },
  {
    name: 'David Chen',
    university: 'University of Toronto',
    course: 'MBA',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rating: 5,
    text: 'From application to visa, ALO Education was with me every step. Highly recommend their services!',
    video: 'https://example.com/video1.mp4'
  },
  {
    name: 'Priya Sharma',
    university: 'University of Melbourne',
    course: 'Master of Engineering',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    rating: 5,
    text: 'The counselling team helped me find the perfect course match. Now I\'m living my dream in Australia!',
    video: null
  },
  {
    name: 'Michael O\'Brien',
    university: 'Trinity College Dublin',
    course: 'MA International Relations',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    rating: 5,
    text: 'Exceptional service from start to finish. ALO Education truly cares about student success.',
    video: null
  }
];

export default function SuccessStories() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>
            Success Stories
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Hear from students who achieved their study abroad dreams with ALO Education
          </p>
          
          {/* Google Rating */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-2xl font-bold">4.9</span>
          </div>
          <p className="text-slate-600">Based on 500+ Google Reviews</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  {/* Image with Video Overlay */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4" style={{ borderColor: 'var(--alo-orange)' }}>
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {testimonial.video && (
                      <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                        <Play className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                      </button>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Name & University */}
                  <h3 className="text-lg font-bold text-center mb-1" style={{ color: 'var(--alo-blue)' }}>
                    {testimonial.name}
                  </h3>
                  <p className="text-sm font-semibold text-center mb-1" style={{ color: 'var(--alo-orange)' }}>
                    {testimonial.university}
                  </p>
                  <p className="text-xs text-slate-500 text-center mb-4">
                    {testimonial.course}
                  </p>

                  {/* Testimonial Text */}
                  <p className="text-sm text-slate-600 text-center italic">
                    "{testimonial.text}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}