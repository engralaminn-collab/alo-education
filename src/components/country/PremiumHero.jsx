import React from 'react';
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, CheckCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function PremiumHero({ 
  country, 
  flagUrl, 
  title, 
  subtitle, 
  highlights = [],
  backgroundImage 
}) {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 py-24 overflow-hidden">
      {/* Background Image Overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 opacity-10">
          <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={flagUrl} 
                alt={`${country} Flag`} 
                className="w-20 h-14 rounded-lg shadow-xl border-2 border-white/20"
              />
              <div>
                <p className="text-blue-200 text-sm uppercase tracking-wider font-semibold">Study Abroad</p>
                <h1 className="text-5xl md:text-6xl font-bold text-white">
                  {title}
                </h1>
              </div>
            </div>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              {subtitle}
            </p>

            {/* Highlights */}
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              {highlights.map((highlight, i) => (
                <div key={i} className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl hover:shadow-2xl transition-all">
                  <Phone className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Courses') + `?country=${country}`}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 shadow-xl">
                  Explore Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right - Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Why {country}?</h3>
              <div className="space-y-4">
                {[
                  { label: 'World-Class Universities', value: '160+' },
                  { label: 'Average Processing Time', value: '2-4 weeks' },
                  { label: 'Post-Study Work Visa', value: '2 years' },
                  { label: 'Student Satisfaction', value: '95%' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                    <span className="text-blue-100">{stat.label}</span>
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}