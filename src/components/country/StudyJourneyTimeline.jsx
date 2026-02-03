import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultSteps = [
  {
    step: 1,
    title: 'Profile Assessment',
    description: 'Complete your profile and let our AI analyze your eligibility',
    duration: '1 day'
  },
  {
    step: 2,
    title: 'University & Course Selection',
    description: 'Get personalized recommendations based on your goals',
    duration: '3-5 days'
  },
  {
    step: 3,
    title: 'Application Preparation',
    description: 'We help you prepare SOP, LORs, and all required documents',
    duration: '1-2 weeks'
  },
  {
    step: 4,
    title: 'Application Submission',
    description: 'Submit applications to your chosen universities',
    duration: '1 week'
  },
  {
    step: 5,
    title: 'Offer Letter',
    description: 'Receive and accept your university offer',
    duration: '2-8 weeks'
  },
  {
    step: 6,
    title: 'Visa Application',
    description: 'Complete visa process with our expert guidance',
    duration: '4-6 weeks'
  },
  {
    step: 7,
    title: 'Pre-Departure',
    description: 'Accommodation, travel, and orientation support',
    duration: '2 weeks'
  }
];

export default function StudyJourneyTimeline({ steps = defaultSteps, country }) {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Your Journey to {country}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A clear, step-by-step roadmap from application to enrollment
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-200 hidden md:block"></div>
              )}

              <div className="flex items-start gap-6 mb-8">
                {/* Step Number */}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {step.step}
                  </div>
                </div>

                {/* Content Card */}
                <Card className="flex-1 border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">{step.description}</p>
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>CRM-tracked milestone</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Timeline */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-4 rounded-2xl shadow-xl">
            <p className="text-sm uppercase tracking-wider mb-1">Total Timeline</p>
            <p className="text-3xl font-bold">12-16 weeks</p>
          </div>
        </div>
      </div>
    </section>
  );
}