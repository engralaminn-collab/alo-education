<<<<<<< HEAD
import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, FileText, MessageSquare, Calendar, TrendingUp,
  Clock, CheckCircle, AlertCircle, Target, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIPersonalizedGreeting from '@/components/portal/AIPersonalizedGreeting';
import QuickActions from '@/components/portal/QuickActions';
import UpcomingDeadlines from '@/components/portal/UpcomingDeadlines';
import RecentActivity from '@/components/portal/RecentActivity';
import AIRecommendations from '@/components/recommendations/AIRecommendations';
import EnhancedAICourseMatcher from '@/components/recommendations/EnhancedAICourseMatcher';

export default function StudentPortal() {
  const { data: user } = useQuery({
    queryKey: ['portal-user'],
=======
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
  CheckCircle, Clock, Building2, GraduationCap, TrendingUp, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import { ApplicationStatusWidget, UpcomingDeadlinesWidget, AlertsNotificationsWidget, QuickLinksWidget } from '@/components/portal/DashboardWidgets';
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
import ApplicationTrackingSystem from '@/components/student/ApplicationTrackingSystem';
import AddApplicationModal from '@/components/student/AddApplicationModal';
import StudentChatbot from '@/components/portal/StudentChatbot';

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
  const [showAddApplication, setShowAddApplication] = useState(false);
  const [studentId, setStudentId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user-portal'],
>>>>>>> last/main
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
<<<<<<< HEAD
    queryKey: ['portal-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
=======
    queryKey: ['student-profile-portal', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      const profile = profiles[0];
      if (profile) setStudentId(profile.id);
      return profile;
>>>>>>> last/main
    },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
<<<<<<< HEAD
    queryKey: ['portal-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile.id }),
=======
    queryKey: ['student-applications-portal', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
>>>>>>> last/main
    enabled: !!studentProfile?.id,
  });

  const { data: documents = [] } = useQuery({
<<<<<<< HEAD
    queryKey: ['portal-documents', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['portal-tasks', studentProfile?.id],
    queryFn: () => base44.entities.Task.filter({ student_id: studentProfile.id, status: 'pending' }),
    enabled: !!studentProfile?.id,
  });

  const activeApplications = applications.filter(a => 
    !['withdrawn', 'rejected', 'completed'].includes(a.status)
  );

  const pendingDocuments = documents.filter(d => d.status === 'pending');
  const upcomingTasks = tasks.filter(t => {
    if (!t.deadline) return false;
    const deadline = new Date(t.deadline);
    const daysUntil = (deadline - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil >= 0 && daysUntil <= 7;
  });

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
            <p className="text-slate-600 mb-6">
              Please complete your student profile to access your personalized portal
            </p>
            <Link to={createPageUrl('CompleteProfile')}>
              <Button className="w-full" style={{ backgroundColor: '#F37021' }}>
                Complete Profile Now
=======
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
>>>>>>> last/main
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
<<<<<<< HEAD
      <div className="container mx-auto px-6 py-8">
        {/* AI Personalized Greeting */}
        <AIPersonalizedGreeting student={studentProfile} applications={applications} />

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Applications</p>
                  <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                    {activeApplications.length}
                  </p>
                </div>
                <FileText className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Documents</p>
                  <p className="text-3xl font-bold" style={{ color: '#F37021' }}>
                    {pendingDocuments.length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming Tasks</p>
                  <p className="text-3xl font-bold text-green-600">
                    {upcomingTasks.length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Profile Complete</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {studentProfile.profile_completeness || 0}%
                  </p>
                </div>
                <Target className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <QuickActions 
              studentId={studentProfile.id}
              hasApplications={activeApplications.length > 0}
            />

            {/* Enhanced AI Course Matcher */}
            <EnhancedAICourseMatcher 
              studentProfile={studentProfile}
              courses={courses}
              universities={universities}
            />

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Applications</CardTitle>
                  <Link to={createPageUrl('MyApplications')}>
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {activeApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 mb-4">No active applications yet</p>
                    <Link to={createPageUrl('CourseFinder')}>
                      <Button style={{ backgroundColor: '#F37021' }}>
                        Find Courses
=======
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-advisor" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Advisor</span>
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

          {/* AI Advisor Tab */}
          <TabsContent value="ai-advisor" className="space-y-6">
            <Card className="border-2 border-purple-200 min-h-[600px]">
              <StudentChatbot studentId={studentId} compact={false} />
            </Card>
          </TabsContent>

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
            {/* Dashboard Widgets */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ApplicationTracker />
              </div>
              <div className="space-y-4">
                <ApplicationStatusWidget applications={applications} courseMap={courseMap} universityMap={universityMap} />
                <UpcomingDeadlinesWidget applications={applications} courseMap={courseMap} universityMap={universityMap} />
              </div>
            </div>

            {/* Alerts & Quick Links */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AlertsNotificationsWidget applications={applications} studentProfile={studentProfile} />
              </div>
              <QuickLinksWidget />
            </div>

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
            <ApplicationTrackingSystem
              applications={applications}
              universities={universityMap}
              courses={courseMap}
              onAddApplication={() => setShowAddApplication(true)}
            />
            
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
>>>>>>> last/main
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
<<<<<<< HEAD
                    {activeApplications.slice(0, 3).map((app, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              Application #{index + 1}
                            </h4>
                            <p className="text-sm text-slate-600 mb-2">
                              {app.destination_country} • {app.study_level}
                            </p>
                            <Badge style={{ backgroundColor: '#0066CC', color: 'white' }}>
                              {app.status?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <Link to={createPageUrl('MyApplications')}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
=======
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
>>>>>>> last/main
                  </div>
                )}
              </CardContent>
            </Card>
<<<<<<< HEAD

            {/* Recent Activity */}
            <RecentActivity studentId={studentProfile.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <UpcomingDeadlines tasks={tasks} applications={applications} />

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Have questions? Chat with your counselor
                </p>
                <Link to={createPageUrl('Messages')}>
                  <Button className="w-full" variant="outline">
                    Open Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Uploaded</span>
                    <span className="font-semibold">{documents.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Pending Review</span>
                    <span className="font-semibold text-orange-600">{pendingDocuments.length}</span>
                  </div>
                  <Link to={createPageUrl('MyDocuments')}>
                    <Button className="w-full mt-2" style={{ backgroundColor: '#F37021' }}>
                      Manage Documents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            {studentProfile.profile_completeness < 100 && (
              <Card className="border-2" style={{ borderColor: '#F37021' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" style={{ color: '#F37021' }} />
                    Complete Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Complete your profile to get better course recommendations
                  </p>
                  <Link to={createPageUrl('MyProfile')}>
                    <Button className="w-full" style={{ backgroundColor: '#0066CC' }}>
                      Update Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
=======
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
      
      <AddApplicationModal
        open={showAddApplication}
        onClose={() => setShowAddApplication(false)}
        studentId={studentProfile?.id}
      />

      {/* Floating AI Chatbot */}
      <StudentChatbot studentId={studentId} compact={true} />
>>>>>>> last/main
    </div>
  );
}