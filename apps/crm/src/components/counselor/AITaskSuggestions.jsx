import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function AITaskSuggestions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: automatedTasks = [], isLoading } = useQuery({
    queryKey: ['automated-tasks'],
    queryFn: () => base44.entities.AutomatedTask.filter({ status: 'pending' })
  });

  const generateTasks = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await base44.functions.invoke('aiTaskAutomation', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automated-tasks'] });
      toast.success(`Generated ${data.tasksGenerated} new tasks`);
      setIsGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate tasks');
      setIsGenerating(false);
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AutomatedTask.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-tasks'] });
      toast.success('Task updated');
    }
  });

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-blue-100 text-blue-700 border-blue-200',
      low: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <Card className="border-0 shadow-sm dark:bg-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle className="dark:text-white">AI Task Suggestions</CardTitle>
          </div>
          <Button
            onClick={() => generateTasks.mutate()}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700 select-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Tasks
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : automatedTasks.length === 0 ? (
          <div className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No suggested tasks yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Click Generate to create AI-powered task suggestions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {automatedTasks.slice(0, 10).map(task => (
              <div
                key={task.id}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-purple-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium dark:text-white">{task.task_title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {task.task_description}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.due_date}
                    </span>
                    <Badge variant="outline">{task.task_type}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTaskStatus.mutate({ id: task.id, status: 'completed' })}
                      className="select-none dark:bg-slate-600"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}