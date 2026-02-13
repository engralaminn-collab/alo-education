import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, MessageSquare, FileText, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuickActions({ studentId, hasApplications }) {
  const actions = [
    {
      icon: Search,
      label: 'Find Courses',
      description: 'Browse universities and programs',
      link: 'CourseFinder',
      color: '#0066CC'
    },
    {
      icon: Upload,
      label: 'Upload Documents',
      description: 'Submit required documents',
      link: 'MyDocuments',
      color: '#F37021'
    },
    {
      icon: FileText,
      label: 'My Applications',
      description: 'Track application progress',
      link: 'MyApplications',
      color: '#10B981'
    },
    {
      icon: MessageSquare,
      label: 'Message Counselor',
      description: 'Get expert guidance',
      link: 'Messages',
      color: '#8B5CF6'
    },
    {
      icon: Calendar,
      label: 'Book Appointment',
      description: 'Schedule consultation',
      link: 'StudentDashboard',
      color: '#EC4899'
    },
    {
      icon: User,
      label: 'Update Profile',
      description: 'Keep information current',
      link: 'MyProfile',
      color: '#F59E0B'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Link key={index} to={createPageUrl(action.link)}>
              <div className="p-4 border-2 rounded-lg hover:shadow-md transition-all cursor-pointer group" style={{ borderColor: action.color }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: action.color + '20' }}>
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1 group-hover:underline">
                      {action.label}
                    </h4>
                    <p className="text-xs text-slate-600">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}