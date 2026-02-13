import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, FileText, MessageSquare, CheckCircle } from 'lucide-react';

export default function RecentActivity({ studentId }) {
  const { data: notifications = [] } = useQuery({
    queryKey: ['student-notifications', studentId],
    queryFn: async () => {
      const notifs = await base44.entities.Notification.filter({ 
        student_id: studentId 
      });
      return notifs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!studentId,
  });

  const getIcon = (type) => {
    switch(type) {
      case 'document': return FileText;
      case 'message': return MessageSquare;
      case 'application': return CheckCircle;
      default: return Activity;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notif, index) => {
              const Icon = getIcon(notif.type);
              return (
                <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" style={{ color: '#0066CC' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-600 mb-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(notif.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  {!notif.read && (
                    <Badge style={{ backgroundColor: '#F37021' }} className="text-xs">New</Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}