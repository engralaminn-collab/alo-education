import React from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Users } from 'lucide-react';

export default function TrustBanner() {
  const stats = [
    {
      icon: Star,
      title: '4.9/5',
      subtitle: 'Reviews by 5k+ students'
    },
    {
      icon: Calendar,
      title: '2023',
      subtitle: 'Established'
    },
    {
      icon: Users,
      title: '10,000+',
      subtitle: 'Students assisted'
    }
  ];

  return (
    <section className="py-16 bg-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            You're in good hands
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Whether you are applying to a university abroad, preparing for language tests, or looking for funding support, you don't need to have it all figured out.
          </p>
          <p className="text-lg text-slate-300 font-semibold mt-2">
            That's why we're here.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F37021' }}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{stat.title}</h3>
              <p className="text-slate-300">{stat.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}