import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMSidebar from './CRMSidebar';
import NotificationCenter from './NotificationCenter';
import AutomatedTaskTrigger from './AutomatedTaskTrigger';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CRMLayout({ children, title, actions }) {
  const [collapsed, setCollapsed] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user-crm'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <AutomatedTaskTrigger />
      <CRMSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "ml-20" : "ml-64"
      )}>
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              {user && <NotificationCenter userId={user.id} />}
              {actions}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}