import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultTestimonials = [
  {
    name: "Rafiq Ahmed",
    university: "University of Oxford",
    country: "United Kingdom",
    course: "MSc Computer Science",
    photo: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "ALO Education made my dream of studying at Oxford a reality. Their personalized guidance and support throughout the visa process was exceptional."
  },
  {
    name: "Nusrat Jahan",
    university: "Imperial College London",
    country: "United Kingdom",
    course: "MSc Data Science",
    photo: "https://i.pravatar.cc/150?img=45",
    rating: 5,
    text: "The counselors were incredibly knowledgeable and helped me secure a scholarship. I couldn't have done it without their expertise."
  },
  {
    name: "Tanvir Hassan",
    university: "University of Manchester",
    country: "United Kingdom",
    course: "MBA",
    photo: "https://i.pravatar.cc/150?img=33",
    rating: 5,
    text: "From course selection to visa approval, the entire process was smooth. Their smart portal made tracking everything so easy."
  },
];

export default function TestimonialGrid({ testimonials = defaultTestimonials }) {
  return (
    <section className="bg-slate-50 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Success Stories from Bangladesh
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join thousands of Bangladeshi students who achieved their dreams with our guidance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all h-full">
                <CardContent className="p-6">
                  <Quote className="w-10 h-10 text-blue-400 mb-4" />
                  
                  <p className="text-slate-700 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center gap-4 border-t pt-4">
                    <img 
                      src={testimonial.photo} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600">{testimonial.course}</p>
                      <p className="text-xs text-blue-600 font-medium">{testimonial.university}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}