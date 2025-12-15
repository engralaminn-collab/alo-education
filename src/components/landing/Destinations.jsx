import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const destinations = [
  {
    country: "United Kingdom",
    code: "uk",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&h=1200",
    universities: 150,
    students: "3,200+",
    page: "StudyInUK"
  },
  {
    country: "Australia",
    code: "australia",
    image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600&h=1200",
    universities: 45,
    students: "1,800+",
    page: "StudyInAustralia"
  },
  {
    country: "Canada",
    code: "canada",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600&h=1200",
    universities: 80,
    students: "2,100+",
    page: "StudyInCanada"
  },
  {
    country: "Ireland",
    code: "ireland",
    image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=1600&h=1200",
    universities: 35,
    students: "750+",
    page: "StudyInIreland"
  },
  {
    country: "New Zealand",
    code: "newzealand",
    image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&h=1200",
    universities: 8,
    students: "500+",
    page: "StudyInNewZealand"
  },
  {
    country: "USA",
    code: "usa",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600&h=1200",
    universities: 200,
    students: "4,500+",
    page: "StudyInUSA"
  },
  {
    country: "Dubai",
    code: "dubai",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&h=1200",
    universities: 20,
    students: "600+",
    page: "StudyInDubai"
  }
];

export default function Destinations() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>
            Destinations
          </h2>
          <p className="text-xl text-slate-600">
            Explore study opportunities in top countries around the world
          </p>
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
              <Link to={createPageUrl(dest.page)}>
                <div className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all">
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
                        <span style={{ color: 'var(--alo-orange)' }} className="font-semibold">{dest.universities}</span> Universities
                        <span className="mx-2">•</span>
                        <span style={{ color: 'var(--alo-orange)' }} className="font-semibold">{dest.students}</span> Students
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                      >
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