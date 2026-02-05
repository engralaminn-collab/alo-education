import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  LayoutDashboard, FileText, Upload, MessageSquare, 
  User, Award, Brain, Calendar, Shield, MessageCircle,
  CheckCircle, Clock, Building2, GraduationCap, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import AIInsights from '@/components/dashboard/AIInsights';
import DocumentStatus from '@/components/dashboard/DocumentStatus';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import ScholarshipRecommendations from '@/components/dashboard/ScholarshipRecommendations';
import CommunicationHistory from '@/components/dashboard/CommunicationHistory';
import StudentTasks from '@/components/dashboard/StudentTasks';
import CommentSystem from '@/components/portal/CommentSystem';
import WhatsAppEscalation from '@/components/portal/WhatsAppEscalation';
import QuickDocumentUpload from '@/components/dashboard/QuickDocumentUpload';
import RealTimeChat from '@/components/portal/RealTimeChat';
import ApplicationTimeline from '@/components/applications/ApplicationTimeline';
import ApplicationProgressBar from '@/components/applications/ApplicationProgressBar';
import ApplicationTracker from '@/components/portal/ApplicationTracker';
import AINextSteps from '@/components/dashboard/AINextSteps';
import MyJourney from '@/components/dashboard/MyJourney';

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

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['current-user-portal'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-portal', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications-portal', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['student-documents-portal', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-portal'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-portal'],
    queryFn: () => base44.entities.Course.list(),
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  const pendingDocs = documents.filter(d => d.status === 'pending').length;
  const profileCompleteness = studentProfile?.profile_completeness || 0;

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
            <p className="text-slate-600 mb-6">
              Create your student profile to access the portal
            </p>
            <Link to={createPageUrl('MyProfile')}>
              <Button className="bg-education-blue hover:bg-education-blue/90">
                Create Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-brand py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Student Portal
              </h1>
              <p className="text-white/90">
                Welcome, {studentProfile.first_name}! Track your journey here.
              </p>
            </div>
            <Link to={createPageUrl('MyProfile')}>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Comments</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Scholarships</span>
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <RealTimeChat 
                studentId={studentProfile.id}
                counselorId={studentProfile.counselor_id}
              />
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Application Tracker */}
            <ApplicationTracker />
            
            <AINextSteps />
            <MyJourney />
            
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-education-blue/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-education-blue" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Applications</p>
                      <p className="text-xl font-bold text-slate-900">{applications.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Approved Docs</p>
                      <p className="text-xl font-bold text-slate-900">{approvedDocs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sunshine/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-sunshine" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Pending Docs</p>
                      <p className="text-xl font-bold text-slate-900">{pendingDocs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-education-blue/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-education-blue" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Profile</p>
                      <p className="text-xl font-bold text-slate-900">{profileCompleteness}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Action Items */}
                <StudentTasks studentId={studentProfile.id} />

                {/* Applications Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applications.length === 0 ? (
                      <div className="text-center py-8">
                        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 mb-4">No applications yet</p>
                        <Link to={createPageUrl('CourseMatcher')}>
                          <Button>Find Courses</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {applications.map(app => {
                          const course = courseMap[app.course_id];
                          const university = universityMap[app.university_id];
                          
                          return (
                            <div key={app.id} className="p-4 bg-slate-50 rounded-lg space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900">{course?.course_title}</h4>
                                  <p className="text-sm text-slate-600">{university?.university_name}</p>
                                  {app.offer_deadline && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      Deadline: {format(new Date(app.offer_deadline), 'MMM d, yyyy')}
                                    </div>
                                  )}
                                </div>
                                <Badge className={statusColors[app.status]}>
                                  {app.status?.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <ApplicationTimeline application={app} compact={true} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <AIInsights studentId={studentProfile.id} />
                <UpcomingDeadlines studentId={studentProfile.id} />
                <ScholarshipRecommendations />
              </div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">Start Your Journey</h3>
                    <p className="text-slate-500 mb-6">Find and apply to your dream courses</p>
                    <Link to={createPageUrl('CourseMatcher')}>
                      <Button className="bg-education-blue hover:bg-education-blue/90">
                        Explore Courses
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map(app => {
                      const course = courseMap[app.course_id];
                      const university = universityMap[app.university_id];
                      
                      return (
                        <Card key={app.id} className="border-0 shadow-sm">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                  <Building2 className="w-8 h-8 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                                        {course?.course_title}
                                      </h3>
                                      <p className="text-slate-600">{university?.university_name}</p>
                                      <p className="text-sm text-slate-500 mt-1">
                                        {university?.country} • {course?.level}
                                      </p>
                                    </div>
                                    <Badge className={statusColors[app.status]}>
                                      {app.status?.replace(/_/g, ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <ApplicationProgressBar application={app} showLabels={true} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuickDocumentUpload 
                  studentProfile={studentProfile}
                  onSuccess={() => {
                    // Refresh documents
                  }}
                />
              </div>
              <div>
                <DocumentStatus studentId={studentProfile.id} />
              </div>
            </div>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{doc.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <Badge className={
                        doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                        doc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-center py-8 text-slate-500">No documents uploaded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {applications.map(app => {
                const course = courseMap[app.course_id];
                const university = universityMap[app.university_id];
                
                return (
                  <div key={app.id}>
                    <h3 className="font-semibold text-slate-900 mb-3">
                      {course?.course_title} - {university?.university_name}
                    </h3>
                    <CommentSystem
                      studentId={studentProfile.id}
                      applicationId={app.id}
                      userRole="student"
                    />
                  </div>
                );
              })}

              {applications.length === 0 && (
                <Card className="lg:col-span-2">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Apply to courses to start conversations</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* General Comments (not tied to application) */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">General Messages</h3>
              <CommentSystem
                studentId={studentProfile.id}
                applicationId={null}
                userRole="student"
              />
            </div>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-6">
            <WhatsAppEscalation 
              studentId={studentProfile.id}
              counselorId={studentProfile.counselor_id}
            />
            
            <CommunicationHistory studentId={studentProfile.id} />
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <ScholarshipRecommendations />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}