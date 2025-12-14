import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, Clock, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';

const statusConfig = {
  draft: { color: 'bg-slate-100 text-slate-800', icon: Clock, label: 'Draft' },
  documents_pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Documents Pending' },
  under_review: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Under Review' },
  submitted_to_university: { color: 'bg-purple-100 text-purple-800', icon: TrendingUp, label: 'Submitted' },
  conditional_offer: { color: 'bg-orange-100 text-orange-800', icon: CheckCircle, label: 'Conditional Offer' },
  unconditional_offer: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Unconditional Offer' },
  visa_processing: { color: 'bg-cyan-100 text-cyan-800', icon: Clock, label: 'Visa Processing' },
  enrolled: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Enrolled' },
  rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rejected' },
  withdrawn: { color: 'bg-slate-100 text-slate-800', icon: AlertCircle, label: 'Withdrawn' }
};

const calculateProgress = (application) => {
  const milestones = application.milestones || {};
  const completed = Object.values(milestones).filter(m => m?.completed).length;
  const total = Object.keys(milestones).length;
  return total > 0 ? (completed / total) * 100 : 0;
};

export default function ApplicationTracker({ applications = [], universities = [], courses = [] }) {
  const activeApplications = applications.filter(app => 
    !['rejected', 'withdrawn', 'enrolled'].includes(app.status)
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Application Progress Tracker
          </CardTitle>
          <Link to={createPageUrl('MyApplications')}>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {activeApplications.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600">No active applications yet</p>
            <Link to={createPageUrl('Universities')}>
              <Button className="mt-4">Browse Universities</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeApplications.map((app) => {
              const university = universities.find(u => u.id === app.university_id);
              const course = courses.find(c => c.id === app.course_id);
              const progress = calculateProgress(app);
              const StatusIcon = statusConfig[app.status]?.icon || Clock;

              return (
                <div 
                  key={app.id} 
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {university?.name || 'University'}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {course?.name || 'Course'}
                      </p>
                    </div>
                    <Badge className={statusConfig[app.status]?.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[app.status]?.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold text-slate-900">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {app.intake && (
                    <div className="mt-3 text-xs text-slate-600">
                      <span className="font-medium">Target Intake:</span> {app.intake}
                    </div>
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