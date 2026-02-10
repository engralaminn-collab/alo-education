import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText, Calendar, Bell, MessageSquare, Zap,
  CheckCircle, AlertTriangle, Clock, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

export function ApplicationStatusWidget({ applications, courseMap, universityMap }) {
  const statusStats = {
    draft: applications.filter(a => a.status === 'draft').length,
    submitted: applications.filter(a => ['submitted_to_university', 'under_review'].includes(a.status)).length,
    offers: applications.filter(a => ['conditional_offer', 'unconditional_offer'].includes(a.status)).length,
    enrolled: applications.filter(a => a.status === 'enrolled').length,
  };

  const totalApplications = applications.length || 1;
  const completionRate = Math.round(((statusStats.submitted + statusStats.offers + statusStats.enrolled) / totalApplications) * 100);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Application Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-600">Overall Progress</span>
            <span className="font-semibold text-slate-900">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-900">{totalApplications}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">Submitted</p>
            <p className="text-xl font-bold text-blue-900">{statusStats.submitted}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-600">Offers</p>
            <p className="text-xl font-bold text-emerald-900">{statusStats.offers}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600">Enrolled</p>
            <p className="text-xl font-bold text-green-900">{statusStats.enrolled}</p>
          </div>
        </div>

        <Link to={createPageUrl('MyApplications')}>
          <Button variant="outline" className="w-full text-xs h-8">
            View All Applications
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function UpcomingDeadlinesWidget({ applications, courseMap, universityMap }) {
  const upcomingDeadlines = applications
    .filter(a => a.offer_deadline || a.milestones?.documents_submitted?.date)
    .map(a => ({
      ...a,
      deadline: a.offer_deadline || a.milestones?.documents_submitted?.date,
      type: a.offer_deadline ? 'offer' : 'document'
    }))
    .filter(a => {
      const daysUntil = differenceInDays(new Date(a.deadline), new Date());
      return daysUntil >= 0 && daysUntil <= 30;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDeadlines.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No deadlines in the next 30 days</p>
        ) : (
          upcomingDeadlines.map((deadline, idx) => {
            const daysLeft = differenceInDays(new Date(deadline.deadline), new Date());
            const isUrgent = daysLeft <= 7;
            
            return (
              <motion.div
                key={deadline.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-3 rounded-lg border ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {courseMap[deadline.course_id]?.course_title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {deadline.type === 'offer' ? 'Offer Deadline' : 'Document Due'}
                    </p>
                  </div>
                  <Badge className={isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} variant="outline">
                    {daysLeft} days
                  </Badge>
                </div>
              </motion.div>
            );
          })
        )}

        <Link to={createPageUrl('MyApplications')}>
          <Button variant="outline" className="w-full text-xs h-8">
            See All Deadlines
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function AlertsNotificationsWidget({ applications, studentProfile }) {
  const alerts = [];

  // Profile completeness alert
  if ((studentProfile?.profile_completeness || 0) < 80) {
    alerts.push({
      id: 'profile',
      type: 'warning',
      title: 'Complete Your Profile',
      message: `Your profile is ${studentProfile?.profile_completeness || 0}% complete`,
      action: 'Complete Now'
    });
  }

  // Missing documents alert
  const pendingApps = applications.filter(a => a.status === 'documents_pending');
  if (pendingApps.length > 0) {
    alerts.push({
      id: 'docs',
      type: 'alert',
      title: 'Documents Required',
      message: `${pendingApps.length} application(s) need documents`,
      action: 'Upload Now'
    });
  }

  // Test score alert
  if (!studentProfile?.english_proficiency?.overall_score) {
    alerts.push({
      id: 'test',
      type: 'info',
      title: 'Add English Test Score',
      message: 'Many universities require an IELTS or similar score',
      action: 'Add Score'
    });
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">All Clear!</p>
              <p className="text-xs text-emerald-700">Everything is up to date</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Alert className={
            alert.type === 'alert' ? 'border-red-200 bg-red-50' :
            alert.type === 'warning' ? 'border-orange-200 bg-orange-50' :
            'border-blue-200 bg-blue-50'
          }>
            <div className="flex items-start gap-3">
              {alert.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
              {alert.type === 'warning' && <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />}
              {alert.type === 'info' && <Bell className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <AlertDescription>
                  <p className="font-semibold text-sm mb-1">{alert.title}</p>
                  <p className="text-xs text-slate-600">{alert.message}</p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </motion.div>
      ))}
    </div>
  );
}

export function QuickLinksWidget() {
  const links = [
    { icon: FileText, label: 'My Applications', href: 'MyApplications', color: 'text-blue-600' },
    { icon: MessageSquare, label: 'Messages', href: 'Messages', color: 'text-purple-600' },
    { icon: Zap, label: 'AI Advisor', href: 'StudentPortal', color: 'text-yellow-600' },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Quick Access</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} to={createPageUrl(link.href)}>
                <button className="w-full p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center gap-2">
                  <Icon className={`w-5 h-5 ${link.color}`} />
                  <span className="text-xs font-medium text-slate-900 text-center line-clamp-2">
                    {link.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}