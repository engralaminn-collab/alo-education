import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, Send, Mail, Plane, GraduationCap, 
  CheckCircle, Clock, Circle 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const milestoneConfig = [
  {
    key: 'documents_submitted',
    label: 'Documents Submitted',
    icon: FileCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    lineColor: 'bg-blue-600'
  },
  {
    key: 'application_submitted',
    label: 'Application Submitted',
    icon: Send,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    lineColor: 'bg-purple-600'
  },
  {
    key: 'offer_received',
    label: 'Offer Received',
    icon: Mail,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    lineColor: 'bg-emerald-600'
  },
  {
    key: 'visa_applied',
    label: 'Visa Applied',
    icon: Plane,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    lineColor: 'bg-cyan-600'
  },
  {
    key: 'visa_approved',
    label: 'Visa Approved',
    icon: CheckCircle,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    lineColor: 'bg-teal-600'
  },
  {
    key: 'enrolled',
    label: 'Enrolled',
    icon: GraduationCap,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    lineColor: 'bg-green-600'
  }
];

export default function ApplicationTimeline({ application, compact = false }) {
  const milestones = application?.milestones || {};
  
  const getCompletedCount = () => {
    return milestoneConfig.filter(m => milestones[m.key]?.completed).length;
  };

  const completedCount = getCompletedCount();
  const progressPercentage = (completedCount / milestoneConfig.length) * 100;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Progress</span>
          <span className="font-semibold text-slate-900">
            {completedCount}/{milestoneConfig.length} milestones
          </span>
        </div>
        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute h-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {milestoneConfig.map(milestone => {
            const completed = milestones[milestone.key]?.completed;
            const Icon = milestone.icon;
            return (
              <div 
                key={milestone.key}
                className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  completed ? milestone.bgColor : 'bg-slate-100'
                }`}
                title={milestone.label}
              >
                <Icon className={`w-3 h-3 ${completed ? milestone.color : 'text-slate-400'}`} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Application Progress</CardTitle>
          <Badge variant="outline" className="gap-1">
            {completedCount}/{milestoneConfig.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute h-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {progressPercentage.toFixed(0)}% Complete
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {milestoneConfig.map((milestone, index) => {
            const completed = milestones[milestone.key]?.completed;
            const date = milestones[milestone.key]?.date;
            const notes = milestones[milestone.key]?.notes;
            const Icon = milestone.icon;
            const isLast = index === milestoneConfig.length - 1;

            return (
              <motion.div
                key={milestone.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pb-8 last:pb-0"
              >
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200">
                    {completed && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                        className={`w-full ${milestone.lineColor}`}
                      />
                    )}
                  </div>
                )}

                {/* Milestone Content */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    completed 
                      ? `${milestone.bgColor} border-transparent` 
                      : 'bg-white border-slate-200'
                  }`}>
                    <Icon className={`w-6 h-6 ${completed ? milestone.color : 'text-slate-400'}`} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${completed ? 'text-slate-900' : 'text-slate-500'}`}>
                        {milestone.label}
                      </h4>
                      {completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    {completed ? (
                      <div className="space-y-1">
                        {date && (
                          <p className="text-sm text-slate-600">
                            Completed on {format(new Date(date), 'MMM d, yyyy')}
                          </p>
                        )}
                        {notes && (
                          <p className="text-sm text-slate-500 italic">{notes}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Pending</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}