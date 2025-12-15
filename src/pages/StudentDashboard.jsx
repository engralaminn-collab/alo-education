import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, FileText, MessageSquare, User, 
  Clock, CheckCircle, AlertCircle, ArrowRight,
  Calendar, Upload, Building2, Award, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import AIRecommendations from '@/components/recommendations/AIRecommendations';
import MyJourney from '@/components/dashboard/MyJourney';
import ResourcesHub from '@/components/dashboard/ResourcesHub';
import SavedComparisons from '@/components/dashboard/SavedComparisons';
import AppointmentScheduler from '@/components/dashboard/AppointmentScheduler';
import ApplicationProgressTracker from '@/components/dashboard/ApplicationProgressTracker';
import AIFAQHelper from '@/components/dashboard/AIFAQHelper';
import EligibilityChecker from '@/components/dashboard/EligibilityChecker';
import PersonalizedQuickLinks from '@/components/dashboard/PersonalizedQuickLinks';
import DeadlinesTracker from '@/components/dashboard/DeadlinesTracker';

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

export default function StudentDashboard() {
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

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['my-documents', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['my-tasks', studentProfile?.id],
    queryFn: () => base44.entities.Task.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships-list'],
    queryFn: () => base44.entities.Scholarship.filter({ status: 'active' }),
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const courseMap = courses.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

  const profileCompleteness = studentProfile?.profile_completeness || 0;

  const pendingDocs = documents.filter(d => d.status === 'pending').length;
  const approvedDocs = documents.filter(d => d.status === 'approved').length;

  const activeApplications = applications.filter(a => 
    !['rejected', 'withdrawn', 'enrolled'].includes(a.status)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="text-slate-300">
                Track your applications and manage your study abroad journey
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <Link to={createPageUrl('CourseMatcher')}>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Find Courses
                </Button>
              </Link>
              <Link to={createPageUrl('MyProfile')}>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              icon: FileText, 
              label: 'Applications', 
              value: applications.length,
              color: 'bg-blue-500',
              link: 'MyApplications'
            },
            { 
              icon: Clock, 
              label: 'Pending', 
              value: activeApplications.length,
              color: 'bg-amber-500',
              link: 'MyApplications'
            },
            { 
              icon: Upload, 
              label: 'Documents', 
              value: `${approvedDocs}/${documents.length}`,
              color: 'bg-emerald-500',
              link: 'MyDocuments'
            },
            { 
              icon: MessageSquare, 
              label: 'Messages', 
              value: '0 New',
              color: 'bg-purple-500',
              link: 'Messages'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(stat.link)}>
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Journey */}
            <MyJourney 
              studentProfile={studentProfile}
              applications={applications}
              documents={documents}
              tasks={tasks}
            />

            {/* Application Progress Tracker */}
            <ApplicationProgressTracker 
              applications={applications}
              universities={universities}
              courses={courses}
              studentProfile={studentProfile}
            />

            {/* Eligibility Checker */}
            <EligibilityChecker 
              studentProfile={studentProfile}
              courses={courses}
              universities={universities}
            />

            {/* AI Recommendations */}
            <AIRecommendations 
              studentProfile={studentProfile}
              courses={courses}
              universities={universities}
              applications={applications}
            />

            {/* Resources Hub */}
            <ResourcesHub studentProfile={studentProfile} />

            {/* Profile Completeness */}
            {profileCompleteness < 100 && (
              <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">Complete Your Profile</h3>
                      <p className="text-slate-500 text-sm">Help us match you with the best courses</p>
                    </div>
                    <span className="text-2xl font-bold text-amber-500">{profileCompleteness}%</span>
                  </div>
                  <Progress value={profileCompleteness} className="h-2 mb-4" />
                  <Link to={createPageUrl('MyProfile')}>
                    <Button variant="outline" size="sm">
                      Complete Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Recent Applications */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Applications</CardTitle>
                <Link to={createPageUrl('MyApplications')}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-10">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-1">No applications yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Start exploring courses and universities</p>
                    <Link to={createPageUrl('CourseMatcher')}>
                      <Button>Find Courses</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app) => {
                      const course = courseMap[app.course_id];
                      const university = universityMap[app.university_id];
                      return (
                        <div key={app.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                          <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate">
                              {course?.name || 'Course'}
                            </h4>
                            <p className="text-slate-500 text-sm truncate">
                              {university?.name || 'University'}
                            </p>
                          </div>
                          <Badge className={statusColors[app.status]}>
                            {app.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Documents */}
            {pendingDocs > 0 && (
              <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Documents Pending Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    You have {pendingDocs} document(s) awaiting verification.
                  </p>
                  <Link to={createPageUrl('MyDocuments')}>
                    <Button variant="outline">
                      View Documents
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deadlines Tracker */}
            <DeadlinesTracker 
              applications={applications}
              tasks={tasks}
              scholarships={scholarships}
            />

            {/* Personalized Quick Links */}
            <PersonalizedQuickLinks studentProfile={studentProfile} />

            {/* Appointment Scheduler */}
            <AppointmentScheduler studentProfile={studentProfile} />

            {/* AI FAQ Helper */}
            <AIFAQHelper studentProfile={studentProfile} />

            {/* Saved Comparisons */}
            <SavedComparisons studentProfile={studentProfile} />

            {/* Counselor Card */}
            {studentProfile?.counselor_id && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Your Counselor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                      C
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Counselor Name</h4>
                      <p className="text-slate-500 text-sm">Education Specialist</p>
                    </div>
                  </div>
                  <Link to={createPageUrl('Messages')}>
                    <Button className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* AI Counselor CTA */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">AI College Counselor</h3>
                <p className="text-white/90 text-sm mb-4">
                  Get personalized recommendations, essay help, and expert guidance powered by AI
                </p>
                <Link to={createPageUrl('AICounselor')}>
                  <Button className="w-full bg-white text-blue-600 hover:bg-slate-100">
                    Start Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl('MyDocuments')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </Link>
                <Link to={createPageUrl('CourseMatcher')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Course Matcher
                  </Button>
                </Link>
                <Link to={createPageUrl('Scholarships')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Find Scholarships
                  </Button>
                </Link>
                <Link to={createPageUrl('AlumniNetwork')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Alumni Network
                  </Button>
                </Link>
                <Link to={createPageUrl('Contact')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Consultation
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-white/80 mb-4 text-sm">
                  Our team is here to guide you through every step of your journey.
                </p>
                <Link to={createPageUrl('Contact')}>
                  <Button className="w-full bg-white text-emerald-600 hover:bg-slate-100">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}