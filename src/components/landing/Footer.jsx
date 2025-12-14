import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693e153b7a74643e7f576f5e/9b7d5f81d_logo.jpg" 
                alt="ALO Education"
                className="h-16"
              />
            </div>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              Empowering students worldwide to achieve their international education dreams through personalized guidance and support.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="http://www.youtube.com/@ALOeducationbd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
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
                    className="hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Destinations */}
          <div>
            <h4 className="text-white font-semibold mb-6">Destinations</h4>
            <ul className="space-y-3">
              {['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'Ireland'].map((country) => (
                <li key={country}>
                  <Link 
                    to={createPageUrl('Universities') + `?country=${country.toLowerCase()}`}
                    className="hover:text-orange-400 transition-colors"
                  >
                    Study in {country}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <div className="font-medium text-white mb-1">Bangladesh Office:</div>
                  <div>Barek Mansion-02 (5th Floor)</div>
                  <div>58/9 Box Culvert Road, Panthapath</div>
                  <div>Dhaka-1205, Bangladesh</div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-400" />
                <span>+88 01805020101-10</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-400" />
                <span>info@aloeducation.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-400" />
                <span>Sat-Thu: 10 AM - 6 PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ALO Education. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}