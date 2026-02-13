import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ClipboardList, Plus, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskAssignment({ studentId, currentCounselorId, currentCounselorName }) {
  const [showAdd, setShowAdd] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: '',
  });

  const queryClient = useQueryClient();

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-tasks'],
    queryFn: () => base44.entities.Counselor.filter({ status: 'active' }),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['counselor-tasks', studentId],
    queryFn: async () => {
      try {
        return await base44.entities.CounselorTask.filter({ student_id: studentId }, '-created_date');
      } catch {
        return [];
      }
    },
    enabled: !!studentId,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.CounselorTask.create({
      ...data,
      student_id: studentId,
      assigned_by: currentCounselorId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselor-tasks'] });
      setShowAdd(false);
      setTaskData({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
      });
      toast.success('Task assigned');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CounselorTask.update(id, {
      status,
      completed_date: status === 'completed' ? new Date().toISOString() : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselor-tasks'] });
      toast.success('Task updated');
    },
  });

  const handleSubmit = () => {
    if (!taskData.title || !taskData.assigned_to) {
      toast.error('Please fill in required fields');
      return;
    }
    createTaskMutation.mutate(taskData);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
            <ClipboardList className="w-5 h-5" />
            Team Tasks ({pendingTasks.length})
          </CardTitle>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} style={{ backgroundColor: '#F37021' }}>
            <Plus className="w-4 h-4 mr-1" />
            Assign Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <div>
              <Label>Task Title *</Label>
              <Input
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="E.g., Follow up with student about IELTS"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                placeholder="Task details..."
                rows={2}
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Assign To *</Label>
                <select
                  value={taskData.assigned_to}
                  onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="">Select counselor...</option>
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Priority</Label>
                <select
                  value={taskData.priority}
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={taskData.due_date}
                onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createTaskMutation.isPending} style={{ backgroundColor: '#0066CC' }}>
                Assign Task
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Pending Tasks */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-2">Active Tasks</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No pending tasks</p>
            ) : (
              pendingTasks.map((task) => {
                const assignee = counselors.find(c => c.id === task.assigned_to);
                return (
                  <div key={task.id} className="p-3 border rounded-lg bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          Assigned to: {assignee?.name}
                        </p>
                      </div>
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.due_date && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" />
                        Due: {task.due_date}
                      </p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => updateTaskMutation.mutate({ id: task.id, status: 'completed' })}
                      disabled={updateTaskMutation.isPending}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark Complete
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Completed ({completedTasks.length})</h4>
            <div className="space-y-1">
              {completedTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-2 bg-green-50 rounded text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-slate-700">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}