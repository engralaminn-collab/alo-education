import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';

export default function CounselorTasksWidget({ counselorId, limit = 5 }) {
  const queryClient = useQueryClient();
  const [showAddTask, setShowAddTask] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ['counselor-tasks', counselorId],
    queryFn: () => base44.entities.Task.filter({ assigned_to: counselorId }),
    enabled: !!counselorId,
  });

  const completeMutation = useMutation({
    mutationFn: (taskId) =>
      base44.entities.Task.update(taskId, { 
        status: 'completed',
        completed_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselor-tasks', counselorId] });
      toast.success('Task completed!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId) =>
      base44.entities.Task.update(taskId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselor-tasks', counselorId] });
      toast.success('Task deleted');
    },
  });

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const sortedTasks = pendingTasks.sort((a, b) => {
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const isOverdue = (dueDate) => {
    return isPast(new Date(dueDate)) && new Date() > new Date(dueDate);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          My Tasks
        </CardTitle>
        <span className="text-sm font-semibold text-slate-600">
          {pendingTasks.length} pending
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedTasks.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No pending tasks</p>
        ) : (
          <>
            {sortedTasks.slice(0, limit).map((task) => {
              const overdue = isOverdue(task.due_date);
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border-l-4 transition-all ${
                    overdue
                      ? 'bg-red-50 border-l-red-500'
                      : 'bg-slate-50 border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="mt-1"
                      onCheckedChange={() => completeMutation.mutate(task.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <span className={`text-xs font-semibold ${
                          overdue ? 'text-red-600' : 'text-slate-600'
                        }`}>
                          {format(new Date(task.due_date), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                      onClick={() => deleteMutation.mutate(task.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {pendingTasks.length > limit && (
              <Button variant="outline" className="w-full text-xs h-8">
                View all {pendingTasks.length} tasks
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}