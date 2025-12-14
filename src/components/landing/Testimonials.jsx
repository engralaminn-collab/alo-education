import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Ahmed",
    country: "Pakistan",
    university: "University of Manchester",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    rating: 5,
    text: "ALO Education made my dream of studying in the UK a reality. My counselor was incredibly supportive throughout the entire process, from choosing the right university to getting my visa approved."
  },
  {
    name: "Mohamed Hassan",
    country: "Egypt",
    university: "University of Toronto",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    rating: 5,
    text: "I was overwhelmed with the application process until I found ALO. They simplified everything and helped me secure a scholarship that covered 50% of my tuition!"
  },
  {
    name: "Priya Sharma",
    country: "India",
    university: "MIT",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    rating: 5,
    text: "The course matching feature helped me find programs I never knew existed. I'm now pursuing my Master's at my dream university, all thanks to ALO Education's guidance."
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-emerald-600 font-semibold text-sm uppercase tracking-wider"
          >
            Success Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mt-2"
          >
            What Our Students Say
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 relative"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-emerald-100" />
              
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-50"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-slate-500 text-sm">{testimonial.country}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-slate-600 leading-relaxed mb-4">{testimonial.text}</p>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm">
                  <span className="text-slate-500">Now studying at</span>
                  <span className="font-semibold text-emerald-600 ml-1">{testimonial.university}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}