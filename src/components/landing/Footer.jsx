import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Clock, Award, BookOpen, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-700">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About / Brand */}
          <div className="lg:col-span-1">
            <h4 className="font-bold mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>About</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--alo-blue)' }}>
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold block" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>ALO Education</span>
                <span className="text-xs italic" style={{ color: 'var(--alo-orange)' }}>Your Dream, Our Commitment</span>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              Empowering students worldwide to achieve their international education dreams.
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
          
          {/* Destinations */}
          <div>
            <h4 className="font-bold mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>Destinations</h4>
            <ul className="space-y-3 text-sm">
              {['UK', 'Australia', 'Canada', 'Ireland', 'New Zealand', 'USA', 'Dubai'].map((country) => (
                <li key={country}>
                  <Link 
                    to={createPageUrl('Universities') + `?country=${country.toLowerCase()}`}
                    className="transition-colors"
                    style={{ color: 'var(--alo-blue)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}
                  >
                    {country}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Course Finder', page: 'CourseMatcher' },
                { label: 'Services', page: 'About' },
                { label: 'Language Prep', page: 'EnglishTests' },
                { label: 'Scholarships', page: 'Scholarships' },
                { label: 'Events', page: 'Contact' },
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
            <h4 className="font-bold mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                'Global Offices',
                'Code of Conduct',
                'Whistleblower',
                'Modern Slavery Statement',
                'Student Complaint Policy',
                'AQF Compliance'
              ].map((item) => (
                <li key={item}>
                  <a 
                    href="#"
                    className="transition-colors"
                    style={{ color: 'var(--alo-blue)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Decorative Cap Icons Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex justify-center gap-8 mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--alo-blue)' }}>
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--alo-orange)' }}>
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8b5cf6' }}>
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Social Media */}
          <div className="flex justify-center gap-4 mb-8">
            <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
              <Instagram className="w-5 h-5" />
            </a>
            <a href="http://www.youtube.com/@ALOeducationbd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6" style={{ backgroundColor: 'var(--alo-blue)' }}>
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            © {new Date().getFullYear()} ALO Education. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}