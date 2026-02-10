import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, AlertTriangle, MessageSquare, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function StudentTasks({ studentId }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [response, setResponse] = useState('');
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['student-tasks-active', studentId],
    queryFn: () => base44.entities.Task.filter({ 
      student_id: studentId,
      status: { $ne: 'completed' }
    }, 'due_date'),
    enabled: !!studentId
  });

  const respondToTask = useMutation({
    mutationFn: async ({ taskId, response }) => {
      const task = tasks.find(t => t.id === taskId);
      
      // Create communication record
      await base44.entities.CommunicationHistory.create({
        student_id: studentId,
        counselor_id: task.assigned_to,
        communication_type: 'chat',
        direction: 'outbound',
        subject: `Response to: ${task.title}`,
        summary: response,
        full_content: response,
        sentiment: 'neutral'
      });

      // Update task
      await base44.entities.Task.update(taskId, {
        student_notes: response,
        status: 'completed',
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-tasks-active'] });
      queryClient.invalidateQueries({ queryKey: ['student-comms'] });
      setSelectedTask(null);
      setResponse('');
      toast.success('Response sent to your counselor');
    }
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Action Items for You ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm">All caught up! No pending tasks.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border ${getPriorityColor(task.priority)} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm flex-1">{task.title}</h4>
                  {task.priority === 'urgent' && (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-xs opacity-80 mb-3 line-clamp-2">{task.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">
                    {task.type.replace(/_/g, ' ')}
                  </Badge>
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      {format(new Date(task.due_date), 'MMM d')}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Task Response Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedTask.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(selectedTask.priority)}>
                  {selectedTask.priority} priority
                </Badge>
                {selectedTask.due_date && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    Due {format(new Date(selectedTask.due_date), 'MMM d, yyyy')}
                  </Badge>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Your Response
                </label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="min-h-32"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => respondToTask.mutate({ taskId: selectedTask.id, response })}
                  disabled={!response.trim() || respondToTask.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Response
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}