import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ListTodo, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AITaskAutomation() {
  const [prioritizedTasks, setPrioritizedTasks] = useState(null);
  const [outreach, setOutreach] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const prioritizeTasks = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('prioritizeCounselorTasks', {});
      return data;
    },
    onSuccess: (data) => {
      setPrioritizedTasks(data);
      toast.success('Tasks prioritized by AI');
    }
  });

  const generateOutreach = useMutation({
    mutationFn: async ({ student_id, query_type }) => {
      const { data } = await base44.functions.invoke('autoGenerateOutreach', {
        student_id,
        query_type
      });
      return data;
    },
    onSuccess: (data) => {
      setOutreach(data);
      toast.success('Outreach messages generated');
    }
  });

  const urgencyColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Task Automation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prioritize" className="space-y-4">
          <TabsList>
            <TabsTrigger value="prioritize">Prioritize Tasks</TabsTrigger>
            <TabsTrigger value="outreach">Draft Outreach</TabsTrigger>
          </TabsList>

          <TabsContent value="prioritize" className="space-y-4">
            <p className="text-sm text-slate-600">
              AI analyzes your tasks and prioritizes based on urgency and deadlines.
            </p>

            <Button
              onClick={() => prioritizeTasks.mutate()}
              disabled={prioritizeTasks.isPending}
              className="bg-indigo-600 w-full"
            >
              <ListTodo className="w-4 h-4 mr-2" />
              {prioritizeTasks.isPending ? 'Analyzing...' : 'Prioritize My Tasks'}
            </Button>

            {prioritizedTasks && (
              <div className="space-y-4">
                {/* Daily Focus */}
                {prioritizedTasks.daily_focus?.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <h5 className="font-semibold text-indigo-900 mb-2">Today's Focus</h5>
                    <ul className="space-y-1">
                      {prioritizedTasks.daily_focus.map((focus, i) => (
                        <li key={i} className="text-sm text-indigo-800">🎯 {focus}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prioritized Tasks */}
                {prioritizedTasks.prioritized_tasks?.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-semibold">Prioritized Task List</h5>
                    {prioritizedTasks.prioritized_tasks.map((task, i) => (
                      <div key={i} className="bg-white border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h6 className="font-semibold text-sm">{task.title}</h6>
                            <p className="text-xs text-slate-600">{task.student_name}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={urgencyColors[task.urgency_level]}>
                              {task.urgency_level}
                            </Badge>
                            <p className="text-xs text-slate-500 mt-1">Score: {task.priority_score}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 mb-2">{task.reasoning}</p>
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <strong>Action:</strong> {task.recommended_action}
                          <span className="text-slate-500 ml-2">~{task.estimated_time_minutes}min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Wins */}
                {prioritizedTasks.quick_wins?.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h5 className="font-semibold text-green-900 mb-2">Quick Wins (Do These First)</h5>
                    <ul className="space-y-1">
                      {prioritizedTasks.quick_wins.map((win, i) => (
                        <li key={i} className="text-sm text-green-800">✓ {win}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outreach" className="space-y-4">
            <p className="text-sm text-slate-600">
              AI drafts personalized outreach messages for common student queries.
            </p>

            <div>
              <label className="text-sm font-medium mb-2 block">Student ID</label>
              <input
                type="text"
                placeholder="Enter student ID"
                className="w-full border rounded-md px-3 py-2 text-sm mb-3"
                onChange={(e) => setSelectedStudent(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" onClick={() => generateOutreach.mutate({ student_id: selectedStudent, query_type: 'application_status' })} disabled={!selectedStudent || generateOutreach.isPending}>
                  Application Status
                </Button>
                <Button size="sm" onClick={() => generateOutreach.mutate({ student_id: selectedStudent, query_type: 'deadline_reminder' })} disabled={!selectedStudent || generateOutreach.isPending}>
                  Deadline Reminder
                </Button>
                <Button size="sm" onClick={() => generateOutreach.mutate({ student_id: selectedStudent, query_type: 'document_request' })} disabled={!selectedStudent || generateOutreach.isPending}>
                  Document Request
                </Button>
                <Button size="sm" onClick={() => generateOutreach.mutate({ student_id: selectedStudent, query_type: 'visa_guidance' })} disabled={!selectedStudent || generateOutreach.isPending}>
                  Visa Guidance
                </Button>
              </div>
            </div>

            {outreach?.outreach && (
              <div className="space-y-3">
                {/* Email */}
                <div className="bg-white border rounded-lg p-3">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Email Draft
                  </h5>
                  <div className="space-y-2">
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-600">Subject:</p>
                      <p className="text-sm font-medium">{outreach.outreach.email.subject}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-600 mb-1">Body:</p>
                      <p className="text-sm whitespace-pre-wrap">{outreach.outreach.email.body}</p>
                    </div>
                  </div>
                </div>

                {/* SMS */}
                <div className="bg-white border rounded-lg p-3">
                  <h5 className="font-semibold mb-2">SMS Draft</h5>
                  <p className="text-sm bg-slate-50 p-2 rounded">{outreach.outreach.sms}</p>
                </div>

                {/* WhatsApp */}
                <div className="bg-white border rounded-lg p-3">
                  <h5 className="font-semibold mb-2">WhatsApp Draft</h5>
                  <p className="text-sm bg-slate-50 p-2 rounded">{outreach.outreach.whatsapp}</p>
                </div>

                {/* Talking Points */}
                {outreach.outreach.talking_points?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-semibold text-blue-900 mb-2">Key Talking Points</h5>
                    <ul className="space-y-1">
                      {outreach.outreach.talking_points.map((point, i) => (
                        <li key={i} className="text-sm text-blue-800">• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}