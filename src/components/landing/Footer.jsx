import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-700">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693e153b7a74643e7f576f5e/b2e2eb03f_fgdh.jpg" 
              alt="ALO Education Logo" 
              className="h-20 mb-4"
            />
            <p className="text-slate-600 text-sm mb-4">
              From your ambition to admission, we're with you all the way.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded flex items-center justify-center transition-colors" style={{ backgroundColor: '#0066CC', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded flex items-center justify-center transition-colors" style={{ backgroundColor: '#0066CC', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded flex items-center justify-center transition-colors" style={{ backgroundColor: '#0066CC', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="http://www.youtube.com/@ALOeducationbd" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded flex items-center justify-center transition-colors" style={{ backgroundColor: '#0066CC', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F37021'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}>
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Destinations */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--alo-blue)' }}>Destinations:</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'United Kingdom', page: 'StudyInUK' },
                { label: 'United States', page: 'StudyInUSA' },
                { label: 'Australia', page: 'StudyInAustralia' },
                { label: 'Canada', page: 'StudyInCanada' },
                { label: 'New Zealand', page: 'StudyInNewZealand' },
                { label: 'Europe', page: 'Universities' }
              ].map((dest) => (
                <li key={dest.page}>
                  <Link 
                    to={createPageUrl(dest.page)} 
                    className="transition-colors hover:underline"
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
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--alo-blue)' }}>Quick Links:</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Course Finder', page: 'Courses' },
                { label: 'Services', page: 'About' },
                { label: 'English Test Prep', page: 'Contact' },
                { label: 'Blogs', page: 'Home' }
              ].map((link) => (
                <li key={link.page}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="transition-colors hover:underline"
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
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--alo-blue)' }}>Company:</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About Us', page: 'About' },
                { label: 'Team', page: 'About' },
                { label: 'Find Us', page: 'Contact' },
                { label: 'Contact Us', page: 'Contact' }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="transition-colors hover:underline"
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
        </div>
        
        {/* Decorative Graduation Caps */}
        <div className="mt-8 mb-8 overflow-hidden" style={{ height: '60px' }}>
          <div className="flex items-center gap-8 opacity-30">
            {[...Array(20)].map((_, i) => (
              <GraduationCap 
                key={i} 
                className="w-8 h-8 shrink-0" 
                style={{ 
                  color: i % 3 === 0 ? '#0066CC' : i % 3 === 1 ? '#F37021' : '#555555',
                  transform: `rotate(${(i % 4) * 15}deg)`
                }} 
              />
            ))}
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ color: 'var(--alo-grey)' }}>
          <p>
            © Copyright {new Date().getFullYear()} ALO Education. All Rights Reserved
          </p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:underline" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Cookie policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}