import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const milestones = [
  { key: 'documents_submitted', label: 'Documents Submitted', order: 1 },
  { key: 'application_submitted', label: 'Application Submitted', order: 2 },
  { key: 'offer_received', label: 'Offer Received', order: 3 },
  { key: 'visa_applied', label: 'Visa Applied', order: 4 },
  { key: 'visa_approved', label: 'Visa Approved', order: 5 },
  { key: 'enrolled', label: 'Enrolled', order: 6 },
];

export default function ApplicationProgressTimeline({ applications = [] }) {
  if (applications.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm text-center py-6">
            No applications yet. Start exploring courses to begin your journey.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall progress across all applications
  const calculateProgress = (application) => {
    if (!application.milestones) return 0;
    const completedMilestones = milestones.filter(m => 
      application.milestones[m.key]?.completed
    ).length;
    return (completedMilestones / milestones.length) * 100;
  };

  const activeApplications = applications.filter(a => 
    !['rejected', 'withdrawn'].includes(a.status)
  );

  const overallProgress = activeApplications.length > 0
    ? activeApplications.reduce((sum, app) => sum + calculateProgress(app), 0) / activeApplications.length
    : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Application Progress</CardTitle>
          <Badge variant="outline" className="text-lg font-bold">
            {Math.round(overallProgress)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={overallProgress} className="h-3 mb-6" />

        <div className="space-y-6">
          {activeApplications.slice(0, 2).map((application, appIndex) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: appIndex * 0.1 }}
              className="relative"
            >
              <div className="mb-4">
                <h4 className="font-semibold text-slate-900 mb-1">
                  Application #{appIndex + 1}
                </h4>
                <div className="flex items-center gap-2">
                  <Progress value={calculateProgress(application)} className="flex-1 h-2" />
                  <span className="text-sm text-slate-600 font-medium">
                    {Math.round(calculateProgress(application))}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {milestones.map((milestone, index) => {
                  const isCompleted = application.milestones?.[milestone.key]?.completed;
                  const completedDate = application.milestones?.[milestone.key]?.date;

                  return (
                    <div key={milestone.key} className="flex items-start gap-3">
                      <div className="relative">
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300" />
                        )}
                        {index < milestones.length - 1 && (
                          <div className={`absolute left-3 top-6 w-0.5 h-8 ${
                            isCompleted ? 'bg-emerald-200' : 'bg-slate-200'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-sm font-medium ${
                            isCompleted ? 'text-slate-900' : 'text-slate-500'
                          }`}>
                            {milestone.label}
                          </h5>
                          {isCompleted && completedDate && (
                            <span className="text-xs text-slate-500">
                              {new Date(completedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {application.milestones?.[milestone.key]?.notes && (
                          <p className="text-xs text-slate-500 mt-1">
                            {application.milestones[milestone.key].notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {activeApplications.length > 2 && (
            <p className="text-sm text-slate-500 text-center pt-2">
              + {activeApplications.length - 2} more application(s)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}