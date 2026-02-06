import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, Award, CheckCircle } from 'lucide-react';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import { toast } from 'sonner';
import Footer from '@/components/landing/Footer';

export default function ProvideFeedback() {
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications-feedback', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile.id }),
    enabled: !!studentProfile?.id
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list()
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const submitFeedback = useMutation({
    mutationFn: (data) => base44.entities.Feedback.create({
      ...data,
      student_id: studentProfile.id,
      status: 'pending'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
      toast.success('Thank you for your feedback!');
      setSubmitted(true);
    }
  });

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="container mx-auto px-6 text-center">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please log in to provide feedback</h2>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto text-center border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Thank You!</h2>
              <p className="text-slate-600 mb-8">
                Your feedback helps ALO Education improve our services and better serve students like you.
              </p>
              <Button onClick={() => window.location.href = '/'} className="bg-education-blue">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Share Your Experience</h1>
            <p className="text-lg text-slate-600">
              Help us improve ALO Education services by sharing your feedback
            </p>
          </div>

          <Tabs defaultValue="overall">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto mb-8">
              <TabsTrigger value="overall">Overall Experience</TabsTrigger>
              <TabsTrigger value="counselor">My Counselor</TabsTrigger>
              <TabsTrigger value="university">University/Course</TabsTrigger>
            </TabsList>

            <TabsContent value="overall">
              <FeedbackForm
                feedbackType="overall_experience"
                milestone="general"
                onSubmit={(data) => submitFeedback.mutate(data)}
              />
            </TabsContent>

            <TabsContent value="counselor">
              <FeedbackForm
                feedbackType="counselor"
                relatedId={studentProfile.counselor_id}
                milestone="first_consultation"
                onSubmit={(data) => submitFeedback.mutate(data)}
              />
            </TabsContent>

            <TabsContent value="university">
              {applications.length > 0 ? (
                <div className="space-y-6">
                  {applications.slice(0, 3).map((app) => {
                    const course = courses.find(c => c.id === app.course_id);
                    const university = universities.find(u => u.id === app.university_id);
                    
                    return (
                      <Card key={app.id} className="border-2 border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {university?.university_name} - {course?.course_title}
                          </CardTitle>
                        </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <FeedbackForm
                            feedbackType="university"
                            relatedId={university?.id}
                            milestone={app.status === 'enrolled' ? 'enrollment' : 'application_submitted'}
                            onSubmit={(data) => submitFeedback.mutate({
                              ...data,
                              course_id: course?.id,
                              application_id: app.id
                            })}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No applications yet. Apply to provide course feedback!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}