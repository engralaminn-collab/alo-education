import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, Clock, CheckCircle, AlertCircle, FileText, 
  University as UniversityIcon, BookOpen, Plus, ChevronDown, ChevronUp
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const statusColors = {
  draft: 'bg-slate-100 text-slate-700',
  documents_pending: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  submitted_to_university: 'bg-purple-100 text-purple-700',
  conditional_offer: 'bg-orange-100 text-orange-700',
  unconditional_offer: 'bg-green-100 text-green-700',
  visa_processing: 'bg-indigo-100 text-indigo-700',
  enrolled: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-700',
};

const milestonesList = [
  { key: 'documents_submitted', label: 'Documents Submitted', icon: FileText },
  { key: 'application_submitted', label: 'Application Submitted', icon: CheckCircle },
  { key: 'offer_received', label: 'Offer Received', icon: UniversityIcon },
  { key: 'visa_applied', label: 'Visa Applied', icon: Calendar },
  { key: 'visa_approved', label: 'Visa Approved', icon: CheckCircle },
  { key: 'enrolled', label: 'Enrolled', icon: BookOpen },
];

export default function ApplicationTrackingSystem({ 
  applications, 
  universities, 
  courses, 
  onAddApplication,
  onUpdateApplication 
}) {
  const [expandedApp, setExpandedApp] = useState(null);

  const calculateProgress = (app) => {
    if (!app.milestones) return 0;
    const completed = Object.values(app.milestones).filter(m => m?.completed).length;
    return (completed / milestonesList.length) * 100;
  };

  const getUpcomingDeadlines = () => {
    const today = new Date();
    return applications
      .filter(app => app.offer_deadline || app.applied_date)
      .map(app => {
        const deadline = app.offer_deadline ? new Date(app.offer_deadline) : null;
        const daysLeft = deadline ? differenceInDays(deadline, today) : null;
        return { ...app, deadline, daysLeft };
      })
      .filter(app => app.daysLeft !== null && app.daysLeft >= 0 && app.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  const getNextAction = (app) => {
    if (!app.milestones) return 'Start your application';
    
    if (!app.milestones.documents_submitted?.completed) {
      return 'Upload required documents';
    }
    if (!app.milestones.application_submitted?.completed) {
      return 'Submit application to university';
    }
    if (!app.milestones.offer_received?.completed) {
      return 'Waiting for university offer';
    }
    if (app.milestones.offer_received?.completed && !app.milestones.visa_applied?.completed) {
      return 'Apply for visa';
    }
    if (app.milestones.visa_applied?.completed && !app.milestones.visa_approved?.completed) {
      return 'Waiting for visa approval';
    }
    if (app.milestones.visa_approved?.completed && !app.milestones.enrolled?.completed) {
      return 'Complete enrollment';
    }
    return 'Application complete';
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Reminders */}
      {upcomingDeadlines.length > 0 && (
        <Card className="border-l-4 border-l-alo-orange bg-gradient-to-r from-orange-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-alo-orange" />
              <CardTitle className="text-lg">Upcoming Deadlines & Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.map(app => {
              const uni = universities[app.university_id];
              const course = courses[app.course_id];
              const isUrgent = app.daysLeft <= 7;
              
              return (
                <div 
                  key={app.id} 
                  className={`p-3 rounded-lg ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-white border border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{uni?.university_name}</div>
                      <div className="text-sm text-slate-600">{course?.course_title}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className={`w-3 h-3 ${isUrgent ? 'text-red-600' : 'text-orange-600'}`} />
                        <span className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                          {app.daysLeft === 0 ? 'Due today!' : `${app.daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                    <Badge className={isUrgent ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}>
                      {format(app.deadline, 'MMM dd, yyyy')}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 bg-white px-2 py-1 rounded">
                    <strong>Next Action:</strong> {getNextAction(app)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Applications Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">My Applications</h3>
          <p className="text-sm text-slate-600 mt-1">Track your progress across universities</p>
        </div>
        <Button onClick={onAddApplication} className="bg-gradient-brand">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </div>

      {/* Application Cards */}
      <div className="grid gap-4">
        {applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <UniversityIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Applications Yet</h3>
              <p className="text-slate-500 mb-4">Start your journey by adding your first application</p>
              <Button onClick={onAddApplication} className="bg-gradient-brand">
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          applications.map(app => {
            const uni = universities[app.university_id];
            const course = courses[app.course_id];
            const progress = calculateProgress(app);
            const isExpanded = expandedApp === app.id;
            const nextAction = getNextAction(app);

            return (
              <Card key={app.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {uni?.logo && (
                          <img src={uni.logo} alt={uni.university_name} className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <h4 className="font-bold text-lg text-slate-900">{uni?.university_name || 'Unknown University'}</h4>
                          <p className="text-sm text-slate-600">{course?.course_title || 'Unknown Course'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        <Badge className={statusColors[app.status]}>
                          {app.status?.replace(/_/g, ' ')}
                        </Badge>
                        {app.intake && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {app.intake}
                          </Badge>
                        )}
                        {app.priority && (
                          <Badge variant="outline" className="text-xs">
                            Priority {app.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Application Progress</span>
                      <span className="text-sm font-bold text-education-blue">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Next Action */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-education-blue mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-education-blue uppercase">Next Action</div>
                        <div className="text-sm text-slate-700 mt-1">{nextAction}</div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones Toggle */}
                  <Button
                    variant="ghost"
                    onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                    className="w-full justify-between"
                  >
                    <span className="text-sm font-medium">View Milestones</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {/* Expanded Milestones */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      {milestonesList.map(({ key, label, icon: Icon }) => {
                        const milestone = app.milestones?.[key];
                        const isCompleted = milestone?.completed;
                        
                        return (
                          <div key={key} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-100' : 'bg-slate-100'
                            }`}>
                              <Icon className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                                  {label}
                                </span>
                                {isCompleted && milestone.date && (
                                  <span className="text-xs text-slate-500">
                                    {format(new Date(milestone.date), 'MMM dd, yyyy')}
                                  </span>
                                )}
                              </div>
                              {milestone?.notes && (
                                <p className="text-xs text-slate-600 mt-1">{milestone.notes}</p>
                              )}
                            </div>
                            {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer Info */}
                  {(app.offer_deadline || app.tuition_fee) && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                      {app.offer_deadline && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>Deadline: {format(new Date(app.offer_deadline), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      {app.tuition_fee && (
                        <div className="font-semibold text-slate-900">
                          ${app.tuition_fee?.toLocaleString()}/year
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}