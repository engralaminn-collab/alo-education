import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { pagesConfig } from "@/pages.config";
import NavigationTracker from "@/lib/NavigationTracker";
import PageNotFound from "@/lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const createPagePath = (pageName) => `/${pageName.replace(/ /g, "-")}`;
const adminPages = (pageName) => pageName.startsWith("CRM");
const authPages = new Set([
  "StudentDashboard",
  "StudentPortal",
  "StudentAnalytics",
  "MyApplications",
  "MyDocuments",
  "MyFavorites",
  "MyProfile",
  "MyReferrals",
  "Messages",
  "PartnerPortal",
]);

function AppRoutes() {
  const { Pages, mainPage, Layout } = pagesConfig;
  const pageEntries = useMemo(() => Object.entries(Pages), [Pages]);
  const mainPageKey = mainPage ?? pageEntries[0]?.[0];

  const renderPage = (PageComponent, pageName) => (
    <Layout currentPageName={pageName}>
      {adminPages(pageName) ? (
        <ProtectedRoute requiredRoles={["admin"]}>
          <PageComponent />
        </ProtectedRoute>
      ) : authPages.has(pageName) ? (
        <ProtectedRoute>
          <PageComponent />
        </ProtectedRoute>
      ) : (
        <PageComponent />
      )}
    </Layout>
  );

  return (
    <Routes>
      {mainPageKey ? (
        <Route
          path="/"
          element={renderPage(Pages[mainPageKey], mainPageKey)}
        />
      ) : null}
      {pageEntries.map(([pageName, PageComponent]) => (
        <Route
          key={pageName}
          path={createPagePath(pageName)}
          element={renderPage(PageComponent, pageName)}
          caseSensitive={false}
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <NavigationTracker />
            <AppRoutes />
            <Toaster richColors />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
