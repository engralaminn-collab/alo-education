import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultTestimonials = [
  {
    name: 'Rahul Sharma',
    university: 'University of Manchester',
    course: 'MSc Computer Science',
    country: 'UK',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    text: 'ALO Education made my UK application seamless. The counselor support and CRM portal kept me organized throughout. Now studying my dream course!'
  },
  {
    name: 'Priya Patel',
    university: 'Imperial College London',
    course: 'MSc Data Science',
    country: 'UK',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    text: 'The AI course matcher recommended perfect programs. Got offers from 3 top universities and secured a scholarship. Highly recommend!'
  },
  {
    name: 'Ahmed Khan',
    university: 'University of Edinburgh',
    course: 'MBA',
    country: 'UK',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    text: 'Professional guidance from start to finish. Visa process was stress-free thanks to their step-by-step tracking system.'
  },
  {
    name: 'Sneha Reddy',
    university: 'King\'s College London',
    course: 'LLM International Law',
    country: 'UK',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    text: 'The WhatsApp alerts and document tracking saved me so much time. Got my visa approved within 3 weeks. Excellent service!'
  }
];

export default function StudentTestimonials({ testimonials = defaultTestimonials, country }) {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Student Success Stories</h2>
          <p className="text-xl text-blue-200">
            Real students, real results - hear from those who made it to {country}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all h-full">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-emerald-400 mb-4" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Student Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-blue-200 truncate">{testimonial.course}</p>
                      <p className="text-xs text-blue-300">{testimonial.university}</p>
                    </div>
                  </div>

                  {/* Success Badge */}
                  <Badge className="mt-4 bg-emerald-500 text-white border-0">
                    ✓ Successfully Enrolled
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-xl text-blue-200 mb-4">Join 5,000+ successful students</p>
          <Badge className="bg-white text-blue-900 px-6 py-2 text-lg">
            95% Visa Success Rate
          </Badge>
        </div>
      </div>
    </section>
  );
}