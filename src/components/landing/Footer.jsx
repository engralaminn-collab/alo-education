import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, MessageCircle, Check } from 'lucide-react';

export default function Footer() {
  const capIconsRef = useRef(null);

  useEffect(() => {
    // Animate cap icons on scroll
    const handleScroll = () => {
      if (capIconsRef.current) {
        const icons = capIconsRef.current.querySelectorAll('.cap-icon');
        icons.forEach((icon, index) => {
          const offset = window.scrollY * 0.1 * (index % 2 === 0 ? 1 : -1);
          icon.style.transform = `translateY(${offset}px)`;
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="bg-slate-50 text-slate-700">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://aloeducation.com/wp-content/uploads/2023/12/ALO-Logo_Final-1.png" 
                alt="ALO Education Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              From your ambition to admission, we're with you all the way.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--alo-blue)' }} className="hover:opacity-70 transition-opacity">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--alo-blue)' }} className="hover:opacity-70 transition-opacity">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--alo-blue)' }} className="hover:opacity-70 transition-opacity">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="http://www.youtube.com/@ALOeducationbd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--alo-blue)' }} className="hover:opacity-70 transition-opacity">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Destinations */}
          <div>
            <h4 className="font-bold mb-6 text-lg" style={{ color: 'var(--alo-black)' }}>Destinations:</h4>
            <ul className="space-y-2">
              {[
                { label: 'United Kingdom', page: 'StudyInUK' },
                { label: 'United States', page: 'StudyInUSA' },
                { label: 'Australia', page: 'StudyInAustralia' },
                { label: 'Canada', page: 'StudyInCanada' },
                { label: 'New Zealand', page: 'StudyInNewZealand' },
                { label: 'Europe', page: 'StudyInIreland' }
              ].map((dest) => (
                <li key={dest.page}>
                  <Link 
                    to={createPageUrl(dest.page)}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--alo-blue)' }}
                  >
                    {dest.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-lg" style={{ color: 'var(--alo-black)' }}>Quick Links:</h4>
            <ul className="space-y-2">
              {[
                { label: 'Course Finder', page: 'Courses' },
                { label: 'Services', page: 'About' },
                { label: 'English Test Prep', page: 'Contact' },
                { label: 'Blogs', page: 'About' }
              ].map((link) => (
                <li key={link.page}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--alo-blue)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-6 text-lg" style={{ color: 'var(--alo-black)' }}>Company:</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', page: 'About' },
                { label: 'Team', page: 'About' },
                { label: 'Find Us', page: 'Contact' },
                { label: 'Contact Us', page: 'Contact' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--alo-blue)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Decorative Cap Icons */}
        <div 
          ref={capIconsRef}
          className="mt-12 py-10 border-t border-slate-200 overflow-hidden"
        >
          <div className="flex justify-around items-center flex-wrap gap-4 max-w-5xl mx-auto">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="cap-icon transition-transform duration-300"
                style={{ 
                  color: i % 4 === 0 ? 'var(--alo-blue)' : 
                         i % 4 === 1 ? 'var(--alo-orange)' : 
                         i % 4 === 2 ? 'var(--alo-sunshine)' : 
                         '#888888',
                  animation: `float 3s ease-in-out infinite ${i * 0.3}s`,
                  transform: `rotate(${(i % 3) * 15 - 15}deg)`
                }}
              >
                <GraduationCap className="w-10 h-10 opacity-40" />
              </div>
            ))}
          </div>
        </div>

        <div className="py-5" style={{ backgroundColor: '#555555' }}>
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white">
              © Copyright {new Date().getFullYear()} ALO Education. All Rights Reserved
            </p>
            <a href="#" className="text-sm text-white hover:underline">
              • Cookie policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}