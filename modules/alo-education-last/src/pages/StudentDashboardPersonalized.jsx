import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, TrendingUp, MapPin, DollarSign, Clock, BookOpen, 
  Heart, MessageCircle, CheckCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import ALOButton from '@/components/ui/alo-button';

export default function StudentDashboardPersonalized() {
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

  const { data: recommendations = [] } = useQuery({
    queryKey: ['student-recommendations', studentProfile?.id],
    queryFn: async () => {
      if (!studentProfile?.id) return [];
      const recs = await base44.entities.StudentRecommendation.filter({
        student_id: studentProfile.id,
        is_active: true
      });
      return recs.sort((a, b) => b.match_score - a.match_score);
    },
    enabled: !!studentProfile?.id,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications', studentProfile?.id],
    queryFn: async () => {
      if (!studentProfile?.id) return [];
      return base44.entities.Application.filter({ student_id: studentProfile.id });
    },
    enabled: !!studentProfile?.id,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-recs'],
    queryFn: async () => {
      const allUniversities = await base44.entities.University.list();
      const recUniversityIds = recommendations.map(r => r.university_id);
      return allUniversities.filter(u => recUniversityIds.includes(u.id));
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-recs'],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.list();
      const recCourseIds = recommendations.map(r => r.course_id);
      return allCourses.filter(c => recCourseIds.includes(c.id));
    },
  });

  const milestones = [
    { name: 'Profile Completion', completed: studentProfile?.profile_completeness > 50, icon: CheckCircle },
    { name: 'English Test', completed: studentProfile?.english_proficiency?.has_test, icon: BookOpen },
    { name: 'Applications Submitted', completed: applications.length > 0, icon: CheckCircle },
    { name: 'Offers Received', completed: applications.some(a => a.status?.includes('offer')), icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {studentProfile?.first_name}! 👋
          </h1>
          <p className="text-slate-600">
            Here are personalized course recommendations based on your profile and preferences
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="bg-white shadow-sm p-1">
            <TabsTrigger value="recommendations" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            {recommendations.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Recommendations Yet</h3>
                  <p className="text-slate-600 mb-6">
                    Complete your profile to get personalized recommendations
                  </p>
                  <ALOButton>Complete Your Profile</ALOButton>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {recommendations.map(rec => {
                  const university = universities.find(u => u.id === rec.university_id);
                  const course = courses.find(c => c.id === rec.course_id);
                  
                  return (
                    <Card key={rec.id} className="border-0 shadow-sm hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Badge className="mb-2 bg-alo-orange text-white">
                              {rec.match_score}% Match
                            </Badge>
                            <h3 className="text-xl font-bold text-slate-900">{course?.course_title}</h3>
                            <p className="text-slate-600 text-sm mt-1">{university?.university_name}</p>
                          </div>
                          {rec.status !== 'applied' && (
                            <Heart className="w-6 h-6 text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                          )}
                        </div>

                        {/* Match Reasons */}
                        {rec.match_reasons?.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Why This Match</p>
                            <div className="flex flex-wrap gap-2">
                              {rec.match_reasons.map((reason, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Course Details */}
                        <div className="space-y-2 text-sm mb-6 pb-6 border-b">
                          {course?.tuition_fee_min && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <DollarSign className="w-4 h-4" />
                              <span>${course.tuition_fee_min} - ${course.tuition_fee_max} {course.currency}</span>
                            </div>
                          )}
                          {course?.duration && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-4 h-4" />
                              <span>{course.duration}</span>
                            </div>
                          )}
                          {university?.country && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="w-4 h-4" />
                              <span>{university.country}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <ALOButton className="flex-1">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </ALOButton>
                          {!applications.find(a => a.course_id === course?.id) && (
                            <Button variant="outline" className="flex-1">
                              Apply Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="space-y-6">
              {/* Profile Completeness */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Profile Completeness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{studentProfile?.profile_completeness || 0}%</span>
                    </div>
                    <Progress value={studentProfile?.profile_completeness || 0} className="h-3" />
                  </div>
                  <p className="text-sm text-slate-600">
                    Complete all sections to unlock better course recommendations and improve your chances
                  </p>
                </CardContent>
              </Card>

              {/* Application Milestones */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Application Journey</CardTitle>
                  <CardDescription>Track your progress through key milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-lg ${
                        milestone.completed 
                          ? 'bg-green-100' 
                          : 'bg-slate-100'
                      }`}>
                        <milestone.icon className={`w-5 h-5 ${
                          milestone.completed 
                            ? 'text-green-600' 
                            : 'text-slate-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          milestone.completed 
                            ? 'text-slate-900' 
                            : 'text-slate-500'
                        }`}>
                          {milestone.name}
                        </p>
                        {milestone.completed && (
                          <p className="text-xs text-green-600">✓ Completed</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Applications Overview */}
              {applications.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {applications.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">Application #{app.id.slice(0, 8)}</p>
                            <p className="text-sm text-slate-500">{app.status?.replace(/_/g, ' ')}</p>
                          </div>
                          <Badge variant={app.status?.includes('offer') ? 'default' : 'outline'}>
                            {app.status?.includes('offer') ? '✓' : '○'} {app.status?.slice(0, 10)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Messaging Coming Soon</h3>
                <p className="text-slate-600">
                  Connect directly with your counselor to discuss your applications
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}