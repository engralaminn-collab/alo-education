import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  GraduationCap, Calendar, FileText, Sparkles, 
  Upload, CheckCircle, Clock, AlertCircle, TrendingUp 
} from 'lucide-react';
import StudentChatbot from '@/components/chat/StudentChatbot';
import AIDocumentReview from '@/components/documents/AIDocumentReview';

export default function StudentPortal() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: student } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const students = await base44.entities.StudentProfile.filter({ email: user.email });
      return students[0];
    },
    enabled: !!user
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications', student?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: student.id }),
    enabled: !!student?.id
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['my-appointments', student?.id],
    queryFn: () => base44.entities.Appointment.filter({ student_id: student.id }),
    enabled: !!student?.id
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['my-documents', student?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: student.id }),
    enabled: !!student?.id
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['my-recommendations', student?.id],
    queryFn: () => base44.entities.CourseRecommendation.filter({ student_id: student.id }),
    enabled: !!student?.id
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    documents_pending: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    submitted_to_university: 'bg-purple-100 text-purple-800',
    conditional_offer: 'bg-orange-100 text-orange-800',
    unconditional_offer: 'bg-green-100 text-green-800',
    enrolled: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const upcomingAppointments = appointments
    .filter(a => new Date(a.scheduled_date) > new Date())
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome, {student?.first_name}! 🎓
              </h1>
              <p className="text-slate-600 mt-1">Track your study abroad journey</p>
            </div>
            <Badge className="bg-blue-600 text-lg px-4 py-2">
              {applications.length} Applications
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-white shadow-sm mb-6">
            <TabsTrigger value="overview">
              <GraduationCap className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="applications">
              <FileText className="w-4 h-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="documents">
              <Upload className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-3xl font-bold">{applications.length}</p>
                    <p className="text-sm text-slate-600">Applications</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                    <p className="text-sm text-slate-600">Upcoming Meetings</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-3xl font-bold">{documents.length}</p>
                    <p className="text-sm text-slate-600">Documents</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                    <p className="text-3xl font-bold">{student?.profile_completeness || 0}%</p>
                    <p className="text-sm text-slate-600">Profile Complete</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Application Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Application Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map(app => (
                      <div key={app.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold">{app.course_id}</h3>
                            <p className="text-sm text-slate-600">{app.university_id}</p>
                          </div>
                          <Badge className={statusColors[app.status]}>
                            {app.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <Progress value={
                          app.status === 'enrolled' ? 100 :
                          app.status === 'unconditional_offer' ? 90 :
                          app.status === 'conditional_offer' ? 75 :
                          app.status === 'submitted_to_university' ? 60 :
                          app.status === 'under_review' ? 40 :
                          app.status === 'documents_pending' ? 20 : 10
                        } className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-8">No applications yet</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map(apt => (
                      <div key={apt.id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-semibold">{apt.appointment_type}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(apt.scheduled_date).toLocaleString()}
                          </p>
                        </div>
                        {apt.meeting_link && (
                          <Button size="sm" asChild>
                            <a href={apt.meeting_link} target="_blank">Join</a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-8">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map(app => (
                      <Card key={app.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{app.course_id}</h3>
                              <p className="text-slate-600">{app.university_id}</p>
                            </div>
                            <Badge className={statusColors[app.status]}>
                              {app.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          
                          {/* Milestones */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              {app.milestones?.documents_submitted?.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span>Documents Submitted</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {app.milestones?.application_submitted?.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span>Application Submitted</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {app.milestones?.offer_received?.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span>Offer Received</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600">No applications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map(apt => (
                      <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Calendar className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-semibold">{apt.appointment_type}</p>
                            <p className="text-sm text-slate-600">
                              {new Date(apt.scheduled_date).toLocaleString()}
                            </p>
                            <Badge variant="outline" className="mt-1">{apt.status}</Badge>
                          </div>
                        </div>
                        {apt.meeting_link && apt.status === 'scheduled' && (
                          <Button asChild>
                            <a href={apt.meeting_link} target="_blank">Join Meeting</a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-8">No appointments scheduled</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="space-y-4">
              {documents.length > 0 ? (
                documents.map(doc => (
                  <AIDocumentReview key={doc.id} document={doc} />
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Upload className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600">No documents uploaded yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI-Powered Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map(rec => (
                      <Card key={rec.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold">{rec.course_id}</h3>
                              <p className="text-sm text-slate-600">{rec.university_id}</p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800">
                              {rec.match_score}% Match
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {rec.rationale?.map((reason, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600">No recommendations yet</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Complete your profile to get personalized recommendations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chatbot */}
      {student?.id && <StudentChatbot studentId={student.id} context="profile" />}
    </div>
  );
}