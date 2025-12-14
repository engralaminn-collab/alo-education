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

  return (
    <section 
      className="relative min-h-[80vh] flex items-center bg-cover bg-center"
      style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920)',
      }}
    >
      {/* Blue Overlay 70% */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 102, 204, 0.7)' }}></div>

      <div className="relative container mx-auto px-6 py-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Unlock a world-class education abroad with expert guidance
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl">
              Study abroad with globally recognised education, strong career prospects, and a welcoming environment for international students. At ALO Education, we guide you every step of the way—from choosing the right course to submitting a strong application.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button
                  size="lg"
                  className="h-14 px-8 text-white rounded-xl font-semibold text-lg"
                  style={{ backgroundColor: '#F37021' }}
                >
                  Book Free Counselling
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600"
              >
                Download Education Guide
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}