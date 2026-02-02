import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Mail, CheckCircle, AlertTriangle, Users, 
  Loader2, TrendingUp, Clock, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

export default function StudentOnboardingWorkflow() {
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['onboarding-students'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 100),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-onboarding'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['onboarding-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 200),
  });

  const onboardNewStudents = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      const threeDaysAgo = subDays(new Date(), 3);
      const newStudents = students.filter(s => {
        const createdDate = new Date(s.created_date);
        return createdDate >= threeDaysAgo && s.status === 'new_lead';
      });

      let emailsSent = 0;
      let tasksCreated = 0;

      for (const student of newStudents) {
        // Generate personalized welcome email with AI
        const emailPrompt = `Create a warm, personalized welcome email for a new student:
Student: ${student.first_name} ${student.last_name}
Interests: ${student.preferred_countries?.join(', ') || 'International study'}
Degree Level: ${student.preferred_degree_level || 'Not specified'}
Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}

Include:
1. Warm welcome to ALO Education
2. Brief overview of our services
3. Next steps they should take
4. Encourage them to complete their profile
5. Offer to schedule a consultation

Keep it friendly, concise, and actionable. Sign off as "The ALO Education Team"`;

        const emailContent = await base44.integrations.Core.InvokeLLM({
          prompt: emailPrompt
        });

        await base44.integrations.Core.SendEmail({
          to: student.email,
          subject: `Welcome to ALO Education, ${student.first_name}! 🎓`,
          body: emailContent,
          from_name: 'ALO Education'
        });
        emailsSent++;

        // Generate next steps with AI
        const stepsPrompt = `Based on this student profile, what are the top 3-5 specific action items they should complete?
Profile completeness: ${student.profile_completeness || 0}%
Has passport: ${student.has_passport || false}
Has English test: ${student.english_proficiency?.test_type || 'No'}
Preferred countries: ${student.preferred_countries?.join(', ') || 'Not specified'}

Return JSON with array of tasks with title and description.`;

        const nextSteps = await base44.integrations.Core.InvokeLLM({
          prompt: stepsPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string" }
                  }
                }
              }
            }
          }
        });

        // Create tasks
        for (const taskData of nextSteps.tasks || []) {
          await base44.entities.Task.create({
            title: taskData.title,
            description: taskData.description,
            student_id: student.id,
            assigned_to: student.counselor_id || counselors[0]?.id,
            status: 'pending',
            priority: taskData.priority || 'medium',
            type: 'other',
            due_date: format(new Date(), 'yyyy-MM-dd')
          });
          tasksCreated++;
        }

        // Update student status
        await base44.entities.StudentProfile.update(student.id, {
          status: 'contacted',
          notes: `Onboarding email sent on ${format(new Date(), 'PPP')}. AI-generated tasks created.`
        });
      }

      return { emailsSent, tasksCreated, studentsProcessed: newStudents.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-students'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] });
      toast.success(`Onboarded ${data.studentsProcessed} students! Sent ${data.emailsSent} emails, created ${data.tasksCreated} tasks.`);
      setProcessing(false);
    },
    onError: () => {
      toast.error('Onboarding failed');
      setProcessing(false);
    }
  });

  // Calculate onboarding metrics
  const getOnboardingProgress = (student) => {
    let progress = 0;
    if (student.phone) progress += 15;
    if (student.nationality) progress += 10;
    if (student.preferred_countries?.length > 0) progress += 20;
    if (student.preferred_degree_level) progress += 15;
    if (student.preferred_fields?.length > 0) progress += 15;
    if (student.education?.highest_degree) progress += 15;
    if (student.english_proficiency?.test_type) progress += 10;
    return Math.min(progress, 100);
  };

  const recentStudents = students.filter(s => {
    const created = new Date(s.created_date);
    return created >= subDays(new Date(), 7);
  });

  const needsSupportStudents = students.filter(s => {
    const progress = getOnboardingProgress(s);
    const daysSinceCreation = Math.floor((Date.now() - new Date(s.created_date).getTime()) / (1000 * 60 * 60 * 24));
    return progress < 30 && daysSinceCreation >= 3 && s.status !== 'enrolled' && s.status !== 'lost';
  });

  const onboardedStudents = students.filter(s => getOnboardingProgress(s) >= 70);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            AI Student Onboarding Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-slate-900">Automated Onboarding</h4>
                <p className="text-sm text-slate-600">
                  Send personalized welcome emails and create AI-generated tasks for new students
                </p>
              </div>
              <Button 
                onClick={() => onboardNewStudents.mutate()}
                disabled={processing}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Onboarding
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Users className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-900">{recentStudents.length}</p>
                <p className="text-xs text-blue-700">New This Week</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
                <p className="text-2xl font-bold text-amber-900">{needsSupportStudents.length}</p>
                <p className="text-xs text-amber-700">Need Support</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-900">{onboardedStudents.length}</p>
                <p className="text-xs text-green-700">Fully Onboarded</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="progress">
        <TabsList className="w-full">
          <TabsTrigger value="progress" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            Onboarding Progress
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex-1">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Needs Support ({needsSupportStudents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-3 mt-4">
          {recentStudents.slice(0, 10).map((student) => {
            const progress = getOnboardingProgress(student);
            const daysSinceJoined = Math.floor((Date.now() - new Date(student.created_date).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {student.first_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Joined {daysSinceJoined} day{daysSinceJoined !== 1 ? 's' : ''} ago
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      progress >= 70 ? 'bg-green-600' :
                      progress >= 40 ? 'bg-amber-600' :
                      'bg-red-600'
                    }>
                      {progress}% Complete
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Status: {student.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3 mt-4">
          {needsSupportStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">All Students On Track!</h3>
                <p className="text-slate-600">No students need extra support at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            needsSupportStudents.map((student) => {
              const progress = getOnboardingProgress(student);
              const daysSinceJoined = Math.floor((Date.now() - new Date(student.created_date).getTime()) / (1000 * 60 * 60 * 24));
              const counselor = counselors.find(c => c.id === student.counselor_id);
              
              return (
                <Card key={student.id} className="border-2 border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-amber-600" />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-amber-700">
                            Only {progress}% profile complete after {daysSinceJoined} days
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            Counselor: {counselor?.name || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-amber-600">
                        Send Reminder
                      </Button>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}