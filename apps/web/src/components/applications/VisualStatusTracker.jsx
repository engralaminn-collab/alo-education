import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const APPLICATION_STAGES = [
  { key: 'lead', label: 'Lead', icon: Clock },
  { key: 'profile_ready', label: 'Profile Ready', icon: Clock },
  { key: 'ready_to_apply', label: 'Ready to Apply', icon: Clock },
  { key: 'applied', label: 'Application Submitted', icon: CheckCircle2 },
  { key: 'interview_scheduled', label: 'Interview Scheduled', icon: Clock },
  { key: 'offer', label: 'Offer Received', icon: CheckCircle2 },
  { key: 'cas_issued', label: 'CAS Issued', icon: CheckCircle2 },
  { key: 'visa_applied', label: 'Visa Applied', icon: Clock },
  { key: 'visa_approved', label: 'Visa Approved', icon: CheckCircle2 },
  { key: 'enrolled', label: 'Enrolled', icon: CheckCircle2 },
];

export default function VisualStatusTracker({ application }) {
  const currentStageIndex = APPLICATION_STAGES.findIndex(s => s.key === application.status);
  const isRejected = application.status === 'rejected' || application.status === 'withdrawn';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Application Status</span>
          {isRejected && (
            <Badge className="bg-red-100 text-red-700">
              {application.status === 'rejected' ? 'Rejected' : 'Withdrawn'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div 
            className="absolute left-6 top-0 w-0.5 bg-blue-600 transition-all duration-500"
            style={{ height: `${(currentStageIndex / (APPLICATION_STAGES.length - 1)) * 100}%` }}
          />

          {/* Stages */}
          <div className="space-y-6">
            {APPLICATION_STAGES.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const Icon = stage.icon;
              
              const milestone = application.milestones?.[stage.key];
              const completedDate = milestone?.completed ? milestone.date : null;

              return (
                <div key={stage.key} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all ${
                    isCompleted 
                      ? 'bg-blue-600 border-blue-600' 
                      : isCurrent 
                      ? 'bg-white border-blue-600' 
                      : 'bg-white border-slate-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${
                        isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                        {stage.label}
                      </h4>
                      {isCompleted && completedDate && (
                        <span className="text-xs text-slate-500">
                          {new Date(completedDate).toLocaleDateString()}
                        </span>
                      )}
                      {isCurrent && (
                        <Badge className="bg-blue-100 text-blue-700">Current</Badge>
                      )}
                    </div>
                    {isCurrent && (
                      <p className="text-sm text-slate-600 mt-1">
                        In progress - check back for updates
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isRejected && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Application {application.status}</p>
                {application.rejection_reason && (
                  <p className="text-sm text-red-700 mt-1">{application.rejection_reason}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}