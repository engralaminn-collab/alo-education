import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Award, TrendingUp } from 'lucide-react';

export default function AboutUs() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-emerald-600 font-semibold text-sm uppercase tracking-wider"
            >
              About Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mt-2"
            >
              Who We Are
            </motion.h2>
          </div>

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none mb-16"
          >
            <p className="text-slate-600 leading-relaxed mb-4">
              In February 2023, ALO Education was founded by Taslima Akter, who envisioned creating a platform that would connect ambitious students with world-class education opportunities abroad. That same year, our first office opened in Dhaka, Bangladesh, with an initial focus on assisting students in Bangladesh to secure admissions into leading universities and colleges in the UK, USA, Australia, Canada, New Zealand, Ireland and Europe.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Guided by the founder's vision of trust, transparency, and professionalism, we set a clear strategy to expand our services beyond Bangladesh. Today, ALO Education continues to grow with the mission of offering global opportunities and becoming a trusted partner in international education consultancy.
            </p>
          </motion.div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                At ALO Education, our mission is simple yet powerful: turning student dreams into global opportunities. We strive to be a trusted pathway to world-class education, guiding every student with honesty, professionalism, and care. By offering transparent counseling and authentic guidance, we help students choose the right programs that match their ambitions and potential.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                The vision of ALO Education is to become a globally recognized education consultancy that inspires trust, integrity, and excellence. We aspire to guide students toward courses and institutions that best suit their academic interests, career goals, and personal growth. Our focus is on nurturing the holistic development of students by enhancing their knowledge, skills, and confidence so they can thrive in a competitive world.
              </p>
            </motion.div>
          </div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: Award, title: 'Excellence', desc: 'Committed to delivering the highest quality guidance and support' },
              { icon: Target, title: 'Trust', desc: 'Building lasting relationships through transparency and integrity' },
              { icon: TrendingUp, title: 'Innovation', desc: 'Continuously improving our services to meet evolving needs' }
            ].map((value, i) => (
              <div key={i} className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h4>
                <p className="text-slate-600 text-sm">{value.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}