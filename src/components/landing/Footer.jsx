import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  const capColors = [
    'text-orange-500', 'text-amber-400', 'text-slate-500', 'text-blue-500', 'text-cyan-400',
    'text-slate-600', 'text-orange-400', 'text-amber-500', 'text-slate-400', 'text-orange-600',
    'text-cyan-500', 'text-slate-700', 'text-blue-600', 'text-amber-600', 'text-slate-500'
  ];

  return (
    <footer className="bg-white text-slate-700 border-t">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-education-blue to-alo-orange flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-2xl">ALO Education</h3>
                  <p className="text-alo-orange text-xs font-semibold italic">Your Future Starts Here</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                From your ambition to admission, ALO Education is with you all the way. Your trusted partner in international education since 2006.
              </p>
            </div>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/aloeducationbangladesh/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/aloeducation.bd/" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/aloeducation/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="http://www.youtube.com/@ALOeducationbd" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Destinations */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-6">Destinations:</h4>
            <ul className="space-y-3">
              {[
                { label: 'United Kingdom', page: 'StudyInUK' },
                { label: 'United States', page: 'StudyInUSA' },
                { label: 'Australia', page: 'StudyInAustralia' },
                { label: 'Canada', page: 'StudyInCanada' },
                { label: 'New Zealand', page: 'StudyInNewZealand' },
                { label: 'Europe', page: 'Universities' }
              ].map((link) => (
                <li key={link.page}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-6">Quick Links:</h4>
            <ul className="space-y-3">
              {[
                { label: 'Course Finder', page: 'CourseMatcher' },
                { label: 'Services', page: 'Services' },
                { label: 'English Test Prep', page: 'LanguagePrep' },
                { label: 'Blogs', page: 'Home' }
              ].map((link) => (
                <li key={link.page}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-6">Company:</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', page: 'About' },
                { label: 'Team', page: 'About' },
                { label: 'Find Us', page: 'Contact' },
                { label: 'Contact Us', page: 'Contact' }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Graduation Caps Row */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-center gap-8 flex-wrap mb-8">
            {capColors.map((color, i) => (
              <GraduationCap key={i} className={`w-8 h-8 ${color}`} />
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-slate-600">
              © Copyright 2026 <span className="font-bold text-education-blue">ALO Education</span>. Empowering Students Worldwide Since 2006. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-education-blue hover:text-alo-orange transition-colors font-medium">
                Privacy Policy
              </a>
              <span className="text-slate-400">•</span>
              <a href="#" className="text-education-blue hover:text-alo-orange transition-colors font-medium">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}