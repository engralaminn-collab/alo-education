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
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-emerald-600 font-semibold text-sm uppercase tracking-wider"
          >
            Our Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mt-2"
          >
            Comprehensive Support for Your Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 mt-4 max-w-3xl mx-auto"
          >
            We are committed to guiding students on their journey to study abroad with confidence and success.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}