import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Zap, Calendar, Users, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

export default function AIAssistant() {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students-ai'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-ai'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries-ai'],
    queryFn: () => base44.entities.Inquiry.list(),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-ai'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-ai'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
  });

  // Auto-generate follow-up tasks
  const generateTasksMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      const tasksToCreate = [];
      const sevenDaysAgo = subDays(new Date(), 7);
      
      // Find inactive students
      const inactiveStudents = students.filter(s => {
        const lastActivity = new Date(s.updated_date || s.created_date);
        return lastActivity < sevenDaysAgo && s.status !== 'enrolled' && s.status !== 'lost';
      });

      for (const student of inactiveStudents.slice(0, 20)) {
        const existingTasks = tasks.filter(t => 
          t.student_id === student.id && 
          t.status === 'pending'
        );
        
        if (existingTasks.length === 0) {
          tasksToCreate.push({
            title: `Follow up with ${student.first_name} ${student.last_name}`,
            description: `Student has been inactive for 7+ days. Last status: ${student.status}`,
            type: 'follow_up',
            student_id: student.id,
            assigned_to: student.counselor_id || counselors[0]?.id,
            status: 'pending',
            priority: 'medium',
            due_date: format(new Date(), 'yyyy-MM-dd')
          });
        }
      }

      // Application status-based tasks
      for (const app of applications) {
        if (app.status === 'documents_pending') {
          const existingTask = tasks.find(t => 
            t.application_id === app.id && 
            t.type === 'document_review' &&
            t.status === 'pending'
          );
          
          if (!existingTask) {
            const student = students.find(s => s.id === app.student_id);
            tasksToCreate.push({
              title: `Review documents for application`,
              description: `Documents pending for ${student?.first_name}'s application`,
              type: 'document_review',
              student_id: app.student_id,
              application_id: app.id,
              assigned_to: student?.counselor_id || counselors[0]?.id,
              status: 'pending',
              priority: 'high',
              due_date: format(new Date(), 'yyyy-MM-dd')
            });
          }
        }

        if (app.status === 'conditional_offer' || app.status === 'unconditional_offer') {
          const student = students.find(s => s.id === app.student_id);
          const existingTask = tasks.find(t => 
            t.application_id === app.id && 
            t.type === 'offer_letter' &&
            t.status !== 'completed'
          );
          
          if (!existingTask) {
            tasksToCreate.push({
              title: `Send offer letter to student`,
              description: `Process offer letter for ${student?.first_name}`,
              type: 'offer_letter',
              student_id: app.student_id,
              application_id: app.id,
              assigned_to: student?.counselor_id || counselors[0]?.id,
              status: 'pending',
              priority: 'urgent',
              due_date: format(new Date(), 'yyyy-MM-dd')
            });
          }
        }
      }

      if (tasksToCreate.length > 0) {
        await base44.entities.Task.bulkCreate(tasksToCreate);
      }

      return { count: tasksToCreate.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-ai'] });
      toast.success(`Generated ${data.count} new tasks`);
      setGenerating(false);
    }
  });

  // Suggest counselor for inquiry
  const suggestCounselorMutation = useMutation({
    mutationFn: async (inquiry) => {
      const prompt = `You are assigning a counselor to a new lead/inquiry.

Inquiry Details:
- Name: ${inquiry.name}
- Country Interest: ${inquiry.country_of_interest}
- Degree Level: ${inquiry.degree_level}
- Field of Study: ${inquiry.field_of_study}

Available Counselors:
${counselors.map(c => {
  const studentCount = students.filter(s => s.counselor_id === c.id).length;
  return `- ${c.name}: Specializations: ${c.specializations?.join(', ') || 'General'}, Current Students: ${studentCount}/${c.max_students || 50}, Languages: ${c.languages?.join(', ') || 'Not specified'}`;
}).join('\n')}

Select the best counselor and provide reasoning. Consider:
1. Specialization match (country, field)
2. Current workload
3. Language compatibility (if relevant)

Return JSON with counselor_id (from the list above, use exact name) and reason.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            counselor_name: { type: "string" },
            reason: { type: "string" }
          }
        }
      });

      const counselor = counselors.find(c => c.name === response.counselor_name);
      
      if (counselor) {
        await base44.entities.Inquiry.update(inquiry.id, {
          assigned_to: counselor.id
        });
        return { counselor, reason: response.reason };
      }
      
      throw new Error('Counselor not found');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inquiries-ai'] });
      toast.success(`Assigned to ${data.counselor.name}`);
    }
  });

  const newInquiries = inquiries.filter(i => i.status === 'new' && !i.assigned_to);
  const inactiveStudents = students.filter(s => {
    const lastActivity = new Date(s.updated_date || s.created_date);
    return lastActivity < subDays(new Date(), 7) && s.status !== 'enrolled' && s.status !== 'lost';
  });

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Bot className="w-6 h-6 text-blue-600" />
            AI Counselor Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks">
            <TabsList className="w-full">
              <TabsTrigger value="tasks" className="flex-1">
                <Zap className="w-4 h-4 mr-2" />
                Auto Tasks
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Smart Assignment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4 mt-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">Automatic Task Generation</h4>
                    <p className="text-sm text-slate-600">Generate follow-up tasks for inactive students and applications</p>
                  </div>
                  <Button 
                    onClick={() => generateTasksMutation.mutate()}
                    disabled={generating}
                    className="bg-blue-600"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 mb-2" />
                    <p className="text-sm font-medium text-amber-900">{inactiveStudents.length} Inactive Students</p>
                    <p className="text-xs text-amber-700">No activity in 7+ days</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <CheckCircle className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-blue-900">
                      {applications.filter(a => a.status === 'documents_pending').length} Pending Reviews
                    </p>
                    <p className="text-xs text-blue-700">Documents need review</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignment" className="space-y-4 mt-4">
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-slate-900 mb-3">Unassigned Inquiries</h4>
                {newInquiries.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">All inquiries assigned</p>
                ) : (
                  <div className="space-y-2">
                    {newInquiries.slice(0, 5).map((inquiry) => (
                      <div key={inquiry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{inquiry.name}</p>
                          <p className="text-xs text-slate-500">
                            {inquiry.country_of_interest} • {inquiry.degree_level}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => suggestCounselorMutation.mutate(inquiry)}
                          disabled={suggestCounselorMutation.isPending}
                        >
                          {suggestCounselorMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-1" />
                              AI Assign
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}