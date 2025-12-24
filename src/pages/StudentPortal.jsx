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

export default function StudentPortal() {
  const { data: user } = useQuery({
    queryKey: ['portal-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['portal-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['portal-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: documents = [] } = useQuery({
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
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
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

            {/* AI Course Recommendations */}
            <AIRecommendations studentProfile={studentProfile} />

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
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                  </div>
                )}
              </CardContent>
            </Card>

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
    </div>
  );
}