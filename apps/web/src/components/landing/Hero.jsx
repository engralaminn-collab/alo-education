import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Globe, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Hero({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [country, setCountry] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (country) params.set('country', country);
    if (degreeLevel) params.set('degree', degreeLevel);
    window.location.href = createPageUrl('Universities') + '?' + params.toString();
  };

  const destinations = [
    'United Kingdom',
    'Australia',
    'Canada',
    'Dubai',
    'Ireland',
    'New Zealand',
    'United States'
  ];

  const [currentDestination, setCurrentDestination] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestination((prev) => (prev + 1) % destinations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white pt-20">
      <div className="relative container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-slate-900">The experts on studying in</span>
              <motion.div
                key={currentDestination}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-3"
                style={{ color: '#0066CC' }}
              >
                {destinations[currentDestination]}
              </motion.div>
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-10"
            >
              <Link to={createPageUrl('Contact')}>
                <Button 
                  className="h-16 px-10 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
                  style={{ backgroundColor: '#F37021', color: '#000000' }}
                >
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mt-10 text-sm font-medium text-slate-700"
            >
              <span className="text-[#0066CC]">0{currentDestination + 1}</span>
              <div className="w-8 h-0.5 bg-[#F37021]" />
              <span>0{destinations.length}</span>
              <span className="ml-2 text-slate-600">{destinations[currentDestination]}</span>
            </motion.div>
          </motion.div>

          <motion.div
            key={`image-${currentDestination}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full h-[550px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={
                  currentDestination === 0 ? 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' : // UK
                  currentDestination === 1 ? 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800' : // Australia
                  currentDestination === 2 ? 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800' : // Canada
                  currentDestination === 3 ? 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' : // Dubai
                  currentDestination === 4 ? 'https://images.unsplash.com/photo-1605106715994-18d3fecffb98?w=800' : // Ireland
                  currentDestination === 5 ? 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800' : // New Zealand
                  'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800' // USA
                }
                alt={destinations[currentDestination]}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <p className="text-sm font-medium text-slate-600">Currently viewing</p>
                  <p className="text-xl font-bold text-[#0066CC] mt-1">{destinations[currentDestination]}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}