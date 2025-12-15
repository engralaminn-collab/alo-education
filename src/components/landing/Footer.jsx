import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

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
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--alo-blue)' }}>
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold block" style={{ color: 'var(--alo-blue)' }}>ALO Education</span>
                <span className="text-sm italic" style={{ color: 'var(--alo-orange)' }}>Your Dream - Our Commitment</span>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6 max-w-sm mt-4">
              Empowering students worldwide to achieve their international education dreams through personalized guidance and support.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-orange)', color: 'white' }}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="http://www.youtube.com/@ALOeducationbd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: '#FF0000', color: 'white' }}>
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: 'var(--alo-blue)' }}>Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Course Finder', page: 'Courses' },
                { label: 'Services', page: 'About' },
                { label: 'Language Prep', page: 'Contact' },
                { label: 'Scholarships', page: 'Scholarships' },
              ].map((link) => (
                <li key={link.page}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="transition-colors"
                    style={{ color: 'var(--alo-blue)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Destinations */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: 'var(--alo-blue)' }}>Destinations</h4>
            <ul className="space-y-3">
              {[
                { label: 'UK', page: 'StudyInUK' },
                { label: 'Australia', page: 'StudyInAustralia' },
                { label: 'Canada', page: 'StudyInCanada' },
                { label: 'Ireland', page: 'StudyInIreland' },
                { label: 'New Zealand', page: 'StudyInNewZealand' },
                { label: 'USA', page: 'StudyInUSA' },
                { label: 'Dubai', page: 'StudyInDubai' }
              ].map((dest) => (
                <li key={dest.page}>
                  <Link 
                    to={createPageUrl(dest.page)}
                    className="transition-colors"
                    style={{ color: 'var(--alo-blue)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}
                  >
                    {dest.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: 'var(--alo-blue)' }}>Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                <div>
                  <a 
                    href="https://maps.app.goo.gl/aarau5V2GfBrICZT6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    <div className="font-medium mb-1" style={{ color: 'var(--alo-blue)' }}>Bangladesh Office:</div>
                    <div>Barek Mansion-02 (5th Floor)</div>
                    <div>58/9 Box Culvert Road, Panthapath</div>
                    <div>Dhaka-1205, Bangladesh</div>
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                <a href="https://wa.me/8801805020101" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  +8801805020101 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                <span>+8801805020101-10</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                <a href="mailto:info@aloeducation.com" className="hover:underline">
                  info@aloeducation.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative Cap Icons */}
        <div 
          ref={capIconsRef}
          className="mt-12 py-8 border-t border-slate-200 overflow-hidden"
        >
          <div className="flex justify-center gap-12">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="cap-icon transition-transform duration-300"
                style={{ 
                  color: i % 2 === 0 ? 'var(--alo-blue)' : 'var(--alo-orange)',
                  animation: `float 3s ease-in-out infinite ${i * 0.5}s`
                }}
              >
                <GraduationCap className="w-8 h-8 opacity-30" />
              </div>
            ))}
          </div>
        </div>

        <div className="py-6" style={{ backgroundColor: 'var(--alo-blue)' }}>
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white">
              © {new Date().getFullYear()} ALO Education. All Rights Reserved
            </p>
            <div className="flex gap-6 text-sm text-white">
              <a href="#" className="transition-colors hover:opacity-80">Privacy Policy</a>
              <a href="#" className="transition-colors hover:opacity-80">Terms of Service</a>
              <a href="#" className="transition-colors hover:opacity-80">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}