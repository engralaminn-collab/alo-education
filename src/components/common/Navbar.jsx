import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, Menu, User, LogOut, LayoutDashboard, FileText, MessageSquare, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const destinations = [
    { label: 'United Kingdom', page: 'StudyInUK' },
    { label: 'Australia', page: 'StudyInAustralia' },
    { label: 'Canada', page: 'StudyInCanada' },
    { label: 'Ireland', page: 'StudyInIreland' },
    { label: 'New Zealand', page: 'StudyInNewZealand' },
    { label: 'United States', page: 'StudyInUSA' },
    { label: 'Dubai (UAE)', page: 'StudyInDubai' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0066CC' }}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">ALO Education</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Destinations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="font-medium text-slate-900 hover:text-[#F37021] transition-colors flex items-center gap-1">
                  Destinations
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {destinations.map((dest) => (
                  <DropdownMenuItem key={dest.page} asChild>
                    <Link to={createPageUrl(dest.page)} className="cursor-pointer">
                      {dest.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to={createPageUrl('CourseFinder')} className="font-medium text-slate-900 hover:text-[#F37021] transition-colors">
              Course Finder
            </Link>
            <Link to={createPageUrl('Services')} className="font-medium text-slate-900 hover:text-[#F37021] transition-colors">
              Services
            </Link>
            <Link to={createPageUrl('LanguagePrep')} className="font-medium text-slate-900 hover:text-[#F37021] transition-colors">
              Language Prep
            </Link>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="font-medium text-slate-900 hover:text-[#F37021] transition-colors flex items-center gap-1">
                  Resources
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Scholarships')}>Scholarships</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('AlumniNetwork')}>Alumni Network</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('TestimonialsPage')}>Success Stories</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Portals Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="font-medium text-slate-900 hover:text-[#F37021] transition-colors flex items-center gap-1">
                  Portals
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('StudentDashboard')}>Student Portal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('PartnerPortal')}>Partner Portal</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-slate-900 hover:text-[#F37021]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                      {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                    </div>
                    <span>{user.full_name || 'Account'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('StudentDashboard')} className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('MyApplications')} className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      My Applications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Messages')} className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('CRMDashboard')} className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          CRM Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                className="text-slate-900 hover:text-[#F37021]"
                onClick={() => base44.auth.redirectToLogin()}
              >
                Sign In
              </Button>
            )}
            <Link to={createPageUrl('Contact')}>
              <Button style={{ backgroundColor: '#F37021', color: '#000000' }} className="font-bold hover:opacity-90">
                Book a Free Consultation
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-slate-900">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                <Link to={createPageUrl('CourseFinder')} onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-slate-900">
                  Course Finder
                </Link>
                <Link to={createPageUrl('Services')} onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-slate-900">
                  Services
                </Link>
                <Link to={createPageUrl('LanguagePrep')} onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-slate-900">
                  Language Prep
                </Link>
                <div>
                  <p className="text-sm font-semibold mb-2 text-slate-600">Portals</p>
                  <div className="flex flex-col gap-3 ml-2">
                    <Link to={createPageUrl('StudentDashboard')} onClick={() => setIsMobileOpen(false)} className="text-base font-medium text-slate-900">
                      Student Portal
                    </Link>
                    <Link to={createPageUrl('PartnerPortal')} onClick={() => setIsMobileOpen(false)} className="text-base font-medium text-slate-900">
                      Partner Portal
                    </Link>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold mb-2 text-slate-600">Destinations</p>
                  <div className="flex flex-col gap-3 ml-2">
                    {destinations.map((dest) => (
                      <Link key={dest.page} to={createPageUrl(dest.page)} onClick={() => setIsMobileOpen(false)} className="text-base font-medium text-slate-900">
                        {dest.label}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <hr className="border-slate-200" />
                {user ? (
                  <>
                    <Link to={createPageUrl('StudentDashboard')} onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-slate-900">
                      Dashboard
                    </Link>
                    <Button variant="outline" onClick={() => { base44.auth.logout(); setIsMobileOpen(false); }} className="text-red-600 border-red-200">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button style={{ backgroundColor: '#F37021', color: '#000000' }} onClick={() => { base44.auth.redirectToLogin(); setIsMobileOpen(false); }}>
                    Book a Free Consultation
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}