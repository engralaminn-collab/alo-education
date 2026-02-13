import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AITaskPrioritizer({ counselorId, tasks }) {
  const queryClient = useQueryClient();
  const [priorities, setPriorities] = useState(null);

  const prioritize = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('prioritizeTasks', {
        counselor_id: counselorId
      });
      return data;
    },
    onSuccess: (data) => {
      setPriorities(data.priorities);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`${data.tasks_updated} tasks reprioritized`);
    }
  });

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Task Prioritizer
          </CardTitle>
          <Button
            size="sm"
            onClick={() => prioritize.mutate()}
            disabled={prioritize.isPending}
            className="bg-purple-600"
          >
            {prioritize.isPending ? 'Analyzing...' : 'Run AI Prioritization'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {priorities ? (
          <div className="space-y-3">
            {priorities.slice(0, 10).map((priority, idx) => {
              const task = tasks.find(t => t.id === priority.task_id);
              if (!task) return null;

              return (
                <div key={priority.task_id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">#{idx + 1}</span>
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge className={priorityColors[priority.new_priority]}>
                          {priority.new_priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{priority.reasoning}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-lg">{priority.urgency_score}</span>
                      </div>
                      <p className="text-xs text-slate-500">Urgency</p>
                    </div>
                  </div>

                  {priority.follow_up_actions?.length > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-orange-900 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Suggested Actions:
                      </p>
                      <ul className="space-y-1">
                        {priority.follow_up_actions.map((action, i) => (
                          <li key={i} className="text-xs text-orange-800">• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Click "Run AI Prioritization" to optimize your task list</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}