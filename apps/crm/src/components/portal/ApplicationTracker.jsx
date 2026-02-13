import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, 
  FileText, Calendar, Building2, GraduationCap,
  TrendingUp, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';

const statusConfig = {
  draft: { color: 'bg-slate-100 text-slate-700', icon: FileText, label: 'Draft' },
  documents_pending: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle, label: 'Documents Pending' },
  under_review: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Under Review' },
  submitted_to_university: { color: 'bg-purple-100 text-purple-700', icon: TrendingUp, label: 'Submitted to University' },
  conditional_offer: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Conditional Offer' },
  unconditional_offer: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Unconditional Offer' },
  visa_processing: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Visa Processing' },
  enrolled: { color: 'bg-emerald-100 text-emerald-700', icon: GraduationCap, label: 'Enrolled' },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
  withdrawn: { color: 'bg-slate-100 text-slate-700', icon: XCircle, label: 'Withdrawn' }
};

export default function ApplicationTracker() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: () => base44.entities.StudentProfile.filter({ email: user?.email }),
    enabled: !!user?.email,
    select: (data) => data[0]
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', profile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: profile?.id }, '-updated_date'),
    enabled: !!profile?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const getCourse = (courseId) => courses.find(c => c.id === courseId);
  const getUniversity = (uniId) => universities.find(u => u.id === uniId);

  const getApplicationProgress = (app) => {
    const milestones = app.milestones || {};
    const completed = Object.values(milestones).filter(m => m?.completed).length;
    const total = Object.keys(milestones).length || 6;
    return (completed / total) * 100;
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return { type: 'overdue', label: 'Overdue', color: 'text-red-600' };
    if (days <= 7) return { type: 'urgent', label: `${days} days left`, color: 'text-red-600' };
    if (days <= 30) return { type: 'soon', label: `${days} days left`, color: 'text-amber-600' };
    return { type: 'normal', label: `${days} days left`, color: 'text-slate-600' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-education-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your applications...</p>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Applications Yet</h3>
          <p className="text-slate-600 mb-6">Start exploring courses and universities to begin your application journey.</p>
          <Link to={createPageUrl('CourseMatcher')}>
            <Button className="bg-education-blue hover:bg-education-blue/90">
              Explore Courses
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: applications.length, color: 'bg-slate-100 text-slate-700' },
          { label: 'In Progress', value: applications.filter(a => ['under_review', 'submitted_to_university'].includes(a.status)).length, color: 'bg-blue-100 text-blue-700' },
          { label: 'Offers', value: applications.filter(a => ['conditional_offer', 'unconditional_offer'].includes(a.status)).length, color: 'bg-green-100 text-green-700' },
          { label: 'Action Needed', value: applications.filter(a => a.status === 'documents_pending').length, color: 'bg-amber-100 text-amber-700' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app, index) => {
          const course = getCourse(app.course_id);
          const university = getUniversity(app.university_id);
          const status = statusConfig[app.status] || statusConfig.draft;
          const progress = getApplicationProgress(app);
          const deadlineStatus = app.offer_deadline ? getDeadlineStatus(app.offer_deadline) : null;

          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-xl ${status.color} flex items-center justify-center flex-shrink-0`}>
                      <status.icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {course?.course_title || 'Unknown Course'}
                          </h3>
                          {university && (
                            <p className="text-slate-600 text-sm flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {university.university_name} • {university.country}
                            </p>
                          )}
                        </div>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-600">Application Progress</span>
                          <span className="text-sm font-medium text-slate-900">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {app.intake && (
                          <div>
                            <div className="text-xs text-slate-500">Intake</div>
                            <div className="text-sm font-medium text-slate-900">{app.intake}</div>
                          </div>
                        )}
                        {app.applied_date && (
                          <div>
                            <div className="text-xs text-slate-500">Applied</div>
                            <div className="text-sm font-medium text-slate-900">
                              {format(new Date(app.applied_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                        )}
                        {deadlineStatus && (
                          <div>
                            <div className="text-xs text-slate-500">Deadline</div>
                            <div className={`text-sm font-medium ${deadlineStatus.color}`}>
                              {deadlineStatus.label}
                            </div>
                          </div>
                        )}
                        {app.priority && (
                          <div>
                            <div className="text-xs text-slate-500">Priority</div>
                            <div className="text-sm font-medium text-slate-900">
                              {'⭐'.repeat(app.priority)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link to={createPageUrl('MyApplications') + `?app=${app.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        {university?.website_url && (
                          <a href={university.website_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              University Portal
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}