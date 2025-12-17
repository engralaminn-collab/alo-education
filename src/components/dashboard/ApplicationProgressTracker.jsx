import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const statusProgress = {
  draft: 10,
  documents_pending: 25,
  under_review: 40,
  submitted_to_university: 60,
  conditional_offer: 75,
  unconditional_offer: 85,
  visa_processing: 95,
  enrolled: 100,
  rejected: 0,
  withdrawn: 0,
};

const statusColors = {
  draft: 'bg-slate-100 text-slate-700',
  documents_pending: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  submitted_to_university: 'bg-purple-100 text-purple-700',
  conditional_offer: 'bg-emerald-100 text-emerald-700',
  unconditional_offer: 'bg-green-100 text-green-700',
  visa_processing: 'bg-cyan-100 text-cyan-700',
  enrolled: 'bg-emerald-500 text-white',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

const milestones = [
  { key: 'documents_submitted', label: 'Documents Submitted', icon: CheckCircle },
  { key: 'application_submitted', label: 'Application Submitted', icon: Clock },
  { key: 'offer_received', label: 'Offer Received', icon: GraduationCap },
  { key: 'visa_applied', label: 'Visa Applied', icon: AlertCircle },
  { key: 'visa_approved', label: 'Visa Approved', icon: CheckCircle },
  { key: 'enrolled', label: 'Enrolled', icon: Building2 },
];

export default function ApplicationProgressTracker({ applications, universities, courses }) {
  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const activeApps = applications.filter(app => 
    !['rejected', 'withdrawn', 'enrolled'].includes(app.status)
  );

  if (applications.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Application Progress</span>
          <Link to={createPageUrl('MyApplications')}>
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeApps.length === 0 ? (
          <p className="text-center text-slate-500 py-4">No active applications</p>
        ) : (
          activeApps.map((app, index) => {
            const university = universityMap[app.university_id];
            const course = courseMap[app.course_id];
            const progress = statusProgress[app.status] || 0;
            const completedMilestones = app.milestones ? 
              milestones.filter(m => app.milestones[m.key]?.completed).length : 0;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-50 rounded-xl"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">
                      {university?.university_name || 'University'}
                    </h4>
                    <p className="text-sm text-slate-600 truncate">
                      {course?.course_title || 'Course'}
                    </p>
                  </div>
                  <Badge className={statusColors[app.status]}>
                    {app.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">
                      Overall Progress
                    </span>
                    <span className="text-xs font-bold text-blue-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {milestones.slice(0, 6).map((milestone) => {
                    const Icon = milestone.icon;
                    const completed = app.milestones?.[milestone.key]?.completed;
                    return (
                      <div 
                        key={milestone.key}
                        className={`flex items-center gap-1 text-xs p-2 rounded-lg ${
                          completed 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-white text-slate-400'
                        }`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{milestone.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}