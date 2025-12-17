import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ApplicationNotifications({ studentProfile }) {
  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications-notifications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile.id }, '-updated_date', 10),
    enabled: !!studentProfile?.id,
  });

  const getNotifications = () => {
    const notifications = [];
    
    applications.forEach(app => {
      // Application Submitted
      if (app.milestones?.application_submitted?.completed) {
        notifications.push({
          id: `${app.id}-submitted`,
          type: 'success',
          title: 'Application Submitted',
          message: `Your application has been submitted successfully`,
          date: app.milestones.application_submitted.date,
          icon: CheckCircle
        });
      }

      // Offer Received
      if (app.milestones?.offer_received?.completed) {
        notifications.push({
          id: `${app.id}-offer`,
          type: 'success',
          title: 'Offer Received',
          message: `You have received an ${app.offer_type || ''} offer`,
          date: app.milestones.offer_received.date,
          icon: CheckCircle
        });
      }

      // Visa Applied
      if (app.milestones?.visa_applied?.completed) {
        notifications.push({
          id: `${app.id}-visa-applied`,
          type: 'info',
          title: 'Visa Application Submitted',
          message: 'Your visa application has been submitted',
          date: app.milestones.visa_applied.date,
          icon: Clock
        });
      }

      // Visa Approved
      if (app.milestones?.visa_approved?.completed) {
        notifications.push({
          id: `${app.id}-visa-approved`,
          type: 'success',
          title: 'Visa Approved',
          message: 'Congratulations! Your visa has been approved',
          date: app.milestones.visa_approved.date,
          icon: CheckCircle
        });
      }

      // Enrolled
      if (app.milestones?.enrolled?.completed) {
        notifications.push({
          id: `${app.id}-enrolled`,
          type: 'success',
          title: 'Enrollment Complete',
          message: 'You have been successfully enrolled',
          date: app.milestones.enrolled.date,
          icon: CheckCircle
        });
      }
    });

    return notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const notifications = getNotifications();

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" style={{ color: '#0066CC' }} />
          Application Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            No notifications yet
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => {
              const Icon = notification.icon;
              return (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{notification.title}</h4>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    {notification.date && (
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(notification.date), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}