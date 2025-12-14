import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-700">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--alo-blue)' }}>
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--alo-blue)' }}>ALO Education</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6 max-w-sm">
              Empowering students worldwide to achieve their international education dreams through personalized guidance and support.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="http://www.youtube.com/@ALOeducationbd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: 'var(--alo-blue)' }}>Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', page: 'Home' },
                { label: 'Universities', page: 'Universities' },
                { label: 'Courses', page: 'Courses' },
                { label: 'About Us', page: 'About' },
                { label: 'Contact', page: 'Contact' },
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
              {['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'Ireland'].map((country) => (
                <li key={country}>
                  <Link 
                    to={createPageUrl('Universities') + `?country=${country.toLowerCase()}`}
                    className="transition-colors"
                    style={{ color: 'var(--alo-blue)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}
                  >
                    Study in {country}
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
                <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#F37021' }} />
                <div>
                  <div className="font-medium mb-1" style={{ color: '#0066CC' }}>Bangladesh Office:</div>
                  <div>Barek Mansion-02 (5th Floor)</div>
                  <div>58/9 Box Culvert Road, Panthapath</div>
                  <div>Dhaka-1205, Bangladesh</div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" style={{ color: '#F37021' }} />
                <span>+88 01805020101-10</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: '#F37021' }} />
                <span>info@aloeducation.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5" style={{ color: '#F37021' }} />
                <span>Sat-Thu: 10 AM - 6 PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700" style={{ backgroundColor: '#0066CC', padding: '20px 0' }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white">
            © {new Date().getFullYear()} ALO Education. All Rights Reserved
          </p>
          <div className="flex gap-6 text-sm text-white">
            <a href="#" className="transition-colors hover:text-orange-300">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-orange-300">Terms of Service</a>
            <a href="#" className="transition-colors hover:text-orange-300">Cookie Policy</a>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}