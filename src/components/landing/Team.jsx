import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin } from 'lucide-react';

const team = [
  {
    name: 'Taslima Akter',
    title: 'Chief Executive Officer',
    bio: 'Taslima Akter, the founder and CEO of ALO Education, leads the organization with a clear vision and strategic foresight. With her deep understanding of international education and a passion for empowering students, she drives innovation, growth, and excellence across all services. Under her leadership, ALO Education has become a trusted platform for students aspiring to study abroad.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
  },
  {
    name: 'Al Aminn',
    title: 'Chief Operating Officer',
    bio: 'Al Aminn, our COO, ensures the seamless operation of ALO Education's day-to-day activities. He oversees processes, maintains efficiency, and implements quality standards across all departments. His focus on operational excellence ensures that every student receives consistent, reliable, and professional guidance throughout their study abroad journey.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'
  },
  {
    name: 'Mohammad Khairul Islam',
    title: 'Chief Business Development Officer',
    bio: 'Mohammad Khairul Islam, our CBDO, leads business growth and strategic partnerships for ALO Education. He identifies new opportunities, builds collaborations with top-ranked universities, and develops initiatives to expand educational access globally. His work ensures that students have a wide range of opportunities and pathways to pursue their academic dreams.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
  },
  {
    name: 'Md Shakil Hossain',
    title: 'Head of Admission',
    bio: 'Md Shakil Hossain manages the admissions process with precision and dedication. He provides personalized counseling, guides students through application procedures, and ensures that every step is smooth and transparent. Shakil's commitment to student success makes the journey of studying abroad efficient, stress-free, and rewarding.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  }
];

export default function Team() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-emerald-600 font-semibold text-sm uppercase tracking-wider"
          >
            Our Leadership
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mt-2"
          >
            Meet the ALO's Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 mt-4"
          >
            Our Commitment to Your Study-Abroad Dream
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-emerald-400 font-medium">{member.title}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-slate-600 leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}