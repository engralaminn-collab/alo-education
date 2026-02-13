import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Send, Mail, Plane, PlaneIcon, CheckCircle,
  Circle, Clock, GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const milestoneConfig = [
  {
    key: 'documents_submitted',
    label: 'Documents Submitted',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    key: 'application_submitted',
    label: 'Application Submitted',
    icon: Send,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    key: 'offer_received',
    label: 'Offer Received',
    icon: Mail,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  },
  {
    key: 'visa_applied',
    label: 'Visa Applied',
    icon: Plane,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100'
  },
  {
    key: 'visa_approved',
    label: 'Visa Approved',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    key: 'enrolled',
    label: 'Enrolled',
    icon: GraduationCap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  }
];

export default function MilestoneTracker({ application, variant = 'horizontal' }) {
  const milestones = application?.milestones || {};

  // Find current milestone
  const currentMilestoneIndex = milestoneConfig.findIndex((m, index) => {
    const milestone = milestones[m.key];
    const nextMilestone = milestoneConfig[index + 1] ? milestones[milestoneConfig[index + 1].key] : null;
    return !milestone?.completed && (!nextMilestone || !nextMilestone.completed);
  });

  if (variant === 'vertical') {
    return (
      <div className="space-y-1">
        {milestoneConfig.map((milestone, index) => {
          const data = milestones[milestone.key] || {};
          const isCompleted = data.completed;
          const isCurrent = index === currentMilestoneIndex;
          const Icon = milestone.icon;

          return (
            <motion.div
              key={milestone.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-emerald-500 text-white' :
                  isCurrent ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-2' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < milestoneConfig.length - 1 && (
                  <div className={`absolute left-1/2 top-10 -translate-x-1/2 w-0.5 h-8 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <h5 className={`font-medium text-sm ${
                  isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {milestone.label}
                </h5>
                {data.date && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(data.date), 'MMM d, yyyy')}
                  </p>
                )}
                {data.notes && (
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded">
                    {data.notes}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-8">
        {milestoneConfig.map((milestone, index) => {
          const data = milestones[milestone.key] || {};
          const isCompleted = data.completed;
          const isCurrent = index === currentMilestoneIndex;
          const Icon = milestone.icon;

          return (
            <React.Fragment key={milestone.key}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                  isCurrent ? `${milestone.bgColor} ${milestone.color} ring-4 ring-offset-2 ring-opacity-50` :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 md:w-7 md:h-7" />
                  ) : (
                    <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  )}
                </div>
                <span className={`text-xs md:text-sm font-medium text-center max-w-[80px] md:max-w-none ${
                  isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {milestone.label}
                </span>
                {data.date && (
                  <span className="text-xs text-slate-400 mt-1 hidden md:block">
                    {format(new Date(data.date), 'MMM d')}
                  </span>
                )}
              </motion.div>
              
              {index < milestoneConfig.length - 1 && (
                <div className="flex-1 h-1 mx-2 mt-6 relative">
                  <div className="absolute inset-0 bg-slate-200 rounded-full" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="absolute inset-0 bg-emerald-500 rounded-full"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Details */}
      {currentMilestoneIndex >= 0 && currentMilestoneIndex < milestoneConfig.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <h5 className="font-semibold text-blue-900">Current Step</h5>
          </div>
          <p className="text-sm text-blue-700">
            {milestoneConfig[currentMilestoneIndex].label} is in progress
          </p>
        </motion.div>
      )}
    </div>
  );
}