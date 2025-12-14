import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Tushar Imran Nahid",
    university: "Ravensbourne University London",
    course: "BSc Business Management",
    image: "https://scontent.fdac31-1.fna.fbcdn.net/v/t39.30808-6/469828394_122150633858384088_8449471677932014423_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHy7oOlNCfQsDW8AxIEVjvfcFcK_1AUBvZwVwr_UBQG9itR-Ik1Q0wOxAshCr3wLdN_VGrm0L1FxKFCW3tKWCbV&_nc_ohc=4dKj9pPhNqUQ7kNvgFOA85d&_nc_zt=23&_nc_ht=scontent.fdac31-1.fna&_nc_gid=AInr33HRYmrn0zMz_fvdWAJ&oh=00_AYBiRWH1d5a-uNZjd9YCFHtC8HCOYl3f6D8xQMO6BHCVig&oe=67635047",
    rating: 5,
    text: "I have recently received my UK student visa for my BSc in Business Management with International Year at Ravensbourne University London. Due to some technical issues, the process took a little longer than expected and both I and my family were quite stressed. However, ALO Education Consultancy gave me full support, courage, and proper guidance throughout the entire journey. I am extremely satisfied with their service and professionalism. I highly recommend everyone to apply for their visa through ALO Education. They are simply the best!"
  },
  {
    name: "Ummaye Mayesha Mannan",
    university: "University of Derby",
    course: "MRes Leadership and Management",
    image: "https://scontent.fdac31-1.fna.fbcdn.net/v/t39.30808-6/469859881_122150633876384088_1502542672464988169_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeErCtgEWxl1NVQ_gXjbV_NcxABtTk8hWe3EAG1OTyFZ7QpWRqy8eJWh9cZhx1eQGxHGFq86xcLHVpxpHcwZZqb4&_nc_ohc=qdvPUqCNhY0Q7kNvgE5UVPW&_nc_zt=23&_nc_ht=scontent.fdac31-1.fna&_nc_gid=AVlgFhgqJCOtDjF1P3qWY7i&oh=00_AYC_5AUTsUeHOnXL2BWu5IiVmrDCYxHT-TuJ40A7HYNt3A&oe=67632F24",
    rating: 5,
    text: "I recently received my UK student visa for Master of Research in Leadership and Management at University of Derby. ALO Education Consultancy provided full support, guidance, and encouragement throughout. I'm extremely satisfied with their professionalism and highly recommend their services."
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

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                  <p className="text-slate-500 text-sm">{testimonial.course}</p>
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