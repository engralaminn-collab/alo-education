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

  const resourcesLinks = [
    { label: 'All Resources', page: 'Resources' },
    { label: 'IELTS Prep', page: 'IELTSPrep' },
    { label: 'PTE Prep', page: 'PTEPrep' },
    { label: 'Alumni Network', page: 'AlumniNetwork' },
    { label: 'Testimonials', page: 'TestimonialsPage' },
  ];

  const services = [
    { label: 'All Services', page: 'Services' },
    { label: 'Free Counselling', page: 'ServiceFreeCounselling' },
    { label: 'University Selection', page: 'ServiceUniversitySelection' },
    { label: 'Application Assistance', page: 'ServiceApplicationAssistance' },
    { label: 'SOP Review', page: 'ServiceSOPReview' },
    { label: 'Visa Guidance', page: 'ServiceVisaGuidance' },
    { label: 'Scholarship Support', page: 'ServiceScholarshipSupport' },
    { label: 'Accommodation', page: 'ServiceAccommodation' },
    { label: 'Pre-Departure', page: 'ServicePreDeparture' },
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
          <div className="hidden lg:flex items-center gap-6">
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

            <Link
              to={createPageUrl('CourseMatcher')}
              className={`font-medium hover:text-alo-orange transition-colors ${textColor}`}
            >
              Course Finder
            </Link>

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`font-medium hover:text-alo-orange transition-colors flex items-center gap-1 ${textColor}`}>
                  Services
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {services.map((service) => (
                  <DropdownMenuItem key={service.page} asChild>
                    <Link to={createPageUrl(service.page)} className="cursor-pointer">
                      {service.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to={createPageUrl('LanguagePrep')}
              className={`font-medium hover:text-alo-orange transition-colors ${textColor}`}
            >
              Language Prep
            </Link>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`font-medium hover:text-alo-orange transition-colors flex items-center gap-1 ${textColor}`}>
                  Resources
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {resourcesLinks.map((resource) => (
                  <DropdownMenuItem key={resource.page} asChild>
                    <Link to={createPageUrl(resource.page)} className="cursor-pointer">
                      {resource.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`gap-2 ${textColor}`}>
                    <User className="w-5 h-5" />
                    <span>Portal</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('StudentPortal')} className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Student Portal
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
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('MyComparisons')} className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      My Comparisons
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
              <>
                <Button 
                  variant="ghost" 
                  className={textColor}
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  <User className="w-5 h-5 mr-2" />
                  Portal
                </Button>
              </>
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
                {/* Mobile Destinations */}
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">Destinations</p>
                  <div className="flex flex-col gap-3 ml-2">
                    {destinations.map((dest) => (
                      <Link
                        key={dest.page}
                        to={createPageUrl(dest.page)}
                        onClick={() => setIsMobileOpen(false)}
                        className="text-base font-medium text-slate-700 hover:text-emerald-500 transition-colors"
                      >
                        {dest.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to={createPageUrl('CourseMatcher')}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-lg font-medium text-slate-800 hover:text-emerald-500 transition-colors"
                >
                  Course Finder
                </Link>

                {/* Mobile Services */}
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">Services</p>
                  <div className="flex flex-col gap-3 ml-2">
                    {services.map((service) => (
                      <Link
                        key={service.page}
                        to={createPageUrl(service.page)}
                        onClick={() => setIsMobileOpen(false)}
                        className="text-base font-medium text-slate-700 hover:text-emerald-500 transition-colors"
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to={createPageUrl('LanguagePrep')}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-lg font-medium text-slate-800 hover:text-emerald-500 transition-colors"
                >
                  Language Prep
                </Link>

                {/* Mobile Resources */}
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">Resources</p>
                  <div className="flex flex-col gap-3 ml-2">
                    {resourcesLinks.map((resource) => (
                      <Link
                        key={resource.page}
                        to={createPageUrl(resource.page)}
                        onClick={() => setIsMobileOpen(false)}
                        className="text-base font-medium text-slate-700 hover:text-emerald-500 transition-colors"
                      >
                        {resource.label}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <hr className="border-slate-200" />
                {user ? (
                  <>
                    <Link
                      to={createPageUrl('StudentDashboard')}
                      onClick={() => setIsMobileOpen(false)}
                      className="text-lg font-medium text-slate-800"
                    >
                      Portal / Dashboard
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
                    className="bg-gradient-brand text-white hover:opacity-90"
                    onClick={() => { base44.auth.redirectToLogin(); setIsMobileOpen(false); }}
                  >
                    Portal Login
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