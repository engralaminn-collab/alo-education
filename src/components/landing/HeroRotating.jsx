import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const countries = [
  {
    name: 'Canada',
    tagline: 'From counselling to admission to visa support — ALO Education is with you at every step.',
    image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=2400&h=1800&fit=crop'
  },
  {
    name: 'United Kingdom',
    tagline: 'Experience world-class education in historic universities — we guide you through every milestone.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=2400&h=1800&fit=crop'
  },
  {
    name: 'Australia',
    tagline: 'Discover unlimited opportunities down under — ALO Education makes your journey seamless.',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=2400&h=1800&fit=crop'
  },
  {
    name: 'United States',
    tagline: 'Turn your American dream into reality — expert guidance from start to finish.',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=2400&h=1800&fit=crop'
  },
  {
    name: 'Ireland',
    tagline: 'Join the global hub of innovation and culture — ALO Education supports your ambitions.',
    image: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=2400&h=1800&fit=crop'
  },
  {
    name: 'New Zealand',
    tagline: 'Study in breathtaking landscapes with world-class education — we are here for you.',
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=2400&h=1800&fit=crop'
  }
];

export default function HeroRotating() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % countries.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = countries[currentIndex];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white pt-20">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            className="z-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Turn your dreams of<br />studying in{' '}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  style={{ color: 'var(--alo-orange)' }}
                  className="inline-block"
                >
                  {current.name}
                </motion.span>
              </AnimatePresence>
              <br />into reality
            </h1>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={`tagline-${currentIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl text-slate-600 mb-8 max-w-xl"
              >
                {current.tagline}
              </motion.p>
            </AnimatePresence>

            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg"
                className="text-lg px-8 py-6 font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--alo-orange)', color: '#000000' }}
              >
                Book Free Consultation
              </Button>
            </Link>

            {/* Country Indicators */}
            <div className="flex gap-2 mt-8">
              {countries.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-12' : 'w-8'
                  }`}
                  style={{ 
                    backgroundColor: index === currentIndex ? 'var(--alo-orange)' : '#CBD5E1'
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <div className="relative h-[500px] lg:h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
              >
                <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}