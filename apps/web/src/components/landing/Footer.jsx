import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  const capColors = [
    'text-orange-500', 'text-amber-400', 'text-slate-500', 'text-blue-500', 'text-cyan-400',
    'text-slate-600', 'text-orange-400', 'text-amber-500', 'text-slate-400', 'text-orange-600',
    'text-cyan-500', 'text-slate-700', 'text-blue-600', 'text-amber-600', 'text-slate-500'
  ];

  return (
    <footer className="bg-white text-slate-700">
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
              <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: '#0066CC', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: '#0066CC', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: '#0066CC', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="http://www.youtube.com/@ALOeducationbd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: '#0066CC', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Destinations */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: 'var(--alo-blue)' }}>Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'UK', page: 'StudyInUK' },
                { label: 'Australia', page: 'StudyInAustralia' },
                { label: 'Canada', page: 'StudyInCanada' },
                { label: 'Ireland', page: 'StudyInIreland' },
                { label: 'New Zealand', page: 'StudyInNewZealand' },
                { label: 'USA', page: 'StudyInUSA' },
                { label: 'Dubai', page: 'StudyInDubai' }
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
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6" style={{ color: 'var(--alo-blue)' }}>Destinations</h4>
            <ul className="space-y-3">
              {[
                { label: 'Course Finder', page: 'CourseFinder' },
                { label: 'Services', page: 'Services' },
                { label: 'Language Prep', page: 'LanguagePrep' },
                { label: 'Scholarships', page: 'ScholarshipFinder' }
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
        
        <div className="mt-12" style={{ backgroundColor: '#0066CC', color: 'white', padding: '14px 0' }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} ALO Education. All Rights Reserved
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="transition-colors hover:text-white" style={{ color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.color = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white" style={{ color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.color = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Terms of Service</a>
            <a href="#" className="transition-colors hover:text-white" style={{ color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.color = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>Cookie Policy</a>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}