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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #A8E6CF 0%, #DCEDC1 100%)' }}>
      <div className="relative container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">The experts on studying in</span>
              <motion.div
                key={currentDestination}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-2"
                style={{ color: '#0066CC' }}
              >
                {destinations[currentDestination]}
              </motion.div>
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8"
            >
              <Link to={createPageUrl('Contact')}>
                <Button 
                  className="h-14 px-8 text-white rounded-full font-semibold text-lg hover:scale-105 transition-transform"
                  style={{ backgroundColor: '#F37021' }}
                >
                  Book free counselling
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mt-8 text-sm text-slate-600"
            >
              <span>0{currentDestination + 1} / 0{destinations.length}</span>
              <ArrowRight className="w-4 h-4" />
              <span>{destinations[currentDestination]}</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full h-[500px]">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400"
                  alt="Student"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-32 left-0 w-72 h-56 rounded-3xl overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400"
                  alt="Studying"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-20 w-64 h-48 rounded-3xl overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400"
                  alt="Campus"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}