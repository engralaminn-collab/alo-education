import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Building2, Clock, CheckCircle, XCircle, 
  AlertCircle, ArrowRight, Calendar, DollarSign, 
  ChevronRight, GraduationCap, Circle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import MilestoneTracker from '@/components/applications/MilestoneTracker';
import AIDocumentFeedback from '@/components/applications/AIDocumentFeedback';
import DeadlineReminders from '@/components/applications/DeadlineReminders';
import GranularStatusTracker from '@/components/applications/GranularStatusTracker';

const statusConfig = {
  draft: { color: 'bg-slate-100 text-slate-700', icon: FileText },
  documents_pending: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  under_review: { color: 'bg-blue-100 text-blue-700', icon: Clock },
  submitted_to_university: { color: 'bg-purple-100 text-purple-700', icon: Building2 },
  conditional_offer: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  unconditional_offer: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  visa_processing: { color: 'bg-cyan-100 text-cyan-700', icon: Clock },
  enrolled: { color: 'bg-emerald-500 text-white', icon: GraduationCap },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
  withdrawn: { color: 'bg-slate-100 text-slate-500', icon: XCircle },
};

const statusSteps = [
  'draft',
  'documents_pending',
  'under_review',
  'submitted_to_university',
  'conditional_offer',
  'unconditional_offer',
  'visa_processing',
  'enrolled'
];

export default function MyApplications() {
  const [selectedApp, setSelectedApp] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }, '-created_date'),
    enabled: !!studentProfile?.id,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['my-documents', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const activeApps = applications.filter(a => !['rejected', 'withdrawn'].includes(a.status));
  const completedApps = applications.filter(a => ['enrolled'].includes(a.status));
  const closedApps = applications.filter(a => ['rejected', 'withdrawn'].includes(a.status));

  const getStepIndex = (status) => statusSteps.indexOf(status);

  const ApplicationCard = ({ app }) => {
    const course = courseMap[app.course_id];
    const university = universityMap[app.university_id];
    const config = statusConfig[app.status] || statusConfig.draft;
    const StatusIcon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card 
          className={`border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
            selectedApp?.id === app.id ? 'ring-2 ring-emerald-500' : ''
          }`}
          onClick={() => setSelectedApp(app)}
        >
          <CardContent className="p-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  {university?.logo_url ? (
                    <img src={university.logo_url} alt="" className="w-10 h-10 object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {course?.name || 'Course Name'}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        {university?.name || 'University'} • {university?.country}
                      </p>
                    </div>
                    <Badge className={config.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {app.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-3">
                    {app.intake && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {app.intake}
                      </span>
                    )}
                    {app.tuition_fee && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {app.tuition_fee.toLocaleString()}/year
                      </span>
                    )}
                    {app.applied_date && (
                      <span>Applied: {format(new Date(app.applied_date), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </div>

              {/* Inline Milestone Progress */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  {['documents_submitted', 'application_submitted', 'offer_received', 'visa_approved', 'enrolled'].map((key, i) => {
                    const completed = app.milestones?.[key]?.completed;
                    return (
                      <div key={key} className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          {completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                        </div>
                        {i < 4 && <div className={`flex-1 h-1 mx-1 rounded ${completed ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {Object.values(app.milestones || {}).filter(m => m?.completed).length} of 6 milestones completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-slate-300">Track and manage your university applications</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Applications Yet</h2>
              <p className="text-slate-500 mb-6">
                Start your study abroad journey by finding the perfect course for you.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to={createPageUrl('CourseMatcher')}>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Find Courses
                  </Button>
                </Link>
                <Link to={createPageUrl('Universities')}>
                  <Button variant="outline">
                    Browse Universities
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Applications List */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="active">
                <TabsList className="mb-6">
                  <TabsTrigger value="active">
                    Active ({activeApps.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedApps.length})
                  </TabsTrigger>
                  <TabsTrigger value="closed">
                    Closed ({closedApps.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                  <AnimatePresence>
                    {activeApps.map(app => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                  </AnimatePresence>
                  {activeApps.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No active applications</p>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <AnimatePresence>
                    {completedApps.map(app => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                  </AnimatePresence>
                  {completedApps.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No completed applications</p>
                  )}
                </TabsContent>

                <TabsContent value="closed" className="space-y-4">
                  <AnimatePresence>
                    {closedApps.map(app => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                  </AnimatePresence>
                  {closedApps.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No closed applications</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Application Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Deadline Reminders */}
              <DeadlineReminders applications={applications} />

              {selectedApp ? (
                <>
                  {/* Granular Status Tracker */}
                  <GranularStatusTracker application={selectedApp} />

                  {/* AI Document Feedback */}
                  <AIDocumentFeedback 
                    application={selectedApp}
                    documents={documents.filter(d => d.application_id === selectedApp.id)}
                  />

                  {/* Traditional Milestones */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Application Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MilestoneTracker application={selectedApp} variant="vertical" />

                      {/* Details */}
                      <div className="space-y-4 pt-4 border-t">
                        {selectedApp.offer_deadline && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Offer Deadline</span>
                            <span className="font-medium text-red-600">
                              {format(new Date(selectedApp.offer_deadline), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        {selectedApp.scholarship_amount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Scholarship</span>
                            <span className="font-medium text-emerald-600">
                              ${selectedApp.scholarship_amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 space-y-2">
                        <Link to={createPageUrl('MyDocuments') + `?application=${selectedApp.id}`}>
                          <Button className="w-full" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                            Manage Documents
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <Link to={createPageUrl('Messages')}>
                          <Button variant="outline" className="w-full">
                            Contact Counselor
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      Select an application to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}