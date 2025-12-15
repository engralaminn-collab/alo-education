import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Clock, Award, BookOpen, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

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
            <ul className="space-y-3 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <li><Link to={createPageUrl('StudyInUK')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>UK</Link></li>
              <li><Link to={createPageUrl('StudyInAustralia')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Australia</Link></li>
              <li><Link to={createPageUrl('StudyInCanada')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Canada</Link></li>
              <li><Link to={createPageUrl('StudyInIreland')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Ireland</Link></li>
              <li><Link to={createPageUrl('StudyInNewZealand')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>New Zealand</Link></li>
              <li><Link to={createPageUrl('StudyInUSA')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>USA</Link></li>
              <li><Link to={createPageUrl('StudyInDubai')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Dubai</Link></li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>Quick Links</h4>
            <ul className="space-y-3 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <li><Link to={createPageUrl('CourseMatcher')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Course Finder</Link></li>
              <li><Link to={createPageUrl('About')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Services</Link></li>
              <li><Link to={createPageUrl('EnglishTests')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Language Prep</Link></li>
              <li><Link to={createPageUrl('Scholarships')} className="transition-colors" style={{ color: 'var(--alo-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>Scholarships</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-6" style={{ color: 'var(--alo-blue)', fontFamily: 'Montserrat, sans-serif' }}>Contact</h4>
            <ul className="space-y-3 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--alo-orange)' }} />
                <a href="https://maps.app.goo.gl/aarau5V2GfBrICZT8" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Barek Mansion-02 (5th Floor), 58/9 Box Culvert Road, Panthapath, Dhaka-1205, Bangladesh
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: 'var(--alo-orange)' }} />
                <a href="https://wa.me/8801805020101" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  WhatsApp: +8801805020101
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: 'var(--alo-orange)' }} />
                <span>Mobile: +8801805020101-10</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: 'var(--alo-orange)' }} />
                <a href="mailto:info@aloeducation.com" className="hover:underline">
                  info@aloeducation.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative Cap Icons Strip with Animation */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex justify-center gap-8 mb-8">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: 'var(--alo-blue)' }}
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.2 }}
              className="w-16 h-16 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: 'var(--alo-orange)' }}
            >
              <Globe className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.4 }}
              className="w-16 h-16 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: '#10b981' }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.6 }}
              className="w-16 h-16 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: '#8b5cf6' }}
            >
              <Award className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* Social Media - Facebook → Instagram → LinkedIn → YouTube */}
          <div className="flex justify-center gap-4 mb-8">
            <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
              <Linkedin className="w-5 h-5" />
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