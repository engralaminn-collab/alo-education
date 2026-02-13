import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

export default function AIOnboardingReminders({ student, checklist }) {
  const queryClient = useQueryClient();

  const sendReminder = useMutation({
    mutationFn: async (item) => {
      const prompt = `Generate a friendly, motivating reminder email for this incomplete onboarding task.

STUDENT: ${student.first_name} ${student.last_name}
INCOMPLETE ITEM: ${item.title}
DESCRIPTION: ${item.description}
PRIORITY: ${item.priority}
DUE DATE: ${item.due_date || 'Soon'}

Email should:
1. Be warm and encouraging
2. Remind them of the task
3. Explain why it's important
4. Provide a clear next step
5. Keep it brief (2-3 short paragraphs)

Return JSON with subject and body.`;

      const emailContent = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            body: { type: 'string' }
          }
        }
      });

      // Send email
      await base44.integrations.Core.SendEmail({
        to: student.email,
        subject: emailContent.subject,
        body: emailContent.body,
        from_name: 'ALO Education Onboarding'
      });

      // Update checklist item
      const updatedItems = checklist.checklist_items.map(i =>
        i.id === item.id
          ? { ...i, reminder_sent: true, last_reminder_date: new Date().toISOString() }
          : i
      );

      await base44.entities.OnboardingChecklist.update(checklist.id, {
        checklist_items: updatedItems
      });

      return emailContent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding-checklist']);
      toast.success('Reminder sent!');
    }
  });

  // Auto-generate reminders for overdue items
  useEffect(() => {
    if (!checklist?.checklist_items) return;

    const overdueItems = checklist.checklist_items.filter(item => {
      if (item.completed || !item.due_date) return false;
      
      const daysUntilDue = differenceInDays(new Date(item.due_date), new Date());
      const daysSinceReminder = item.last_reminder_date
        ? differenceInDays(new Date(), new Date(item.last_reminder_date))
        : 999;

      // Remind if: overdue OR due within 3 days AND no reminder in last 7 days
      return (daysUntilDue < 0 || daysUntilDue <= 3) && daysSinceReminder > 7;
    });

    // Don't auto-send, just show notification
    if (overdueItems.length > 0) {
      console.log(`${overdueItems.length} items need reminders`);
    }
  }, [checklist]);

  if (!checklist?.checklist_items) return null;

  const incompleteItems = checklist.checklist_items.filter(i => !i.completed);
  const overdueItems = incompleteItems.filter(item => {
    if (!item.due_date) return false;
    return differenceInDays(new Date(item.due_date), new Date()) < 0;
  });
  const urgentItems = incompleteItems.filter(i => i.priority === 'urgent' || i.priority === 'high');

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Bell className="w-5 h-5" />
          Smart Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-2xl font-bold text-red-700">{overdueItems.length}</p>
            <p className="text-xs text-red-600">Overdue Items</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-2xl font-bold text-amber-700">{urgentItems.length}</p>
            <p className="text-xs text-amber-600">High Priority</p>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[...overdueItems, ...urgentItems.filter(i => !overdueItems.includes(i))]
            .slice(0, 5)
            .map(item => {
              const isOverdue = item.due_date && differenceInDays(new Date(item.due_date), new Date()) < 0;
              const daysUntilDue = item.due_date ? differenceInDays(new Date(item.due_date), new Date()) : null;

              return (
                <div key={item.id} className="p-3 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                        {isOverdue && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {isOverdue
                        ? `${Math.abs(daysUntilDue)} days overdue`
                        : daysUntilDue !== null
                        ? `Due in ${daysUntilDue} days`
                        : 'No due date'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => sendReminder.mutate(item)}
                      disabled={sendReminder.isPending}
                      style={{ backgroundColor: '#F37021' }}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>

        {incompleteItems.length === 0 && (
          <div className="text-center py-6">
            <p className="text-green-600 font-semibold">🎉 All caught up!</p>
            <p className="text-sm text-slate-600 mt-1">No pending items need reminders</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}