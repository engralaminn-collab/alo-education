import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { GraduationCap, Menu, User, LogOut, LayoutDashboard, FileText, MessageSquare, ChevronDown, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/Home' || location.pathname === '/';
  const navBg = isScrolled || !isHome 
    ? 'bg-white/95 backdrop-blur-md shadow-sm' 
    : 'bg-transparent';
  const textColor = isScrolled || !isHome ? 'text-slate-800' : 'text-white';

  const destinations = [
    { label: 'United Kingdom', page: 'StudyInUK' },
    { label: 'Australia', page: 'StudyInAustralia' },
    { label: 'Canada', page: 'StudyInCanada' },
    { label: 'Ireland', page: 'StudyInIreland' },
    { label: 'New Zealand', page: 'StudyInNewZealand' },
    { label: 'United States', page: 'StudyInUSA' },
    { label: 'Dubai (UAE)', page: 'StudyInDubai' },
  ];

  const navLinks = [
    { label: 'Course Finder', page: 'CourseFinder' },
    { label: 'Services', page: 'Home', hash: '#services' },
    { label: 'Language Prep', page: 'LanguagePrep' },
  ];

  const resources = [
    { label: 'Blog & Articles', page: 'Resources' },
    { label: 'Scholarships', page: 'ScholarshipFinder' },
    { label: 'Test Prep - IELTS', page: 'IELTSPrep' },
    { label: 'Test Prep - PTE', page: 'PTEPrep' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-education-blue to-alo-orange flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-bold ${textColor} tracking-tight`}>ALO Education</span>
              <span className="text-alo-orange text-xs font-semibold -mt-1 italic">Your Future Starts Here</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Destinations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`font-medium hover:text-alo-orange transition-colors flex items-center gap-1 ${textColor}`}>
                  Destinations
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {destinations.map((dest) => (
                  <DropdownMenuItem key={dest.page} asChild>
                    <Link to={createPageUrl(dest.page)} className="cursor-pointer">
                      {dest.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={link.hash ? `${createPageUrl(link.page)}${link.hash}` : createPageUrl(link.page)}
                className={`font-medium hover:text-alo-orange transition-colors ${textColor}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`font-medium hover:text-alo-orange transition-colors flex items-center gap-1 ${textColor}`}>
                  Resources
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {resources.map((res) => (
                  <DropdownMenuItem key={res.page} asChild>
                    <Link to={createPageUrl(res.page)} className="cursor-pointer">
                      {res.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Portal Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`font-medium hover:text-alo-orange transition-colors flex items-center gap-1 ${textColor}`}>
                  Portal
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('StudentPortal')} className="cursor-pointer flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Student Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('MyApplications')} className="cursor-pointer flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    My Applications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Messages')} className="cursor-pointer flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('MyComparisons')} className="cursor-pointer flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    My Comparisons
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Button */}
          <div className="hidden lg:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`gap-2 ${textColor}`}>
                    <User className="w-5 h-5" />
                    <span>{user.full_name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('CRMDashboard')} className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          CRM Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                className={textColor}
                onClick={() => base44.auth.redirectToLogin()}
              >
                <User className="w-5 h-5 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className={textColor}>
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                {/* Destinations */}
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-3">Destinations</p>
                  <div className="flex flex-col gap-2 ml-2">
                    {destinations.map((dest) => (
                      <Link
                        key={dest.page}
                        to={createPageUrl(dest.page)}
                        onClick={() => setIsMobileOpen(false)}
                        className="text-base text-slate-700 hover:text-alo-orange transition-colors"
                      >
                        {dest.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={link.hash ? `${createPageUrl(link.page)}${link.hash}` : createPageUrl(link.page)}
                    onClick={() => setIsMobileOpen(false)}
                    className="text-lg font-medium text-slate-800 hover:text-alo-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Resources */}
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-3">Resources</p>
                  <div className="flex flex-col gap-2 ml-2">
                    {resources.map((res) => (
                      <Link
                        key={res.page}
                        to={createPageUrl(res.page)}
                        onClick={() => setIsMobileOpen(false)}
                        className="text-base text-slate-700 hover:text-alo-orange transition-colors"
                      >
                        {res.label}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <hr className="border-slate-200" />
                {user ? (
                  <>
                    <Link
                      to={createPageUrl('StudentPortal')}
                      onClick={() => setIsMobileOpen(false)}
                      className="text-lg font-medium text-slate-800"
                    >
                      Portal
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => { base44.auth.logout(); setIsMobileOpen(false); }}
                      className="text-red-600 border-red-200"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="bg-gradient-brand text-white hover:opacity-90 w-full"
                    onClick={() => { base44.auth.redirectToLogin(); setIsMobileOpen(false); }}
                  >
                    Login
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