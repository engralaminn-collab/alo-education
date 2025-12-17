import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const destinations = [
  {
    country: "United Kingdom",
    code: "uk",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
    universities: 150,
    students: "3,200+"
  },
  {
    country: "United States",
    code: "usa",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800",
    universities: 200,
    students: "4,500+"
  },
  {
    country: "Canada",
    code: "canada",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800",
    universities: 80,
    students: "2,100+"
  },
  {
    country: "Australia",
    code: "australia",
    image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800",
    universities: 45,
    students: "1,800+"
  },
  {
    country: "Germany",
    code: "germany",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
    universities: 60,
    students: "900+"
  },
  {
    country: "Ireland",
    code: "ireland",
    image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=800",
    universities: 35,
    students: "750+"
  }
];

export default function Destinations() {
  return (
    <section className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-emerald-400 font-semibold text-sm uppercase tracking-wider"
          >
            Global Reach
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mt-2"
          >
            Popular Destinations
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl('Universities') + `?country=${dest.code}`}>
                <div className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer">
                  <img
                    src={dest.image}
                    alt={dest.country}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-bold text-white mb-2">{dest.country}</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-slate-300 text-sm">
                        <span className="text-emerald-400 font-semibold">{dest.universities}</span> Universities
                        <span className="mx-2">•</span>
                        <span className="text-emerald-400 font-semibold">{dest.students}</span> Students
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}