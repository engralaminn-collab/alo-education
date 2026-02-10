import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, FileCheck, Plane } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: "Discover",
    description: "Explore universities and courses that match your profile and preferences.",
    color: "from-education-blue to-blue-600"
  },
  {
    icon: UserCheck,
    title: "Get Matched",
    description: "Connect with a dedicated counselor who understands your goals.",
    color: "from-alo-orange to-sunshine"
  },
  {
    icon: FileCheck,
    title: "Apply",
    description: "We guide you through applications, documents, and submissions.",
    color: "from-education-blue to-alo-orange"
  },
  {
    icon: Plane,
    title: "Fly Away",
    description: "Get your visa, pack your bags, and start your adventure!",
    color: "from-sunshine to-alo-orange"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden lg:block" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-alo-orange font-semibold text-sm uppercase tracking-wider"
          >
            Simple Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mt-2"
          >
            How It Works
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className="text-center">
                {/* Step Number */}
                <div className="relative inline-flex mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-slate-300 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}