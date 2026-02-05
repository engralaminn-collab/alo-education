import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, Globe, Users, Award, Target, Heart,
  CheckCircle, ArrowRight, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import WhyChooseALO from '@/components/landing/WhyChooseALO';

const values = [
  {
    icon: Target,
    title: "Student-Centric",
    description: "Every decision we make is focused on what's best for our students' success and growth.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Heart,
    title: "Integrity",
    description: "We maintain the highest ethical standards in all our partnerships and recommendations.",
    color: "bg-red-50 text-red-600"
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "We embrace diversity and help students thrive in multicultural environments.",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in every aspect of our service and guidance.",
    color: "bg-purple-50 text-purple-600"
  }
];

const stats = [
  { value: '10K+', label: 'Students Placed' },
  { value: '500+', label: 'Partner Universities' },
  { value: '50+', label: 'Countries' },
  { value: '98%', label: 'Visa Success Rate' },
];

const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    bio: "20+ years in international education"
  },
  {
    name: "Michael Chen",
    role: "Head of Admissions",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    bio: "Former university admissions director"
  },
  {
    name: "Emma Williams",
    role: "UK Programs Director",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    bio: "Oxford alumni, UK education specialist"
  },
  {
    name: "David Miller",
    role: "Student Success Manager",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    bio: "Dedicated to student experience"
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                About ALO Education
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Empowering Dreams Through Education
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                Since 2010, ALO Education has been helping students achieve their international education dreams. 
                We believe that quality education should be accessible to everyone, everywhere.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                Our Mission
              </span>
              <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-6">
                Making World-Class Education Accessible
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                At ALO Education, we're committed to breaking down barriers and making international education 
                accessible to students from all backgrounds. We provide personalized guidance, transparent 
                information, and unwavering support throughout your study abroad journey.
              </p>
              <ul className="space-y-3">
                {[
                  'Personalized university and course matching',
                  'Expert visa and application guidance',
                  'Scholarship assistance and financial planning',
                  'Pre-departure and post-arrival support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
                alt="Students"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -left-8 bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">15+</div>
                    <div className="text-slate-500">Years Experience</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
              Our Values
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl ${value.color} flex items-center justify-center mb-4`}>
                      <value.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
              Our Team
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">
              Meet The Experts
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all group">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-5 text-center">
                    <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                    <p className="text-emerald-600 font-medium text-sm mb-2">{member.role}</p>
                    <p className="text-slate-500 text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose ALO */}
      <WhyChooseALO context={{ page: 'about' }} />

      {/* CTA */}
      <section className="py-20 bg-gradient-brand">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Let's discuss your goals and create a personalized plan for your success.
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 px-8 h-14 text-lg">
                Book Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}