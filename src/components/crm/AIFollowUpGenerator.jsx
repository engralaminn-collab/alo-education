import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, Send, X, CheckCircle, Clock, 
  AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIFollowUpGenerator({ counselorId }) {
  const [generatingFor, setGeneratingFor] = useState(null);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['counselor-students', counselorId],
    queryFn: () => counselorId ? 
      base44.entities.StudentProfile.filter({ counselor_id: counselorId }) :
      base44.entities.StudentProfile.list('-updated_date', 50),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications-followup'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: automatedTasks = [] } = useQuery({
    queryKey: ['automated-tasks', counselorId],
    queryFn: async () => {
      try {
        return await base44.entities.AutomatedTask.filter({ 
          counselor_id: counselorId || 'all',
          task_type: 'follow_up',
          status: 'pending'
        });
      } catch {
        return [];
      }
    },
  });

  const generateFollowUpMutation = useMutation({
    mutationFn: async (student) => {
      const studentApps = applications.filter(a => a.student_id === student.id);
      const lastUpdate = student.updated_date ? new Date(student.updated_date) : new Date(student.created_date);
      const daysSinceUpdate = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));

      const prompt = `Generate a personalized follow-up message for this student:

Student: ${student.first_name} ${student.last_name}
Status: ${student.status}
Profile Completeness: ${student.profile_completeness || 0}%
Days Since Last Activity: ${daysSinceUpdate}
Applications: ${studentApps.length} (${studentApps.filter(a => !['enrolled', 'rejected'].includes(a.status)).length} active)
Preferred Destination: ${student.preferred_study_destinations?.[0] || 'Not specified'}

Context for follow-up:
${daysSinceUpdate > 14 ? '- Student has been inactive for over 2 weeks' : ''}
${student.profile_completeness < 50 ? '- Profile is incomplete' : ''}
${studentApps.length === 0 ? '- No applications submitted yet' : ''}
${studentApps.filter(a => a.status === 'draft').length > 0 ? '- Has draft applications pending' : ''}

Generate a warm, professional follow-up message (2-3 paragraphs) that:
1. Shows genuine care and personal attention
2. Addresses specific concerns based on their situation
3. Offers concrete next steps or assistance
4. Encourages re-engagement without being pushy

Return ONLY the message text.`;

      const message = await base44.integrations.Core.InvokeLLM({ prompt });

      // Create automated task
      await base44.entities.AutomatedTask.create({
        task_type: 'follow_up',
        student_id: student.id,
        counselor_id: counselorId || student.counselor_id,
        trigger_reason: `Inactivity: ${daysSinceUpdate} days`,
        ai_generated_content: message,
        status: 'pending',
        priority: daysSinceUpdate > 30 ? 'high' : 'medium',
        metadata: {
          days_inactive: daysSinceUpdate,
          profile_completeness: student.profile_completeness,
          application_count: studentApps.length
        }
      });

      return { student, message };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automated-tasks'] });
      toast.success(`Follow-up generated for ${data.student.first_name}`);
      setGeneratingFor(null);
    },
  });

  const sendFollowUpMutation = useMutation({
    mutationFn: async ({ task, student }) => {
      // Here you would integrate with email/messaging system
      // For now, we'll just update the task status
      await base44.entities.AutomatedTask.update(task.id, {
        status: 'sent',
        executed_date: new Date().toISOString()
      });
      return { task, student };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-tasks'] });
      toast.success('Follow-up message sent');
    },
  });

  const dismissTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.AutomatedTask.update(taskId, { status: 'dismissed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-tasks'] });
      toast.success('Task dismissed');
    },
  });

  // Identify students needing follow-up
  const studentsNeedingFollowUp = students.filter(student => {
    const lastUpdate = student.updated_date ? new Date(student.updated_date) : new Date(student.created_date);
    const daysSinceUpdate = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
    const hasTask = automatedTasks.some(t => t.student_id === student.id && t.status === 'pending');
    
    return daysSinceUpdate > 7 && !hasTask && !['enrolled', 'lost'].includes(student.status);
  }).slice(0, 5);

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
          <Sparkles className="w-5 h-5" />
          AI Automated Follow-Ups
        </CardTitle>
        <p className="text-sm text-slate-600">
          AI-generated personalized messages for inactive students
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Tasks */}
        {automatedTasks.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Pending Follow-Ups ({automatedTasks.length})</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {automatedTasks.map((task) => {
                const student = students.find(s => s.id === task.student_id);
                if (!student) return null;

                return (
                  <div key={task.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-slate-600">{task.trigger_reason}</p>
                      </div>
                      <Badge className={
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'urgent' ? 'bg-red-500 text-white' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="bg-white rounded p-2 mb-2 text-sm text-slate-700">
                      {task.ai_generated_content}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => sendFollowUpMutation.mutate({ task, student })}
                        disabled={sendFollowUpMutation.isPending}
                        style={{ backgroundColor: '#F37021' }}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => dismissTaskMutation.mutate(task.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Students Needing Follow-Up */}
        {studentsNeedingFollowUp.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Students Needing Follow-Up ({studentsNeedingFollowUp.length})
            </h4>
            <div className="space-y-2">
              {studentsNeedingFollowUp.map((student) => {
                const lastUpdate = student.updated_date ? new Date(student.updated_date) : new Date(student.created_date);
                const daysSinceUpdate = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));

                return (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-slate-600">Inactive for {daysSinceUpdate} days</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => generateFollowUpMutation.mutate(student)}
                      disabled={generateFollowUpMutation.isPending && generatingFor === student.id}
                    >
                      {generateFollowUpMutation.isPending && generatingFor === student.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {automatedTasks.length === 0 && studentsNeedingFollowUp.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-slate-600">All students are engaged! No follow-ups needed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}