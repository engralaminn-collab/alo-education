import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, ArrowRight, CheckCircle, Users, Star, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CountryHero({ 
  country = "United Kingdom",
  flagUrl = "https://flagcdn.com/w80/gb.png",
  title,
  subtitle,
  benefits = [],
  stats = []
}) {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
      </div>

      <div className="relative container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <div className="flex items-center gap-4 mb-6">
              <img src={flagUrl} alt={`${country} Flag`} className="w-20 h-14 rounded-lg shadow-2xl border-2 border-white" />
              <div>
                <p className="text-blue-200 text-sm uppercase tracking-wide">Study Destination</p>
                <h1 className="text-5xl md:text-6xl font-bold">{country}</h1>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 text-white">
              {title || `Unlock a world-class education in ${country}`}
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              {subtitle || `Expert guidance from ALO Education Bangladesh. Top-ranked universities, globally recognised degrees, and excellent career opportunities.`}
            </p>

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-blue-100">{benefit}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl">
                  Apply Online
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.length > 0 ? stats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            )) : (
              <>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
                  <Star className="w-8 h-8 text-yellow-400 mb-3" />
                  <div className="text-3xl font-bold mb-2">160+</div>
                  <div className="text-blue-200 text-sm">Top Universities</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
                  <Users className="w-8 h-8 text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold mb-2">500K+</div>
                  <div className="text-blue-200 text-sm">International Students</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
                  <Globe className="w-8 h-8 text-cyan-400 mb-3" />
                  <div className="text-3xl font-bold mb-2">2 Years</div>
                  <div className="text-blue-200 text-sm">Post-Study Work Visa</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
                  <GraduationCap className="w-8 h-8 text-purple-400 mb-3" />
                  <div className="text-3xl font-bold mb-2">95%</div>
                  <div className="text-blue-200 text-sm">Graduate Employment</div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Sticky Consultation Button */}
      <Link to={createPageUrl('Contact')}>
        <Button 
          className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 shadow-2xl animate-pulse"
          size="lg"
        >
          <GraduationCap className="w-5 h-5 mr-2" />
          Get Free Consultation
        </Button>
      </Link>
    </section>
  );
}