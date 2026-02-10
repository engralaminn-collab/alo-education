import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const destinations = [
  {
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    universities: '150+',
    students: '10,000+',
    page: 'StudyInUK'
  },
  {
    country: 'Canada',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800',
    universities: '120+',
    students: '9,000+',
    page: 'StudyInCanada'
  },
  {
    country: 'Australia',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
    universities: '100+',
    students: '8,000+',
    page: 'StudyInAustralia'
  },
  {
    country: 'Dubai',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    universities: '30+',
    students: '3,000+',
    page: 'StudyInDubai'
  },
  {
    country: 'Ireland',
    image: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=800',
    universities: '50+',
    students: '5,000+',
    page: 'StudyInIreland'
  },
  {
    country: 'New Zealand',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    universities: '40+',
    students: '4,000+',
    page: 'StudyInNewZealand'
  },
  {
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
    universities: '200+',
    students: '15,000+',
    page: 'StudyInUSA'
  },
];

export default function Destinations() {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState(0);
  const tabs = destinations.map(d => d.country);
=======
  return (
    <section className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sunshine font-semibold text-sm uppercase tracking-wider"
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
>>>>>>> last/main

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Start your journey with the right{' '}
            <span style={{ color: '#0066CC' }}>destination</span>—and the right advice
          </h2>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === index
                  ? 'text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={activeTab === index ? { backgroundColor: '#0066CC' } : {}}
            >
<<<<<<< HEAD
              {tab}
            </button>
=======
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
                        <span className="text-sunshine font-semibold">{dest.universities}</span> Universities
                        <span className="mx-2">•</span>
                        <span className="text-sunshine font-semibold">{dest.students}</span> Students
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-education-blue transition-colors">
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
>>>>>>> last/main
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <Link to={createPageUrl(destinations[activeTab].page)}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
                <img
                  src={destinations[activeTab].image}
                  alt={destinations[activeTab].country}
                  className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                  <h3 className="text-4xl font-bold mb-4">{destinations[activeTab].country}</h3>
                  <div className="flex items-center gap-8 mb-6">
                    <div>
                      <p className="text-3xl font-bold">{destinations[activeTab].universities}</p>
                      <p className="text-slate-300">Universities</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{destinations[activeTab].students}</p>
                      <p className="text-slate-300">Students Placed</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:gap-4" style={{ backgroundColor: '#F37021', color: 'white' }}>
                    Explore {destinations[activeTab].country}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}