import React from 'react';
import Navbar from '@/components/common/Navbar';
import AIChatbot from '@/components/chat/AIChatbot';

export default function Layout({ children, currentPageName }) {
  // Pages that should have transparent navbar on top
  const transparentNavPages = ['Home'];
  const hasTransparentNav = transparentNavPages.includes(currentPageName);
  
  // CRM pages that don't need public navbar
  const crmPages = ['CRMDashboard', 'CRMStudents', 'CRMApplications', 'CRMUniversities', 'CRMCourses', 'CRMInquiries', 'CRMCounselors', 'CRMReports', 'CRMSettings'];
  const isCRMPage = crmPages.includes(currentPageName);

  if (isCRMPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className={hasTransparentNav ? '' : 'pt-20'}>
        {children}
      </main>
      <AIChatbot />
    </div>
  );
}