import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  UserSearch, FileText, GraduationCap, Send, 
  FileCheck, Plane, CheckCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

const defaultSteps = [
  {
    icon: UserSearch,
    title: 'Profile Assessment',
    description: 'Free consultation to understand your goals, qualifications, and preferences',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: GraduationCap,
    title: 'University & Course Selection',
    description: 'Expert guidance on choosing the right university and program based on your profile',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FileText,
    title: 'Document Preparation',
    description: 'Complete assistance with SOP, LORs, CV, and all required documents',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: Send,
    title: 'Application Submission',
    description: 'Professional submission of applications with tracking and follow-up',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: FileCheck,
    title: 'Offer & Acceptance',
    description: 'Receive offer letters and assistance with acceptance process',
    color: 'from-violet-500 to-purple-500'
  },
  {
    icon: FileCheck,
    title: 'Visa Processing',
    description: 'Complete visa application support, document review, and interview preparation',
    color: 'from-rose-500 to-red-500'
  },
  {
    icon: Plane,
    title: 'Pre-Departure Briefing',
    description: 'Travel guidance, accommodation, and orientation for your new journey',
    color: 'from-indigo-500 to-blue-500'
  }
];

export default function StudyJourneyTimeline({ steps = defaultSteps, title = "Your Study Journey" }) {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">
            {title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We guide you through every step of your international education journey
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-emerald-200 hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow ml-0 md:ml-20 relative">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Step Number & Icon */}
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg absolute -left-8 md:-left-28 top-6`}>
                            <step.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white border-4 border-blue-200 flex items-center justify-center font-bold text-blue-600 absolute -left-5 md:-left-20 top-9 text-lg">
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2 pl-12 md:pl-0">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {/* Checkmark */}
                        <div className="flex-shrink-0 hidden sm:block">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl"
          >
            <p className="text-4xl font-bold text-blue-600 mb-2">95%</p>
            <p className="text-slate-600">Visa Success Rate</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl"
          >
            <p className="text-4xl font-bold text-purple-600 mb-2">2000+</p>
            <p className="text-slate-600">Students Placed</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl"
          >
            <p className="text-4xl font-bold text-emerald-600 mb-2">100+</p>
            <p className="text-slate-600">Partner Universities</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}