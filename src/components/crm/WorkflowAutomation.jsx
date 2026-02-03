import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Play, Pause, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowAutomation() {
  const queryClient = useQueryClient();
  const [running, setRunning] = React.useState(false);

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.AutomatedWorkflow.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['workflow-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['workflow-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: commHistory = [] } = useQuery({
    queryKey: ['workflow-comms'],
    queryFn: () => base44.entities.CommunicationHistory.list('-created_date', 500),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['workflow-docs'],
    queryFn: () => base44.entities.Document.list(),
  });

  const executeWorkflows = useMutation({
    mutationFn: async () => {
      setRunning(true);
      const results = [];

      for (const workflow of workflows.filter(w => w.is_active)) {
        if (workflow.trigger_type === 'communication_gap') {
          const daysThreshold = workflow.trigger_conditions?.days_threshold || 5;
          const cutoffDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);

          for (const student of students) {
            const lastComm = commHistory.find(h => h.student_id === student.id);
            if (!lastComm || new Date(lastComm.created_date) < cutoffDate) {
              // Generate follow-up email
              const emailDraft = await base44.integrations.Core.InvokeLLM({
                prompt: `Draft a friendly follow-up email to student ${student.first_name} ${student.last_name}.

Student info:
- Status: ${student.status}
- Preferred destination: ${student.preferred_countries?.[0] || 'Not specified'}
- Last communication: ${lastComm ? new Date(lastComm.created_date).toDateString() : 'Never'}

Email should:
1. Be warm and supportive
2. Check in on their study abroad plans
3. Offer assistance
4. Suggest next steps based on their status
5. Be concise and actionable

Return subject and body.`,
                response_json_schema: {
                  type: "object",
                  properties: {
                    subject: { type: "string" },
                    body: { type: "string" }
                  }
                }
              });

              // Create task for counselor
              const task = await base44.entities.Task.create({
                title: `Follow up with ${student.first_name} ${student.last_name}`,
                description: `Auto-generated: No communication in ${daysThreshold} days\n\nDraft Email:\nSubject: ${emailDraft.subject}\n\n${emailDraft.body}`,
                type: 'follow_up',
                student_id: student.id,
                assigned_to: student.counselor_id,
                status: 'pending',
                priority: workflow.task_priority || 'medium',
                due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });

              results.push({ type: 'communication_gap', studentId: student.id, taskId: task.id });
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        }

        if (workflow.trigger_type === 'deadline_approaching') {
          const daysThreshold = workflow.trigger_conditions?.days_threshold || 7;
          const deadlineDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);

          for (const app of applications) {
            const course = await base44.entities.Course.filter({ id: app.course_id });
            if (course[0]?.application_deadline) {
              const deadline = new Date(course[0].application_deadline);
              if (deadline <= deadlineDate && deadline > new Date() && app.status === 'draft') {
                const student = students.find(s => s.id === app.student_id);
                
                const task = await base44.entities.Task.create({
                  title: `Urgent: Application deadline approaching for ${student?.first_name} ${student?.last_name}`,
                  description: `Course: ${course[0].course_title}\nDeadline: ${course[0].application_deadline}\nCurrent status: ${app.status}\n\nAction needed: Submit application`,
                  type: 'other',
                  student_id: app.student_id,
                  application_id: app.id,
                  assigned_to: student?.counselor_id,
                  status: 'pending',
                  priority: 'urgent',
                  due_date: course[0].application_deadline
                });

                results.push({ type: 'deadline_approaching', appId: app.id, taskId: task.id });
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
        }

        if (workflow.trigger_type === 'document_pending') {
          for (const student of students) {
            const studentDocs = documents.filter(d => d.student_id === student.id && d.status === 'pending');
            const oldDocs = studentDocs.filter(d => {
              const daysSince = (Date.now() - new Date(d.created_date).getTime()) / (1000 * 60 * 60 * 24);
              return daysSince > (workflow.trigger_conditions?.days_threshold || 3);
            });

            if (oldDocs.length > 0) {
              const task = await base44.entities.Task.create({
                title: `Review pending documents for ${student.first_name} ${student.last_name}`,
                description: `${oldDocs.length} document(s) pending review:\n${oldDocs.map(d => `- ${d.name} (${d.document_type})`).join('\n')}`,
                type: 'document_review',
                student_id: student.id,
                assigned_to: student.counselor_id,
                status: 'pending',
                priority: 'high',
                due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });

              results.push({ type: 'document_pending', studentId: student.id, taskId: task.id });
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        await base44.entities.AutomatedWorkflow.update(workflow.id, {
          last_run: new Date().toISOString(),
          executions_count: (workflow.executions_count || 0) + 1
        });
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success(`Workflows executed: ${results.length} actions triggered`);
      setRunning(false);
    },
    onError: (error) => {
      toast.error('Workflow execution failed: ' + error.message);
      setRunning(false);
    }
  });

  // Auto-run every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!running) {
        executeWorkflows.mutate();
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          Workflow Automation Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">Active Workflows</p>
              <p className="text-sm text-slate-600">
                {workflows.filter(w => w.is_active).length} rules running
              </p>
            </div>
            {running ? (
              <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>

          <Button
            onClick={() => executeWorkflows.mutate()}
            disabled={running}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Workflows Now
              </>
            )}
          </Button>

          <div className="space-y-2">
            {workflows.filter(w => w.is_active).map(workflow => (
              <div key={workflow.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{workflow.rule_name}</span>
                <Badge variant="outline" className="text-xs">
                  {workflow.executions_count || 0} runs
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}