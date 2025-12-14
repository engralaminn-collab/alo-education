import React from 'react';
import Navbar from '@/components/common/Navbar';
import WhatsAppChat from '@/components/common/WhatsAppChat';

export default function Layout({ children, currentPageName }) {
  // Pages that should have transparent navbar on top
  const transparentNavPages = ['Home'];
  const hasTransparentNav = transparentNavPages.includes(currentPageName);
  
  // CRM pages that don't need public navbar
  const crmPages = ['CRMDashboard', 'CRMStudents', 'CRMApplications', 'CRMUniversities', 'CRMCourses', 'CRMInquiries', 'CRMCounselors', 'CRMReports', 'CRMSettings', 'CRMTasks', 'CRMTestimonials', 'CRMAutomation', 'CRMMessages'];
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
      <WhatsAppChat />
    </div>
  );
}