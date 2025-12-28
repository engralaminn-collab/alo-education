import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, Calendar, AlertTriangle, Clock, 
  CheckCircle, X
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function AIDeadlineReminders({ counselorId }) {
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['counselor-students-deadlines', counselorId],
    queryFn: () => counselorId ? 
      base44.entities.StudentProfile.filter({ counselor_id: counselorId }) :
      base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-deadlines'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-deadlines'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['deadline-reminders', counselorId],
    queryFn: async () => {
      try {
        return await base44.entities.AutomatedTask.filter({ 
          counselor_id: counselorId || 'all',
          task_type: 'deadline_alert',
          status: 'pending'
        });
      } catch {
        return [];
      }
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: async ({ student, application, deadline, daysUntil }) => {
      const course = courses.find(c => c.id === application.course_id);
      
      return await base44.entities.AutomatedTask.create({
        task_type: 'deadline_alert',
        student_id: student.id,
        counselor_id: counselorId || student.counselor_id,
        trigger_reason: `Application deadline approaching: ${deadline}`,
        ai_generated_content: `Reminder: ${student.first_name} ${student.last_name}'s application to ${course?.course_title || 'Unknown Course'} has a deadline on ${deadline}. Only ${daysUntil} days remaining.`,
        status: 'pending',
        priority: daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'high' : 'medium',
        scheduled_date: new Date().toISOString(),
        metadata: {
          application_id: application.id,
          deadline: deadline,
          days_until: daysUntil
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-reminders'] });
      toast.success('Reminder created');
    },
  });

  const dismissReminderMutation = useMutation({
    mutationFn: (reminderId) => base44.entities.AutomatedTask.update(reminderId, { status: 'dismissed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-reminders'] });
      toast.success('Reminder dismissed');
    },
  });

  const acknowledgeReminderMutation = useMutation({
    mutationFn: (reminderId) => base44.entities.AutomatedTask.update(reminderId, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-reminders'] });
      toast.success('Reminder acknowledged');
    },
  });

  // Find upcoming deadlines
  const upcomingDeadlines = applications
    .filter(app => {
      const course = courses.find(c => c.id === app.course_id);
      return course?.application_deadline && 
             !['enrolled', 'rejected', 'withdrawn'].includes(app.status);
    })
    .map(app => {
      const course = courses.find(c => c.id === app.course_id);
      const student = students.find(s => s.id === app.student_id);
      const deadlineStr = course?.application_deadline;
      
      // Try to parse the deadline
      let daysUntil = null;
      try {
        // Handle various date formats
        const deadlineDate = new Date(deadlineStr);
        if (!isNaN(deadlineDate.getTime())) {
          daysUntil = differenceInDays(deadlineDate, new Date());
        }
      } catch (e) {
        // If parsing fails, skip
      }

      return {
        application: app,
        course,
        student,
        deadline: deadlineStr,
        daysUntil,
        hasReminder: reminders.some(r => r.metadata?.application_id === app.id)
      };
    })
    .filter(item => item.daysUntil !== null && item.daysUntil >= 0 && item.daysUntil <= 30 && item.student)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Bell className="w-5 h-5" />
          AI Deadline Reminders
        </CardTitle>
        <p className="text-sm text-slate-600">
          Automated alerts for upcoming application deadlines
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Reminders */}
        {reminders.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Active Reminders ({reminders.length})</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reminders.map((reminder) => {
                const student = students.find(s => s.id === reminder.student_id);
                if (!student) return null;

                return (
                  <div 
                    key={reminder.id} 
                    className={`p-3 rounded-lg border-2 ${
                      reminder.priority === 'urgent' ? 'bg-red-50 border-red-300' :
                      reminder.priority === 'high' ? 'bg-amber-50 border-amber-300' :
                      'bg-blue-50 border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-slate-600">{reminder.trigger_reason}</p>
                      </div>
                      <Badge className={
                        reminder.priority === 'urgent' ? 'bg-red-500 text-white' :
                        reminder.priority === 'high' ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'
                      }>
                        {reminder.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">
                      {reminder.ai_generated_content}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => acknowledgeReminderMutation.mutate(reminder.id)}
                        style={{ backgroundColor: '#0066CC' }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Done
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => dismissReminderMutation.mutate(reminder.id)}
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

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Upcoming Deadlines ({upcomingDeadlines.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {upcomingDeadlines.slice(0, 10).map((item, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded border ${
                    item.daysUntil <= 3 ? 'bg-red-50 border-red-200' :
                    item.daysUntil <= 7 ? 'bg-amber-50 border-amber-200' :
                    'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">
                        {item.student.first_name} {item.student.last_name}
                      </p>
                      <p className="text-xs text-slate-600">
                        {item.course?.course_title}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {item.daysUntil === 0 ? 'Today' : `${item.daysUntil} days`} • {item.deadline}
                      </p>
                    </div>
                    {!item.hasReminder && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => createReminderMutation.mutate(item)}
                        disabled={createReminderMutation.isPending}
                      >
                        <Bell className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reminders.length === 0 && upcomingDeadlines.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-slate-600">No urgent deadlines at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}