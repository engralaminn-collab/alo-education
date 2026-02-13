import React from 'react';
import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: 'Taslima Akter',
    title: 'Founder & CEO',
    bio: 'Visionary leader with a passion for making international education accessible to all students.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
  },
  {
    name: 'Sarah Johnson',
    title: 'Head of Admissions',
    bio: 'Expert in university applications with 10+ years of experience in international education.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
  },
  {
    name: 'Michael Chen',
    title: 'Visa & Immigration Specialist',
    bio: 'Dedicated to ensuring smooth visa processes for all students with expertise in global immigration.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  },
  {
    name: 'Emily Rodriguez',
    title: 'Career Counselor',
    bio: 'Passionate about guiding students to achieve their career goals through education.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'
  }
];

export default function Team() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Meet Our <span style={{ color: '#0066CC' }}>Expert Team</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our dedicated professionals are here to guide you every step of the way
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="font-semibold mb-3" style={{ color: '#F37021' }}>{member.title}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}