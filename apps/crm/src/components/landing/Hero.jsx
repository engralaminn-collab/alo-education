import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Globe, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const countries = [
  { name: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920' },
  { name: 'USA', image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1920' },
  { name: 'Canada', image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1920' },
  { name: 'Australia', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1920' },
  { name: 'Germany', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920' },
  { name: 'Ireland', image: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=1920' },
];

export default function Hero({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [country, setCountry] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [currentCountryIndex, setCurrentCountryIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCountryIndex((prev) => (prev + 1) % countries.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (country) params.set('country', country);
    if (degreeLevel) params.set('degree', degreeLevel);
    window.location.href = createPageUrl('Universities') + '?' + params.toString();
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with rotating images */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCountryIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${countries[currentCountryIndex].image}')` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/50" />
      </div>

      {/* Floating Elements */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 0.1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-20 right-20 w-72 h-72 bg-alo-orange rounded-full blur-3xl"
      />
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 0.1, y: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-education-blue rounded-full blur-3xl"
      />

      <div className="relative container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-alo-orange/10 border border-alo-orange/20 rounded-full text-sunshine text-sm font-medium mb-8">
              <Globe className="w-4 h-4" />
              Your Trusted Partner for Studying Abroad
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Your Future Starts Here
            <span className="block bg-gradient-to-r from-alo-orange via-sunshine to-education-blue bg-clip-text text-transparent">
              Study Abroad
            </span>
            in the{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={currentCountryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="inline-block bg-gradient-to-r from-alo-orange to-sunshine bg-clip-text text-transparent"
              >
                {countries[currentCountryIndex].name}
              </motion.span>
            </AnimatePresence>
            {' '}& More
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-300 mb-2 max-w-2xl mx-auto"
          >
            Guiding you to global opportunities.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="tagline text-lg mb-12 max-w-2xl mx-auto"
          >
            We don't just advise, we commit.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/10"
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search universities, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/90 border-0 text-slate-800 placeholder:text-slate-500 rounded-xl"
                />
              </div>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full md:w-48 h-14 bg-white/90 border-0 rounded-xl">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="germany">Germany</SelectItem>
                  <SelectItem value="france">France</SelectItem>
                  <SelectItem value="ireland">Ireland</SelectItem>
                  <SelectItem value="netherlands">Netherlands</SelectItem>
                </SelectContent>
              </Select>
              <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                <SelectTrigger className="w-full md:w-48 h-14 bg-white/90 border-0 rounded-xl">
                  <SelectValue placeholder="Degree Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bachelor">Bachelor's</SelectItem>
                  <SelectItem value="master">Master's</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                </SelectContent>
              </Select>
              <Link to={createPageUrl('Contact')}>
                <Button 
                  className="h-14 px-8 bg-alo-orange hover:bg-alo-orange/90 text-white rounded-xl font-semibold"
                >
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
          >
            {[
              { icon: GraduationCap, value: '200+', label: 'University Partners' },
              { icon: Globe, value: '7', label: 'Countries' },
              { icon: Users, value: '1000+', label: 'Students Guided' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-3">
                  <stat.icon className="w-6 h-6 text-sunshine" />
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}