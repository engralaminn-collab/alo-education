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
                <span className="text-sm italic" style={{ color: 'var(--alo-orange)' }}>Your Dream – Our Commitment</span>
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

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: 'var(--alo-blue)' }}>Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', page: 'About' },
                { label: 'Contact Us', page: 'Contact' },
                { label: 'Global Offices', page: 'About' },
                { label: 'Code of Conduct', page: 'About' },
                { label: 'Student Complaint Policy', page: 'About' },
                { label: 'AQF Compliance', page: 'About' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="transition-colors text-sm"
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
                    <div className="text-sm">Barek Mansion-02 (5th Floor)</div>
                    <div className="text-sm">58/9 Box Culvert Road, Panthapath</div>
                    <div className="text-sm">Dhaka-1205, Bangladesh</div>
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                <a href="https://wa.me/8801805020101" target="_blank" rel="noopener noreferrer" className="hover:underline text-sm">
                  +8801805020101 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                <span className="text-sm">+8801805020101-10</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                <a href="mailto:info@aloeducation.com" className="hover:underline text-sm">
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
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className="cap-icon transition-transform duration-300"
                style={{ 
                  color: i % 3 === 0 ? 'var(--alo-blue)' : i % 3 === 1 ? 'var(--alo-orange)' : 'var(--alo-sunshine)',
                  animation: `float 3s ease-in-out infinite ${i * 0.4}s`
                }}
              >
                <GraduationCap className="w-8 h-8 opacity-30" />
              </div>
            ))}
          </div>
        </div>

        <div className="py-6" style={{ backgroundColor: 'var(--alo-blue)' }}>
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-sm text-white text-center">
              © {new Date().getFullYear()} ALO Education. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}