import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, CheckCircle, Clock, AlertCircle, 
  FileText, Plane, GraduationCap, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isBefore, addDays } from 'date-fns';
import { motion } from 'framer-motion';

const journeyStages = [
  { id: 'profile', label: 'Complete Profile', icon: FileText },
  { id: 'courses', label: 'Find Courses', icon: MapPin },
  { id: 'apply', label: 'Submit Applications', icon: FileText },
  { id: 'documents', label: 'Upload Documents', icon: FileText },
  { id: 'offer', label: 'Receive Offer', icon: CheckCircle },
  { id: 'visa', label: 'Visa Process', icon: Plane },
  { id: 'enrolled', label: 'Enrollment', icon: GraduationCap }
];

export default function MyJourney({ 
  studentProfile, 
  applications = [], 
  documents = [],
  tasks = [] 
}) {
  // Calculate current stage
  const profileComplete = (studentProfile?.profile_completeness || 0) >= 80;
  const hasApplications = applications.length > 0;
  const hasSubmittedApps = applications.some(a => 
    ['under_review', 'submitted_to_university', 'conditional_offer', 
     'unconditional_offer', 'visa_processing', 'enrolled'].includes(a.status)
  );
  const hasDocuments = documents.length >= 3;
  const hasOffer = applications.some(a => 
    ['conditional_offer', 'unconditional_offer'].includes(a.status)
  );
  const hasVisaProgress = applications.some(a => a.status === 'visa_processing');
  const isEnrolled = applications.some(a => a.status === 'enrolled');

  const currentStageIndex = isEnrolled ? 6 :
    hasVisaProgress ? 5 :
    hasOffer ? 4 :
    hasDocuments ? 3 :
    hasSubmittedApps ? 2 :
    hasApplications ? 2 :
    profileComplete ? 1 : 0;

  const progressPercent = ((currentStageIndex + 1) / journeyStages.length) * 100;

  // Get upcoming deadlines from tasks
  const upcomingTasks = tasks
    .filter(t => t.due_date && t.status !== 'completed')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  // Get recommended resources based on current stage and destination
  const getRecommendedResources = () => {
    const country = applications[0]?.university?.country || studentProfile?.preferred_countries?.[0];
    const resources = [];

    if (currentStageIndex === 0) {
      resources.push({ title: 'Complete Your Profile', link: 'MyProfile', icon: FileText });
    }
    if (currentStageIndex === 1) {
      resources.push({ title: 'Browse Universities', link: 'Universities', icon: MapPin });
      resources.push({ title: 'Find Matching Courses', link: 'CourseMatcher', icon: GraduationCap });
    }
    if (currentStageIndex === 2) {
      resources.push({ title: 'Upload Documents', link: 'MyDocuments', icon: FileText });
    }
    if (country) {
      const countryPages = {
        'UK': 'StudyInUK',
        'United Kingdom': 'StudyInUK',
        'USA': 'StudyInUSA',
        'United States': 'StudyInUSA',
        'Canada': 'StudyInCanada',
        'Australia': 'StudyInAustralia',
        'Ireland': 'StudyInIreland',
        'New Zealand': 'StudyInNewZealand'
      };
      if (countryPages[country]) {
        resources.push({ 
          title: `Study in ${country} Guide`, 
          link: countryPages[country], 
          icon: MapPin 
        });
      }
    }

    return resources;
  };

  const resources = getRecommendedResources();

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Your Journey Progress</h3>
              <p className="text-white/80 text-sm">
                {journeyStages[currentStageIndex].label}
              </p>
            </div>
            <div className="text-3xl font-bold">{Math.round(progressPercent)}%</div>
          </div>
          <Progress value={progressPercent} className="h-3 bg-white/20" />
        </CardContent>
      </Card>

      {/* Journey Timeline */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Journey Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journeyStages.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const Icon = stage.icon;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-2' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {stage.label}
                    </h4>
                    {isCurrent && (
                      <p className="text-xs text-blue-600">In Progress</p>
                    )}
                  </div>
                  {isCurrent && resources.length > 0 && (
                    <Link to={createPageUrl(resources[0].link)}>
                      <Button size="sm" variant="outline">
                        Next Step
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks & Deadlines */}
      {upcomingTasks.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map(task => {
                const dueDate = new Date(task.due_date);
                const isUrgent = isBefore(dueDate, addDays(new Date(), 3));

                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-900">{task.title}</h5>
                      <p className={`text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                        Due: {format(dueDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                    {isUrgent && (
                      <Badge className="bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Resources */}
      {resources.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recommended for You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Link key={index} to={createPageUrl(resource.link)}>
                    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-slate-900">{resource.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}