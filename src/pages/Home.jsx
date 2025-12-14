import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

import AboutUs from '@/components/landing/AboutUs';
import Services from '@/components/landing/Services';
import Team from '@/components/landing/Team';
import PartnerLogos from '@/components/landing/PartnerLogos';
import FeaturedUniversities from '@/components/landing/FeaturedUniversities';
import HowItWorks from '@/components/landing/HowItWorks';
import Destinations from '@/components/landing/Destinations';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const [searchType, setSearchType] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseType, setCourseType] = useState('');
  const [country, setCountry] = useState('');
  
  const { data: universities } = useQuery({
    queryKey: ['featured-universities'],
    queryFn: () => base44.entities.University.filter({ is_featured: true, status: 'active' }, '-ranking', 4),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (country) params.set('country', country);
    if (courseType) params.set('degree', courseType);
    
    const targetPage = searchType === 'courses' ? 'Courses' : 'Universities';
    window.location.href = createPageUrl(targetPage) + '?' + params.toString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Hero Section */}
      <section className="relative min-h-[85vh] bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-400 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Turn your dreams<br />
                of studying in<br />
                <span className="text-white">Bangladesh</span><br />
                into reality
              </h1>
              <Link to={createPageUrl('BookConsultation')}>
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white h-14 px-8 text-lg rounded-full shadow-xl">
                  Book Free Counselling
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 mt-8">
                <button className="text-slate-900 font-medium">←</button>
                <span className="text-slate-900 font-medium">04 / 07</span>
                <button className="text-slate-900 font-medium">→</button>
                <span className="text-slate-900 ml-4">Ireland</span>
              </div>
            </motion.div>

            {/* Right Content - Creative Photo Collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[500px] hidden lg:block"
            >
              <div className="absolute top-0 right-20 w-64 h-80 rounded-3xl overflow-hidden transform rotate-12 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400" alt="Student" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-20 right-0 w-56 h-72 rounded-3xl overflow-hidden transform -rotate-6 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400" alt="Campus" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-20 right-32 w-60 h-64 rounded-3xl overflow-hidden transform rotate-3 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400" alt="Students" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-40 right-56 w-48 h-56 rounded-3xl overflow-hidden transform -rotate-12 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400" alt="Graduate" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-slate-900 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Find your best-fit university<br />
              and course
            </h2>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 justify-center">
              <Button
                variant={searchType === 'courses' ? 'default' : 'outline'}
                onClick={() => setSearchType('courses')}
                className={`px-8 ${searchType === 'courses' ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-transparent text-white border-white hover:bg-white/10'}`}
              >
                COURSES
              </Button>
              <Button
                variant={searchType === 'universities' ? 'default' : 'outline'}
                onClick={() => setSearchType('universities')}
                className={`px-8 ${searchType === 'universities' ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-transparent text-white border-white hover:bg-white/10'}`}
              >
                UNIVERSITIES
              </Button>
            </div>

            {/* Search Form */}
            <div className="bg-slate-800 rounded-2xl p-6 border-2 border-rose-500">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="text-white text-sm mb-2 block">I'm looking for:</label>
                  <Input
                    placeholder="Enter subject or course:"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border-0 text-white placeholder:text-slate-500 h-12"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-white text-sm mb-2 block">I'm planning to study:</label>
                  <Select value={courseType} onValueChange={setCourseType}>
                    <SelectTrigger className="bg-slate-900 border-0 text-white h-12">
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="bachelor">Bachelor's</SelectItem>
                      <SelectItem value="master">Master's</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <label className="text-white text-sm mb-2 block">I want to study in:</label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-slate-900 border-0 text-white h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                      <SelectItem value="ireland">Ireland</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button 
                    onClick={handleSearch}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center">
                <a href="#" className="text-white text-sm hover:underline">
                  DOWNLOAD EDUCATION GUIDE
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AboutUs />
      <Services />
      <Team />
      <PartnerLogos />
      <FeaturedUniversities universities={universities} />
      <Destinations />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}