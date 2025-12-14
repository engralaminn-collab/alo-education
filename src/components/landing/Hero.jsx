import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const countries = [
  {
    name: 'Canada',
    image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
    landmark: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600'
  },
  {
    name: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    landmark: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600'
  },
  {
    name: 'Australia',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
    landmark: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600'
  },
  {
    name: 'United States',
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
    landmark: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600'
  },
  {
    name: 'Germany',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
    landmark: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600'
  },
  {
    name: 'Ireland',
    image: 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?w=800',
    landmark: 'https://images.unsplash.com/photo-1519145255040-947354638e1d?w=600'
  }
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % countries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentCountry = countries[currentIndex];

  return (
    <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="relative z-10">
            {/* Yellow Arrow */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute -left-20 -top-10 hidden xl:block"
            >
              <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
                <path 
                  d="M10 140 L100 50 L90 60 L130 20 L90 60 L100 50" 
                  stroke="#FFEB3B" 
                  strokeWidth="15" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Your Trusted Partner
              <br />
              for Studying Abroad in{' '}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentCountry.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-blue-600"
                >
                  {currentCountry.name}
                </motion.span>
              </AnimatePresence>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-slate-600 mb-8"
            >
              From your ambition to admission, we're with you all the way
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Link to={createPageUrl('BookConsultation')}>
                <Button 
                  size="lg"
                  className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-lg"
                >
                  Book a Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCountry.name}
                initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-full"
              >
                {/* Isometric Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[450px] h-[450px]" style={{ transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)' }}>
                    {/* Isometric Platform */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl shadow-2xl" style={{ transform: 'translateZ(-50px)' }}>
                      {/* Country Image Overlay */}
                      <div 
                        className="absolute inset-4 rounded-2xl bg-cover bg-center"
                        style={{ backgroundImage: `url(${currentCountry.landmark})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}