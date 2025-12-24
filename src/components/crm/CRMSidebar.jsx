import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, 
  FileText, MessageSquare, Settings, BarChart3, 
  Inbox, UserCog, LogOut, ChevronLeft, Zap, Sparkles, Mail, TrendingUp, GitBranch, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'CRMDashboard' },
  { icon: Inbox, label: 'Inquiries', page: 'CRMInquiries' },
  { icon: Zap, label: 'Lead Nurturing', page: 'CRMLeadNurturing' },
  { icon: Sparkles, label: 'AI Assistant', page: 'CRMAIAssistant' },
  { icon: Users, label: 'Students', page: 'CRMStudents' },
  { icon: FileText, label: 'Applications', page: 'CRMApplications' },
  { icon: Building2, label: 'Universities', page: 'CRMUniversities' },
  { icon: GraduationCap, label: 'Courses', page: 'CRMCourses' },
  { icon: RefreshCw, label: 'Data Updates', page: 'CRMDataUpdates' },
  { icon: UserCog, label: 'Counselors', page: 'CRMCounselors' },
  { icon: MessageSquare, label: 'Messages', page: 'CRMMessages' },
  { icon: Mail, label: 'Bulk Email', page: 'CRMBulkEmail' },
  { icon: Zap, label: 'Task Templates', page: 'CRMTaskTemplates' },
  { icon: GitBranch, label: 'Workflows', page: 'CRMWorkflows' },
  { icon: BarChart3, label: 'Performance', page: 'CRMPerformance' },
  { icon: TrendingUp, label: 'Counselor Analytics', page: 'CRMCounselorAnalytics' },
  { icon: BarChart3, label: 'Reports', page: 'CRMReports' },
  { icon: Settings, label: 'Settings', page: 'CRMSettings' },
];

export default function CRMSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const currentPage = location.pathname.split('/').pop();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">ALO CRM</span>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("text-slate-400 hover:text-white hover:bg-slate-800", collapsed && "hidden")}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link key={item.page} to={createPageUrl(item.page)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive 
                  ? "bg-emerald-500 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
                collapsed && "justify-center px-3"
              )}>
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <Link to={createPageUrl('Home')}>
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all",
            collapsed && "justify-center px-3"
          )}>
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Back to Site</span>}
          </div>
        </Link>
      </div>
    </aside>
  );
}