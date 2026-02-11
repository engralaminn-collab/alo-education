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
<<<<<<< HEAD
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white pt-20">
=======
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

>>>>>>> last/main
      <div className="relative container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
<<<<<<< HEAD
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-slate-900">The experts on studying in</span>
              <motion.div
                key={currentDestination}
=======
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
>>>>>>> last/main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
<<<<<<< HEAD
                className="mt-3"
                style={{ color: '#0066CC' }}
=======
                className="inline-block bg-gradient-to-r from-alo-orange to-sunshine bg-clip-text text-transparent"
>>>>>>> last/main
              >
                {destinations[currentDestination]}
              </motion.div>
            </h1>

<<<<<<< HEAD
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
=======
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
>>>>>>> last/main
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
<<<<<<< HEAD
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
=======
            {[
              { icon: GraduationCap, value: '200+', label: 'University Partners' },
              { icon: Globe, value: '7', label: 'Countries' },
              { icon: Users, value: '1000+', label: 'Students Guided' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-3">
                  <stat.icon className="w-6 h-6 text-sunshine" />
>>>>>>> last/main
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}