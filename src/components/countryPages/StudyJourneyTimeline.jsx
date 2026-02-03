import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultSteps = [
  { title: 'Complete Profile', description: 'Share your academic background and preferences', icon: '📝' },
  { title: 'Get Recommendations', description: 'AI-powered course and university matches', icon: '🎯' },
  { title: 'Apply Online', description: 'Submit applications through our smart portal', icon: '📤' },
  { title: 'Track Status', description: 'Real-time updates on your applications', icon: '📊' },
  { title: 'Receive Offer', description: 'Get conditional or unconditional offers', icon: '🎉' },
  { title: 'Visa Support', description: 'Complete visa guidance and documentation', icon: '✈️' },
];

export default function StudyJourneyTimeline({ steps = defaultSteps }) {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Your Study Journey, Step by Step
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From profile to departure, we guide you through every milestone
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute top-20 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-emerald-400 hidden md:block" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all relative">
                  {/* Step Number */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg z-10">
                    {index + 1}
                  </div>
                  
                  <CardContent className="pt-10 pb-6 text-center">
                    <div className="text-5xl mb-4">{step.icon}</div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}