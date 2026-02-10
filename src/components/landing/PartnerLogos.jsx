import React from 'react';
import { motion } from 'framer-motion';

const partners = [
  { name: 'University of Oxford', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/120px-Oxford-University-Circlet.svg.png' },
  { name: 'Cambridge', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/University_of_Cambridge_logo.svg/120px-University_of_Cambridge_logo.svg.png' },
  { name: 'Harvard', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_wreath.svg/120px-Harvard_shield_wreath.svg.png' },
  { name: 'Stanford', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/120px-Seal_of_Leland_Stanford_Junior_University.svg.png' },
  { name: 'MIT', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/120px-MIT_logo.svg.png' },
  { name: 'University of Toronto', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/UofT_Logo.svg/120px-UofT_Logo.svg.png' },
];

export default function PartnerLogos() {
  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
<<<<<<< HEAD
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Trusted by Leading <span style={{ color: '#0066CC' }}>Universities Worldwide</span>
          </h3>
          <p className="text-slate-600">Partner institutions across the globe</p>
=======
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
>>>>>>> last/main
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-16 w-auto object-contain"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}