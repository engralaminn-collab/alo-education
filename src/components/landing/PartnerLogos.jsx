import React from 'react';
import { motion } from 'framer-motion';

export default function PartnerLogos() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            200+ Global University Partners
          </h2>
          <p className="text-slate-600 mb-8">
            Trusted partnerships with leading institutions worldwide
          </p>
          
          <div className="bg-gradient-brand rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              {[
                { name: 'UK Universities', count: '70+' },
                { name: 'US Universities', count: '50+' },
                { name: 'Australian Universities', count: '40+' },
                { name: 'Canadian Universities', count: '40+' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold mb-1">{stat.count}</div>
                  <div className="text-white/80">{stat.name}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}