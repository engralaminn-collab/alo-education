import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Send, AlertTriangle, Mail, Clock, CheckCircle, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';
import UniversityOutreachGenerator from '@/components/crm/UniversityOutreachGenerator';
import OutreachResponseTracker from '@/components/crm/OutreachResponseTracker';

export default function CRMUniversityOutreach() {
  const queryClient = useQueryClient();
  const [selectedOutreach, setSelectedOutreach] = useState(null);

  const { data: outreaches = [] } = useQuery({
    queryKey: ['university-outreaches'],
    queryFn: () => base44.entities.UniversityOutreach.list('-created_date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['outreach-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['outreach-universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['outreach-courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const pending = outreaches.filter(o => o.status === 'sent' && !o.response_received);
  const urgent = outreaches.filter(o => o.is_urgent && !o.response_received);
  const responded = outreaches.filter(o => o.response_received);

  const sendEmail = useMutation({
    mutationFn: async (outreach) => {
      const university = universities.find(u => u.id === outreach.university_id);
      
      if (!university?.website_url) {
        throw new Error('University contact email not available');
      }

      await base44.integrations.Core.SendEmail({
        to: 'admissions@' + new URL(university.website_url).hostname,
        subject: outreach.email_subject,
        body: outreach.email_body
      });

      await base44.entities.UniversityOutreach.update(outreach.id, {
        status: 'sent',
        sent_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
      toast.success('Email sent successfully!');
    },
    onError: (error) => {
      toast.error('Failed to send email: ' + error.message);
    }
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'responded': return 'bg-green-100 text-green-700';
      case 'follow_up_needed': return 'bg-orange-100 text-orange-700';
      case 'closed': return 'bg-slate-200 text-slate-600';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <CRMLayout title="AI University Outreach">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Outreaches</p>
                <p className="text-3xl font-bold text-blue-600">
                  {outreaches.length}
                </p>
              </div>
              <Mail className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Response</p>
                <p className="text-3xl font-bold text-amber-600">
                  {pending.length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Urgent</p>
                <p className="text-3xl font-bold text-red-600">
                  {urgent.length}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Responded</p>
                <p className="text-3xl font-bold text-green-600">
                  {responded.length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Outreaches</TabsTrigger>
              <TabsTrigger value="urgent">Urgent ({urgent.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending Response</TabsTrigger>
              <TabsTrigger value="responded">Responded</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {outreaches.map(outreach => {
                const student = students.find(s => s.id === outreach.student_id);
                const university = universities.find(u => u.id === outreach.university_id);
                const course = courses.find(c => c.id === outreach.course_id);

                return (
                  <Card key={outreach.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOutreach(outreach)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <h4 className="font-semibold text-slate-900">
                              {university?.university_name || university?.name}
                            </h4>
                            {outreach.is_urgent && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                            <User className="w-3 h-3" />
                            <span>Student: {student?.first_name} {student?.last_name}</span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Course: {course?.course_title || 'General Inquiry'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(outreach.status)}>
                          {outreach.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {outreach.created_date && format(new Date(outreach.created_date), 'MMM d, yyyy')}
                        </span>
                        {outreach.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              sendEmail.mutate(outreach);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="urgent" className="mt-6">
              {urgent.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No urgent outreaches</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {urgent.map(outreach => {
                    const student = students.find(s => s.id === outreach.student_id);
                    const university = universities.find(u => u.id === outreach.university_id);

                    return (
                      <Card key={outreach.id} className="border-2 border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">
                                {university?.university_name || university?.name}
                              </h4>
                              <p className="text-sm text-red-600 mb-2">{outreach.urgency_reason}</p>
                              <p className="text-xs text-slate-600">
                                Student: {student?.first_name} {student?.last_name}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {pending.map(outreach => {
                  const student = students.find(s => s.id === outreach.student_id);
                  const university = universities.find(u => u.id === outreach.university_id);
                  const daysSince = outreach.sent_date ? Math.floor((Date.now() - new Date(outreach.sent_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                  return (
                    <Card key={outreach.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {university?.university_name || university?.name}
                            </h4>
                            <p className="text-sm text-slate-600 mb-2">
                              Student: {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Sent {daysSince} days ago
                            </p>
                          </div>
                          {daysSince > 7 && (
                            <Badge className="bg-orange-100 text-orange-700">
                              Follow-up needed
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="responded" className="mt-6">
              <OutreachResponseTracker 
                outreaches={responded}
                students={students}
                universities={universities}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <UniversityOutreachGenerator 
            students={students}
            universities={universities}
            courses={courses}
          />

          {students.length > 0 && (
            <AIStudentMatcher student={students[0]} />
          )}
        </div>
      </div>
    </CRMLayout>
  );
}