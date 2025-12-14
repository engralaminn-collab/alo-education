import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, Building2, FileText, Plane, 
  DollarSign, GraduationCap, Users, Briefcase, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

const services = [
  {
    icon: User,
    title: 'Personalized Counseling',
    description: 'Our experienced counselors provide one-to-one guidance to help you select the course and university that best match your academic background, career goals, and personal strengths. Each recommendation is carefully tailored to help you achieve your ambitions.'
  },
  {
    icon: Building2,
    title: 'University Selection',
    description: 'We assist students in choosing from top universities across the UK, USA, Australia, Canada, New Zealand, Ireland and Europe. By providing accurate and up-to-date information, we empower you to make informed decisions that align with your academic profiles, preferences, and budget.'
  },
  {
    icon: FileText,
    title: 'Application Assistance',
    description: 'Navigating university applications can be challenging. We provide full support—from completing forms and writing compelling personal statements to organizing necessary documents—ensuring every application stands out and maximizes the chances of acceptance.'
  },
  {
    icon: Plane,
    title: 'Visa Guidance',
    description: 'Securing a student visa is a crucial step. Our visa experts guide students through requirements, documentation, and timelines for the UK, USA, Australia, Canada, and more, ensuring a smooth and successful visa approval process.'
  },
  {
    icon: Target,
    title: 'Test Preparation',
    description: 'We support students preparing for standardized tests such as IELTS, TOEFL, GRE, and GMAT. With coaching classes, practice materials, and expert guidance, our students achieve competitive scores and meet university requirements.'
  },
  {
    icon: DollarSign,
    title: 'Financial Planning',
    description: 'Studying abroad requires careful financial planning. Our advisors help explore scholarships, grants, and funding options to make your international education affordable and manageable for every student.'
  },
  {
    icon: GraduationCap,
    title: 'Pre-Departure Orientation',
    description: 'Preparing for life in a new country is essential. Our orientation sessions cover cultural adaptation, travel arrangements, accommodation, health insurance, and more, ensuring students are confident and ready before departure.'
  },
  {
    icon: Users,
    title: 'Post-Arrival Support',
    description: 'Our support continues even after students arrive abroad. We assist with settling in, offer academic guidance, and connecting with other students to help you feel at home in their new environment.'
  },
  {
    icon: Briefcase,
    title: 'Career Counseling',
    description: 'Looking beyond graduation, we provide guidance on career opportunities, internships, and further studies. Through our professional network and industry connections, we help shape their future success.'
  }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-400 to-orange-500 py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Our <span className="text-blue-600">Services</span>
              </h1>
              <p className="text-lg text-slate-800 leading-relaxed">
                Welcome to ALO Education. We are committed to guiding students on their journey to study abroad with confidence and success. Our comprehensive services ensure that every student receives the support they need at every stage, making the path to international education smooth and rewarding.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&h=500&fit=crop" 
                alt="Student studying"
                className="w-80 h-80 object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-orange-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 bg-orange-100/80 shadow-sm hover:shadow-md transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}