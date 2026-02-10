import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, Send, Mail, Plane, CheckCircle, GraduationCap,
  Circle 
} from 'lucide-react';
import { motion } from 'framer-motion';

const milestones = [
  { key: 'documents_submitted', label: 'Docs', icon: FileCheck, color: 'blue' },
  { key: 'application_submitted', label: 'Applied', icon: Send, color: 'purple' },
  { key: 'offer_received', label: 'Offer', icon: Mail, color: 'emerald' },
  { key: 'visa_applied', label: 'Visa', icon: Plane, color: 'cyan' },
  { key: 'visa_approved', label: 'Approved', icon: CheckCircle, color: 'teal' },
  { key: 'enrolled', label: 'Enrolled', icon: GraduationCap, color: 'green' }
];

export default function ApplicationProgressBar({ application, showLabels = true }) {
  const appMilestones = application?.milestones || {};
  
  const completedCount = milestones.filter(m => appMilestones[m.key]?.completed).length;
  const progressPercentage = (completedCount / milestones.length) * 100;

  return (
    <div className="space-y-3">
      {/* Progress Bar with Milestones */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full"></div>
        
        {/* Progress Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-full"
          style={{ maxWidth: '100%' }}
        />

        {/* Milestone Dots */}
        <div className="relative flex justify-between">
          {milestones.map((milestone, index) => {
            const completed = appMilestones[milestone.key]?.completed;
            const Icon = milestone.icon;
            
            return (
              <motion.div
                key={milestone.key}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    completed
                      ? `bg-${milestone.color}-500 border-${milestone.color}-500`
                      : 'bg-white border-slate-300'
                  }`}
                  style={{
                    backgroundColor: completed ? `var(--${milestone.color}-500, #10b981)` : 'white',
                    borderColor: completed ? `var(--${milestone.color}-500, #10b981)` : '#cbd5e1'
                  }}
                >
                  <Icon 
                    className={`w-5 h-5 ${completed ? 'text-white' : 'text-slate-400'}`}
                  />
                </div>
                
                {showLabels && (
                  <span className={`text-xs mt-2 text-center ${
                    completed ? 'text-slate-700 font-medium' : 'text-slate-400'
                  }`}>
                    {milestone.label}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-slate-600">
          {completedCount} of {milestones.length} milestones complete
        </span>
        <Badge 
          variant="outline" 
          className={
            progressPercentage === 100 ? 'bg-green-100 text-green-700 border-green-300' :
            progressPercentage >= 50 ? 'bg-blue-100 text-blue-700 border-blue-300' :
            'bg-slate-100 text-slate-700 border-slate-300'
          }
        >
          {progressPercentage.toFixed(0)}%
        </Badge>
      </div>
    </div>
  );
}