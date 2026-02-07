import React from 'react';
import Navbar from '@/components/common/Navbar';
import LiveChatWidget from '@/components/common/LiveChatWidget';
import { Home, Sparkles, Users, Settings, ArrowLeft } from 'lucide-react';
import { createPageUrl } from './utils';
import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  
  // Pages that should have transparent navbar on top
  const transparentNavPages = ['Home'];
  const hasTransparentNav = transparentNavPages.includes(currentPageName);
  
  // CRM pages that don't need public navbar
  const crmPages = ['CRMDashboard', 'CRMStudents', 'CRMApplications', 'CRMUniversities', 'CRMCourses', 'CRMInquiries', 'CRMCounselors', 'CRMReports', 'CRMSettings', 'CRMTasks', 'CRMTestimonials', 'CRMAutomation', 'CRMMessages', 'CRMUniversityOutreach', 'CRMCommunications', 'CRMStudentSuccess', 'CRMBulkCampaigns'];
  const isCRMPage = crmPages.includes(currentPageName);

  // Bottom nav pages for mobile
  const bottomNavPages = ['CRMDashboard', 'CRMInquiries', 'CRMStudents', 'CRMSettings'];
  const showBottomNav = bottomNavPages.includes(currentPageName);
  
  // Sub-pages that should show back button
  const isSubPage = isCRMPage && !['CRMDashboard', 'CRMInquiries', 'CRMStudents', 'CRMSettings'].includes(currentPageName);

  if (isCRMPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700" 
             style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between p-4">
            {isSubPage ? (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-900 dark:text-white select-none"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back</span>
              </button>
            ) : (
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">ALO Education</h1>
            )}
          </div>
        </div>
        
        <main className={`md:p-0 ${showBottomNav ? 'pb-20 md:pb-0' : ''} ${!isSubPage ? 'pt-16 md:pt-0' : 'pt-16 md:pt-0'}`}>
          {children}
        </main>

        {/* Bottom Tab Bar - Mobile Only */}
        {showBottomNav && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-50"
               style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="flex items-center justify-around">
              <Link 
                to={createPageUrl('CRMDashboard')}
                className={`flex flex-col items-center gap-1 py-3 px-6 select-none ${
                  currentPageName === 'CRMDashboard' 
                    ? 'text-education-blue' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Dashboard</span>
              </Link>
              
              <Link 
                to={createPageUrl('CRMInquiries')}
                className={`flex flex-col items-center gap-1 py-3 px-6 select-none ${
                  currentPageName === 'CRMInquiries' 
                    ? 'text-education-blue' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Sparkles className="w-6 h-6" />
                <span className="text-xs font-medium">Leads</span>
              </Link>
              
              <Link 
                to={createPageUrl('CRMStudents')}
                className={`flex flex-col items-center gap-1 py-3 px-6 select-none ${
                  currentPageName === 'CRMStudents' 
                    ? 'text-education-blue' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-xs font-medium">Students</span>
              </Link>
              
              <Link 
                to={createPageUrl('CRMSettings')}
                className={`flex flex-col items-center gap-1 py-3 px-6 select-none ${
                  currentPageName === 'CRMSettings' 
                    ? 'text-education-blue' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Settings className="w-6 h-6" />
                <span className="text-xs font-medium">Settings</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className={hasTransparentNav ? '' : 'pt-20'}>
        {children}
      </main>
      <LiveChatWidget />
    </div>
  );
}