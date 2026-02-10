import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle, Building2, FileText, Plane, BookOpen, 
  DollarSign, Briefcase, GraduationCap, Globe, HeartHandshake
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: UserCircle,
    title: 'Personalized Counseling',
    description: 'Our experienced counselors provide one-to-one guidance to help you select the course and university that best match your academic background, career goals, and personal strengths.'
  },
  {
    icon: Building2,
    title: 'University Selection',
    description: 'We assist students in choosing from top-ranked universities across the UK, USA, Australia, Canada, New Zealand, Ireland and Europe with accurate and up-to-date information.'
  },
  {
    icon: FileText,
    title: 'Application Assistance',
    description: 'Full support from completing forms and writing compelling personal statements to organizing necessary documents—ensuring every application stands out.'
  },
  {
    icon: Plane,
    title: 'Visa Guidance',
    description: 'Our visa experts guide students through requirements, documentation, and interview preparation to help ensure a smooth and successful visa approval process.'
  },
  {
    icon: BookOpen,
    title: 'Test Preparation',
    description: 'Support for IELTS, TOEFL, GRE, and GMAT preparation with coaching classes, practice materials, and expert guidance to achieve competitive scores.'
  },
  {
    icon: DollarSign,
    title: 'Financial Planning',
    description: 'Our advisors help explore scholarships, grants, and funding options to make international education more affordable and manageable for every student.'
  },
  {
    icon: GraduationCap,
    title: 'Pre-Departure Orientation',
    description: 'Orientation sessions covering cultural adaptation, travel arrangements, accommodation, and health insurance, ensuring students are confident and ready.'
  },
  {
    icon: Globe,
    title: 'Post-Arrival Support',
    description: 'Our support continues after arrival with assistance in settling in, academic guidance, and connecting with other students to feel at home.'
  },
  {
    icon: Briefcase,
    title: 'Career Counseling',
    description: 'Guidance on career opportunities, internships, and further studies through our professional network and alumni connections.'
  },
  {
    icon: HeartHandshake,
    title: 'Ongoing Mentorship',
    description: 'Continuous support throughout your entire study abroad journey, from application to graduation and beyond.'
  }
];

export default function Services() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#FFB347' }}>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600"
          alt="Student studying"
          className="w-80 h-auto rounded-l-3xl shadow-2xl"
        />
      </div>
      <div className="container mx-auto px-6">
<<<<<<< HEAD
        <div className="text-center mb-16 max-w-4xl mx-auto">
=======
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-alo-orange font-semibold text-sm uppercase tracking-wider"
          >
            Our Services
          </motion.span>
>>>>>>> last/main
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-black mb-4"
          >
            Our <span style={{ color: '#0066CC' }}>Services</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-black"
          >
            Welcome to <strong>ALO Education!</strong> We are committed to guiding students on their journey to study abroad with confidence and success. Our comprehensive services ensure that every student receives the support they need at every stage, making the path to international education smooth and rewarding.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 hover:shadow-xl transition-all duration-300 h-full group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}>
                <CardContent className="p-6">
<<<<<<< HEAD
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#0066CC' }}>
=======
                  <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
>>>>>>> last/main
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">{service.title}</h3>
                  <p className="text-black leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}