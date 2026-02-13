import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Send, AlertTriangle, Mail, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';
import UniversityOutreachGenerator from '@/components/crm/UniversityOutreachGenerator';
import OutreachResponseTracker from '@/components/crm/OutreachResponseTracker';
import AIUniversitySuggester from '@/components/crm/AIUniversitySuggester';
import AutoFollowUpScheduler from '@/components/crm/AutoFollowUpScheduler';

export default function CRMUniversityOutreach() {
  const queryClient = useQueryClient();
  const [selectedOutreach, setSelectedOutreach] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showSuggester, setShowSuggester] = useState(false);

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
      const student = students.find(s => s.id === outreach.student_id);
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
      queryClient.invalidateQueries(['university-outreaches']);
      toast.success('Email sent successfully!');
    },
    onError: (error) => {
      toast.error('Failed to send email: ' + error.message);
    }
  });

  const createOutreachFromSuggestion = useMutation({
    mutationFn: async ({ student, university, suggestion }) => {
      const prompt = `Draft a professional inquiry email to ${university.university_name} for student ${student.first_name} ${student.last_name}.

Based on AI analysis, this university is a ${suggestion.match_score}/100 match because:
${suggestion.reasons.join(', ')}

Recommended courses to inquire about:
${suggestion.recommended_courses.join(', ')}

Create a personalized email that:
1. Expresses interest in the recommended courses
2. Highlights student's qualifications
3. Asks about application requirements and deadlines
4. Inquires about scholarships
5. References why this university is a good fit

Return JSON with subject and body.`;

      const emailContent = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            body: { type: 'string' }
          }
        }
      });

      await base44.entities.UniversityOutreach.create({
        student_id: student.id,
        university_id: university.id,
        outreach_type: 'course_inquiry',
        email_subject: emailContent.subject,
        email_body: emailContent.body,
        status: 'draft',
        automated: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['university-outreaches']);
      setShowSuggester(false);
      toast.success('Outreach created from AI suggestion!');
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
    <CRMLayout currentPage="University Outreach">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI University Outreach</h1>
          <p className="text-slate-600">Automated communication with universities</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Outreaches</p>
                  <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
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
                  <p className="text-3xl font-bold" style={{ color: '#F37021' }}>
                    {pending.length}
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

        {/* AI University Suggester Dialog */}
        {showSuggester && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  AI University Suggestions for {selectedStudent.first_name} {selectedStudent.last_name}
                </h2>
                <Button variant="ghost" onClick={() => setShowSuggester(false)}>×</Button>
              </div>
              <div className="p-6">
                <AIUniversitySuggester
                  student={selectedStudent}
                  universities={universities}
                  courses={courses}
                  onSelect={(university, suggestion) => {
                    createOutreachFromSuggestion.mutate({
                      student: selectedStudent,
                      university,
                      suggestion
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Outreaches</TabsTrigger>
                <TabsTrigger value="urgent">Urgent ({urgent.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending Response</TabsTrigger>
                <TabsTrigger value="responded">Responded</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
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
                              <h4 className="font-semibold text-slate-900">
                                {university?.university_name}
                              </h4>
                              {outreach.is_urgent && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-1">
                              Student: {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              Course: {course?.course_title || 'General Inquiry'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(outreach.status)}>
                            {outreach.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{new Date(outreach.created_date).toLocaleDateString()}</span>
                          {outreach.status === 'draft' && (
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                sendEmail.mutate(outreach);
                              }}
                              style={{ backgroundColor: '#F37021' }}
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

              <TabsContent value="urgent">
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
                              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 mb-1">
                                  {university?.university_name}
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

              <TabsContent value="pending">
                <div className="space-y-4">
                  {pending.map(outreach => {
                    const student = students.find(s => s.id === outreach.student_id);
                    const university = universities.find(u => u.id === outreach.university_id);
                    const daysSince = Math.floor((Date.now() - new Date(outreach.sent_date).getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <Card key={outreach.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">
                                {university?.university_name}
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

              <TabsContent value="responded">
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

            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">
                  Select a student to get AI-powered university suggestions
                </p>
                <select
                  onChange={(e) => {
                    const student = students.find(s => s.id === e.target.value);
                    if (student) {
                      setSelectedStudent(student);
                      setShowSuggester(true);
                    }
                  }}
                  className="w-full p-2 border rounded mb-3"
                  defaultValue=""
                >
                  <option value="">Choose student...</option>
                  {students
                    .filter(s => (s.profile_completeness || 0) >= 50)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name}
                      </option>
                    ))}
                </select>
              </CardContent>
            </Card>

            <AutoFollowUpScheduler />
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}