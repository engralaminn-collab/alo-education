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
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { GraduationCap, Menu, User, LogOut, LayoutDashboard, FileText, MessageSquare, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBg = 'bg-white shadow-sm';

  const destinations = [
  { label: 'United Kingdom', page: 'StudyInUK' },
  { label: 'Australia', page: 'StudyInAustralia' },
  { label: 'Canada', page: 'StudyInCanada' },
  { label: 'Ireland', page: 'StudyInIreland' },
  { label: 'New Zealand', page: 'StudyInNewZealand' },
  { label: 'United States', page: 'StudyInUSA' },
  { label: 'Dubai (UAE)', page: 'StudyInDubai' }];


  const navLinks = [
  { label: 'Course Finder', page: 'Courses' },
  { label: 'Services', page: 'About' },
  { label: 'Language Prep', page: 'LanguagePrep' },
  { label: 'Portal', page: 'StudentDashboard' }];
  
  const resources = [
  { label: 'Universities', page: 'Universities' },
  { label: 'Scholarships', page: 'Scholarships' },
  { label: 'Scholarship Helper', page: 'ScholarshipHelper' },
  { label: 'Alumni Network', page: 'AlumniNetwork' },
  { label: 'AI Counselor', page: 'AICounselor' },
  { label: 'Testimonials', page: 'TestimonialsPage' }];


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="text-4xl rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'white' }}>
              <GraduationCap className="w-6 h-6" style={{ color: 'var(--alo-blue)' }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold" style={{ color: 'var(--alo-blue)' }}>ALO Education</span>
              <span className="text-xs italic" style={{ color: 'var(--alo-orange)' }}>Your Dream - Our Commitment</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Destinations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="font-medium transition-colors flex items-center gap-1"
                  style={{ color: '#000000' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}>
                  Destinations
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {destinations.map((dest) =>
                <DropdownMenuItem key={dest.page} asChild>
                    <Link to={createPageUrl(dest.page)} className="cursor-pointer">
                      {dest.label}
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {navLinks.map((link) =>
            <Link
              key={link.page}
              to={createPageUrl(link.page)}
              className="font-medium transition-colors"
              style={{ color: '#000000' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}>
                {link.label}
              </Link>
            )}
            
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="font-medium transition-colors flex items-center gap-1"
                  style={{ color: '#000000' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}>
                  Resources
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {resources.map((res) =>
                <DropdownMenuItem key={res.page} asChild>
                    <Link to={createPageUrl(res.page)} className="cursor-pointer">
                      {res.label}
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ?
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hover:bg-slate-100" style={{ color: '#000000' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: 'var(--alo-orange)', color: 'white' }}>
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
                    <Link to={createPageUrl('MyFavorites')} className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      My Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('StudentAnalytics')} className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      My Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Messages')} className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' &&
                <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('CRMDashboard')} className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          CRM Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                }
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> :

            <>
              <Link to={createPageUrl('Contact')}>
                <Button
                  className="font-semibold hover:opacity-90"
                  style={{ backgroundColor: 'var(--alo-orange)', color: '#000000' }}
                >
                  Book Free Consultation
                </Button>
              </Link>
            </>
            }
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" style={{ color: '#000000' }}>
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Destinations */}
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>Destinations</p>
                  <div className="flex flex-col gap-3 ml-2">
                    {destinations.map((dest) =>
                    <Link
                      key={dest.page}
                      to={createPageUrl(dest.page)}
                      onClick={() => setIsMobileOpen(false)}
                      className="text-base font-medium transition-colors"
                      style={{ color: 'var(--alo-blue)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>
                        {dest.label}
                      </Link>
                    )}
                  </div>
                </div>
                
                {navLinks.map((link) =>
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-lg font-medium transition-colors"
                  style={{ color: 'var(--alo-blue)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>
                    {link.label}
                  </Link>
                )}
                
                {/* Mobile Resources */}
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>Resources</p>
                  <div className="flex flex-col gap-3 ml-2">
                    {resources.map((res) =>
                    <Link
                      key={res.page}
                      to={createPageUrl(res.page)}
                      onClick={() => setIsMobileOpen(false)}
                      className="text-base font-medium transition-colors"
                      style={{ color: 'var(--alo-blue)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--alo-orange)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--alo-blue)'}>
                        {res.label}
                      </Link>
                    )}
                  </div>
                </div>
                
                <hr className="border-slate-200" />
                {user ?
                <>
                    <Link
                    to={createPageUrl('StudentDashboard')}
                    onClick={() => setIsMobileOpen(false)}
                    className="text-lg font-medium"
                    style={{ color: 'var(--alo-blue)' }}>

                      Dashboard
                    </Link>
                    <Button
                    variant="outline"
                    onClick={() => {base44.auth.logout();setIsMobileOpen(false);}}
                    className="text-red-600 border-red-200">

                      Sign Out
                    </Button>
                  </> :

                <Link to={createPageUrl('Contact')}>
                  <Button
                    className="w-full font-semibold"
                    style={{ backgroundColor: 'var(--alo-orange)', color: '#000000' }}
                    onClick={() => setIsMobileOpen(false)}>
                      Book Free Consultation
                    </Button>
                </Link>
                }
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>);

}