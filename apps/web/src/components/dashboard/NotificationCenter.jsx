import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, FileText, CheckCircle2, AlertCircle, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationCenter({ studentProfile }) {
  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['student-documents', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['student-tasks', studentProfile?.id],
    queryFn: () => base44.entities.Task.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  // Generate notifications
  const notifications = [];

  // Application updates
  applications.forEach(app => {
    if (app.status === 'offer') {
      notifications.push({
        id: `app-${app.id}`,
        type: 'success',
        icon: CheckCircle2,
        title: 'Offer Received!',
        message: `You received an offer from ${app.university_id}`,
        date: app.offer_date,
        priority: 'high'
      });
    }
    if (app.status === 'cas_issued') {
      notifications.push({
        id: `cas-${app.id}`,
        type: 'success',
        icon: FileText,
        title: 'CAS Issued',
        message: `Your CAS has been issued. CAS Number: ${app.cas_number}`,
        date: app.cas_date,
        priority: 'high'
      });
    }
    if (app.status === 'visa_approved') {
      notifications.push({
        id: `visa-${app.id}`,
        type: 'success',
        icon: CheckCircle2,
        title: 'Visa Approved! 🎉',
        message: 'Congratulations! Your visa application has been approved.',
        date: app.visa_decision_date,
        priority: 'high'
      });
    }
  });

  // Document expiry warnings
  documents.forEach(doc => {
    if (doc.expiry_date) {
      const daysUntilExpiry = Math.floor((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        notifications.push({
          id: `doc-${doc.id}`,
          type: 'warning',
          icon: AlertCircle,
          title: 'Document Expiring Soon',
          message: `${doc.name} expires in ${daysUntilExpiry} days`,
          date: doc.expiry_date,
          priority: 'high'
        });
      }
    }
    if (doc.status === 'rejected') {
      notifications.push({
        id: `doc-rej-${doc.id}`,
        type: 'error',
        icon: AlertCircle,
        title: 'Document Rejected',
        message: `${doc.name} needs revision: ${doc.reviewer_notes}`,
        date: doc.reviewed_date,
        priority: 'high'
      });
    }
  });

  // Pending tasks
  tasks.filter(t => t.status === 'pending' && t.due_date).forEach(task => {
    const daysUntilDue = Math.floor((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 7 && daysUntilDue >= 0) {
      notifications.push({
        id: `task-${task.id}`,
        type: 'info',
        icon: Calendar,
        title: 'Upcoming Deadline',
        message: `${task.title} - Due in ${daysUntilDue} days`,
        date: task.due_date,
        priority: daysUntilDue <= 2 ? 'high' : 'medium'
      });
    }
  });

  // Sort by priority and date
  notifications.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.date) - new Date(a.date);
  });

  const typeColors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-orange-100 text-orange-700 border-orange-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" style={{ color: '#F37021' }} />
          Notifications
          {notifications.length > 0 && (
            <Badge style={{ backgroundColor: '#F37021' }}>{notifications.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.slice(0, 5).map(notif => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border ${typeColors[notif.type]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{notif.title}</h4>
                    <p className="text-sm">{notif.message}</p>
                    {notif.date && (
                      <p className="text-xs mt-2 opacity-75">
                        {format(new Date(notif.date), 'PPP')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {notifications.length > 5 && (
          <p className="text-sm text-slate-500 text-center pt-2">
            +{notifications.length - 5} more notifications
          </p>
        )}
      </CardContent>
    </Card>
  );
}