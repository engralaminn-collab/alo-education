import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, FileText, User, Award, Plane } from 'lucide-react';
import { toast } from 'sonner';

export default function DynamicOnboardingChecklist({ studentId }) {
  const queryClient = useQueryClient();

  const { data: checklist } = useQuery({
    queryKey: ['onboarding-checklist', studentId],
    queryFn: async () => {
      const checklists = await base44.entities.OnboardingChecklist.filter({ student_id: studentId });
      return checklists[0];
    }
  });

  const updateChecklist = useMutation({
    mutationFn: async ({ itemIndex }) => {
      const items = [...checklist.checklist_items];
      items[itemIndex].completed = true;
      items[itemIndex].completed_date = new Date().toISOString();
      
      const completedCount = items.filter(i => i.completed).length;
      const percentage = Math.round((completedCount / items.length) * 100);

      return base44.entities.OnboardingChecklist.update(checklist.id, {
        checklist_items: items,
        completion_percentage: percentage
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklist'] });
      toast.success('Checklist updated');
    }
  });

  const getCategoryIcon = (category) => {
    const icons = {
      profile: User,
      documents: FileText,
      tests: Award,
      visa: Plane,
      application: CheckCircle2
    };
    return icons[category] || Circle;
  };

  if (!checklist) {
    return (
      <Card className="border-0 shadow-sm dark:bg-slate-800">
        <CardContent className="p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">Loading checklist...</p>
        </CardContent>
      </Card>
    );
  }

  const groupedItems = checklist.checklist_items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Card className="border-0 shadow-sm dark:bg-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="dark:text-white">Your Onboarding Checklist</CardTitle>
          <Badge className="bg-green-100 text-green-700">
            {checklist.completion_percentage}% Complete
          </Badge>
        </div>
        <Progress value={checklist.completion_percentage} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => {
          const Icon = getCategoryIcon(category);
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-education-blue" />
                <h3 className="font-semibold capitalize dark:text-white">{category}</h3>
              </div>
              <div className="space-y-2 ml-7">
                {items.sort((a, b) => a.order - b.order).map((item, idx) => {
                  const itemIndex = checklist.checklist_items.findIndex(i => i.title === item.title);
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        item.completed 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : 'bg-slate-50 dark:bg-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => !item.completed && updateChecklist.mutate({ itemIndex })}
                        disabled={item.completed}
                        className="mt-0.5"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-education-blue transition-colors" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${item.completed ? 'text-green-700 dark:text-green-400 line-through' : 'dark:text-white'}`}>
                          {item.title}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                        {item.completed_date && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Completed on {new Date(item.completed_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}