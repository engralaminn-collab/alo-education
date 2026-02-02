import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Loader2, CheckSquare, AlertTriangle, 
  Calendar, Users, Zap, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, subDays } from 'date-fns';

export default function AutomatedTaskManager() {
  const [processing, setProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students-tasks'],
    queryFn: () => base44.entities.StudentProfile.list('-updated_date', 200),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-tasks'],
    queryFn: () => base44.entities.Application.list('-updated_date', 300),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages-tasks'],
    queryFn: () => base44.entities.Message.list('-created_date', 500),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments-tasks'],
    queryFn: () => base44.entities.Appointment.list('-created_date', 200),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents-tasks'],
    queryFn: () => base44.entities.Document.list('-created_date', 300),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-tasks'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  const analyzeAndCreateTasks = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      
      // Prepare data for AI analysis
      const sevenDaysAgo = subDays(new Date(), 7);
      const fourteenDaysAgo = subDays(new Date(), 14);

      // Students who haven't been contacted recently
      const inactiveStudents = students.filter(s => {
        const lastUpdate = new Date(s.updated_date);
        return lastUpdate < sevenDaysAgo && 
               !['enrolled', 'lost'].includes(s.status);
      });

      // Applications approaching deadlines
      const urgentApplications = applications.filter(a => {
        if (!a.offer_deadline) return false;
        const deadline = new Date(a.offer_deadline);
        const daysUntilDeadline = Math.floor((deadline - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 7 && daysUntilDeadline > 0 && 
               a.status === 'conditional_offer' || a.status === 'unconditional_offer';
      });

      // Documents pending for too long
      const staleDocs = documents.filter(d => {
        const created = new Date(d.created_date);
        return d.status === 'pending' && created < fourteenDaysAgo;
      });

      // Use AI to analyze and suggest tasks
      const prompt = `As an AI assistant for a study abroad consultancy CRM, analyze the following data and suggest specific tasks for counselors:

Inactive Students (no updates in 7+ days): ${inactiveStudents.length}
Sample inactive students: ${inactiveStudents.slice(0, 5).map(s => `${s.first_name} ${s.last_name} (Status: ${s.status}, Last update: ${format(new Date(s.updated_date), 'MMM d')})`).join(', ')}

Urgent Applications (deadline within 7 days): ${urgentApplications.length}
Sample: ${urgentApplications.slice(0, 3).map(a => `Application ${a.id.slice(0, 8)} (Deadline: ${format(new Date(a.offer_deadline), 'MMM d')})`).join(', ')}

Stale Documents (pending 14+ days): ${staleDocs.length}

For each category, suggest:
1. Task title
2. Task description
3. Priority (urgent/high/medium/low)
4. Type (follow_up/visa_check/document_review/offer_letter/interview_prep)
5. Due date offset in days from today

Return JSON with arrays: student_follow_ups, application_reminders, document_reviews. Each with tasks array.`;

      const aiSuggestions = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            student_follow_ups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  type: { type: "string" },
                  due_days_offset: { type: "number" }
                }
              }
            },
            application_reminders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  type: { type: "string" },
                  due_days_offset: { type: "number" }
                }
              }
            },
            document_reviews: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  type: { type: "string" },
                  due_days_offset: { type: "number" }
                }
              }
            }
          }
        }
      });

      let tasksCreated = 0;

      // Create tasks for inactive students
      for (let i = 0; i < Math.min(inactiveStudents.length, aiSuggestions.student_follow_ups?.length || 0); i++) {
        const student = inactiveStudents[i];
        const taskTemplate = aiSuggestions.student_follow_ups[i % aiSuggestions.student_follow_ups.length];
        
        await base44.entities.Task.create({
          title: taskTemplate.title.replace('[Student]', `${student.first_name} ${student.last_name}`),
          description: taskTemplate.description,
          type: taskTemplate.type || 'follow_up',
          student_id: student.id,
          assigned_to: student.counselor_id || counselors[0]?.id,
          status: 'pending',
          priority: taskTemplate.priority || 'medium',
          due_date: format(addDays(new Date(), taskTemplate.due_days_offset || 1), 'yyyy-MM-dd')
        });
        tasksCreated++;
      }

      // Create tasks for urgent applications
      for (let i = 0; i < Math.min(urgentApplications.length, aiSuggestions.application_reminders?.length || 0); i++) {
        const app = urgentApplications[i];
        const taskTemplate = aiSuggestions.application_reminders[i % aiSuggestions.application_reminders.length];
        
        await base44.entities.Task.create({
          title: taskTemplate.title.replace('[Application]', `Application ${app.id.slice(0, 8)}`),
          description: taskTemplate.description,
          type: taskTemplate.type || 'offer_letter',
          student_id: app.student_id,
          application_id: app.id,
          assigned_to: students.find(s => s.id === app.student_id)?.counselor_id || counselors[0]?.id,
          status: 'pending',
          priority: 'urgent',
          due_date: format(addDays(new Date(), taskTemplate.due_days_offset || 0), 'yyyy-MM-dd')
        });
        tasksCreated++;
      }

      // Create tasks for stale documents
      for (let i = 0; i < Math.min(staleDocs.length, aiSuggestions.document_reviews?.length || 0); i++) {
        const doc = staleDocs[i];
        const taskTemplate = aiSuggestions.document_reviews[i % aiSuggestions.document_reviews.length];
        
        await base44.entities.Task.create({
          title: taskTemplate.title.replace('[Document]', doc.name),
          description: taskTemplate.description,
          type: 'document_review',
          student_id: doc.student_id,
          assigned_to: students.find(s => s.id === doc.student_id)?.counselor_id || counselors[0]?.id,
          status: 'pending',
          priority: taskTemplate.priority || 'high',
          due_date: format(addDays(new Date(), taskTemplate.due_days_offset || 1), 'yyyy-MM-dd')
        });
        tasksCreated++;
      }

      return { 
        tasksCreated, 
        suggestions: aiSuggestions,
        stats: {
          inactiveStudents: inactiveStudents.length,
          urgentApplications: urgentApplications.length,
          staleDocs: staleDocs.length
        }
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      setAnalysis(data);
      toast.success(`Created ${data.tasksCreated} automated tasks based on AI analysis!`);
      setProcessing(false);
    },
    onError: () => {
      toast.error('Failed to create tasks');
      setProcessing(false);
    }
  });

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Zap className="w-6 h-6 text-indigo-600" />
          AI Task Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-900">Automated Task Generation</h4>
              <p className="text-sm text-slate-600">
                AI analyzes student activity, deadlines, and communications to create follow-up tasks
              </p>
            </div>
            <Button 
              onClick={() => analyzeAndCreateTasks.mutate()}
              disabled={processing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Tasks
                </>
              )}
            </Button>
          </div>

          {!analysis ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                <Users className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-900">Student Follow-ups</p>
                <p className="text-xs text-blue-700">Inactive students</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                <Calendar className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-900">Deadline Reminders</p>
                <p className="text-xs text-amber-700">Urgent applications</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                <CheckSquare className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-900">Document Reviews</p>
                <p className="text-xs text-purple-700">Pending verification</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Results Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Tasks Created Successfully</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analysis.tasksCreated}</p>
                    <p className="text-xs text-green-700">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analysis.stats.inactiveStudents}</p>
                    <p className="text-xs text-blue-700">Student Follow-ups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{analysis.stats.urgentApplications}</p>
                    <p className="text-xs text-amber-700">Deadline Alerts</p>
                  </div>
                </div>
              </div>

              {/* Task Categories */}
              <Tabs defaultValue="students">
                <TabsList className="w-full">
                  <TabsTrigger value="students">Student Follow-ups</TabsTrigger>
                  <TabsTrigger value="applications">Application Reminders</TabsTrigger>
                  <TabsTrigger value="documents">Document Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="space-y-2 mt-4">
                  {analysis.suggestions.student_follow_ups?.map((task, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm text-slate-900">{task.title}</p>
                        <Badge className={
                          task.priority === 'urgent' ? 'bg-red-600' :
                          task.priority === 'high' ? 'bg-orange-600' :
                          task.priority === 'medium' ? 'bg-blue-600' :
                          'bg-slate-600'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{task.description}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="applications" className="space-y-2 mt-4">
                  {analysis.suggestions.application_reminders?.map((task, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm text-slate-900">{task.title}</p>
                        <Badge className={
                          task.priority === 'urgent' ? 'bg-red-600' :
                          task.priority === 'high' ? 'bg-orange-600' :
                          task.priority === 'medium' ? 'bg-blue-600' :
                          'bg-slate-600'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{task.description}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="documents" className="space-y-2 mt-4">
                  {analysis.suggestions.document_reviews?.map((task, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm text-slate-900">{task.title}</p>
                        <Badge className={
                          task.priority === 'urgent' ? 'bg-red-600' :
                          task.priority === 'high' ? 'bg-orange-600' :
                          task.priority === 'medium' ? 'bg-blue-600' :
                          'bg-slate-600'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{task.description}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <Button 
                onClick={() => setAnalysis(null)}
                variant="outline"
                className="w-full"
              >
                Run Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}