import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Start Your Journey?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 mb-10"
          >
            Get personalized guidance from our expert counselors. Schedule a free consultation today.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 px-8 h-14 text-lg font-semibold">
                Book Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg">
              <Phone className="w-5 h-5 mr-2" />
              +1 (800) ALO-EDUC
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-6 text-white/80 text-sm"
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              info@aloeducation.com
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30" />
            <div>Available 24/7</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}