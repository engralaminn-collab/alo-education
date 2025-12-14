import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, CheckCircle, AlertCircle, MessageSquare, 
  FileText, Calendar, ArrowRight, User
} from 'lucide-react';
import { format } from 'date-fns';
import MilestoneTracker from '@/components/applications/MilestoneTracker';
import { motion } from 'framer-motion';

export default function ApplicationTracker({ application, university, course, onUpdate }) {
  const statusConfig = {
    draft: { color: 'bg-slate-100 text-slate-700', icon: FileText },
    documents_pending: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    under_review: { color: 'bg-blue-100 text-blue-700', icon: Clock },
    submitted_to_university: { color: 'bg-purple-100 text-purple-700', icon: ArrowRight },
    conditional_offer: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    unconditional_offer: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    visa_processing: { color: 'bg-cyan-100 text-cyan-700', icon: Clock },
    enrolled: { color: 'bg-emerald-500 text-white', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    withdrawn: { color: 'bg-slate-100 text-slate-500', icon: AlertCircle },
  };

  const config = statusConfig[application.status] || statusConfig.draft;
  const StatusIcon = config.icon;

  // Calculate progress
  const milestoneKeys = ['documents_submitted', 'application_submitted', 'offer_received', 'visa_approved', 'enrolled'];
  const completedMilestones = milestoneKeys.filter(key => 
    application.milestones?.[key]?.completed
  ).length;
  const progress = (completedMilestones / milestoneKeys.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <StatusIcon className="w-6 h-6" />
                Application Status
              </CardTitle>
              <p className="text-slate-500 mt-1">Track your application progress in real-time</p>
            </div>
            <Badge className={`${config.color} px-4 py-2 text-sm`}>
              {application.status?.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm font-bold" style={{ color: '#0B5ED7' }}>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Course & University Info */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm text-slate-500 mb-1">Course</p>
              <p className="font-semibold text-slate-900">{course?.course_title || 'Course Name'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">University</p>
              <p className="font-semibold text-slate-900">{university?.university_name || 'University Name'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Intake</p>
              <p className="font-semibold text-slate-900">{application.intake || 'TBD'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Applied Date</p>
              <p className="font-semibold text-slate-900">
                {application.applied_date ? format(new Date(application.applied_date), 'MMM dd, yyyy') : 'Not yet'}
              </p>
            </div>
          </div>

          {/* Milestone Tracker */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Application Journey</h3>
            <MilestoneTracker milestones={application.milestones || {}} variant="horizontal" />
          </div>

          {/* Counselor Notes */}
          {application.counselor_notes && (
            <div className="p-4 bg-blue-50 border-l-4 rounded-lg" style={{ borderColor: '#0B5ED7' }}>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 mt-0.5" style={{ color: '#0B5ED7' }} />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2" style={{ color: '#0B5ED7' }}>Counselor Notes</h4>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{application.counselor_notes}</p>
                  {application.updated_date && (
                    <p className="text-xs text-slate-500 mt-2">
                      Last updated: {format(new Date(application.updated_date), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Student Notes */}
          {application.student_notes && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Your Notes</h4>
              <p className="text-slate-700 text-sm whitespace-pre-wrap">{application.student_notes}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Counselor
            </Button>
            <Button variant="outline" className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              View Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}