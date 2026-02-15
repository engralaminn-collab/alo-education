import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Phone, UserCheck, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function CountryHero({ 
  country, 
  flagUrl, 
  title, 
  subtitle, 
  highlights = [], 
  gradientFrom, 
  gradientTo 
}) {
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 600);
    };

    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    window.addEventListener('scroll', handleScroll);
    checkAuth();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <section className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} py-24 relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl"
          >
            {/* Flag & Title */}
            <div className="flex items-center gap-4 mb-8">
              <img 
                src={flagUrl} 
                alt={`${country} Flag`} 
                className="w-20 h-14 rounded-xl shadow-2xl object-cover"
              />
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                  {title}
                </h1>
                <p className="text-white/80 text-lg mt-2">with ALO Education Bangladesh</p>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl">
              {subtitle}
            </p>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {highlights.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{item.label}</p>
                        <p className="text-white/70 text-sm">{item.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 shadow-xl text-lg px-8 py-6 h-auto">
                  <Phone className="w-5 h-5 mr-2" />
                  Book Free Counselling
                </Button>
              </Link>

              <Link to={createPageUrl('Courses') + `?country=${country}`}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 h-auto backdrop-blur-sm"
                >
                  Apply Online
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              {isAuthenticated ? (
                <Link to={createPageUrl('StudentDashboard')}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white/60 text-white hover:bg-white/10 text-lg px-6 py-6 h-auto backdrop-blur-sm"
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    Student Portal
                  </Button>
                </Link>
              ) : (
                <Link to={createPageUrl('StudentPortal')}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white/60 text-white hover:bg-white/10 text-lg px-6 py-6 h-auto backdrop-blur-sm"
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    Student Login
                  </Button>
                </Link>
              )}

              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white/60 text-white hover:bg-white/10 text-lg px-6 py-6 h-auto backdrop-blur-sm"
                >
                  <Handshake className="w-5 h-5 mr-2" />
                  Partner Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Consultation Button */}
      {showStickyButton && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link to={createPageUrl('Contact')}>
            <Button 
              size="lg" 
              className={`${gradientFrom} ${gradientTo} text-white shadow-2xl hover:shadow-xl transition-shadow px-6 py-6 text-lg rounded-full`}
            >
              <Phone className="w-5 h-5 mr-2" />
              Book Consultation
            </Button>
          </Link>
        </motion.div>
      )}
    </>
  );
}