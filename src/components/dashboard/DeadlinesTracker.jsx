import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { Progress } from "@/components/ui/progress";

export default function DeadlinesTracker({ applications, tasks, scholarships = [] }) {
  // Collect all deadlines from applications and tasks
  const deadlines = [];

  // Application deadlines
  applications.forEach(app => {
    if (app.offer_deadline && !isPast(new Date(app.offer_deadline)) && app.status !== 'enrolled') {
      deadlines.push({
        id: `app-${app.id}`,
        title: 'Offer Response Deadline',
        subtitle: app.university_name || 'University',
        date: new Date(app.offer_deadline),
        type: 'offer',
        status: app.status,
      });
    }

    // Visa deadlines if in visa processing
    if (app.status === 'visa_processing' && app.intake) {
      // Estimate visa deadline as 2 months before intake
      const intakeDate = new Date(app.intake);
      const visaDeadline = new Date(intakeDate);
      visaDeadline.setMonth(visaDeadline.getMonth() - 2);
      
      if (!isPast(visaDeadline)) {
        deadlines.push({
          id: `visa-${app.id}`,
          title: 'Visa Application Deadline',
          subtitle: app.university_name || 'University',
          date: visaDeadline,
          type: 'visa',
          status: app.status,
        });
      }
    }
  });

  // Task deadlines
  tasks.forEach(task => {
    if (task.due_date && !isPast(new Date(task.due_date)) && task.status !== 'completed') {
      deadlines.push({
        id: `task-${task.id}`,
        title: task.title,
        subtitle: task.type?.replace(/_/g, ' '),
        date: new Date(task.due_date),
        type: 'task',
        priority: task.priority,
        status: task.status,
      });
    }
  });

  // Scholarship deadlines
  scholarships.forEach(scholarship => {
    if (scholarship.application_deadline && !isPast(new Date(scholarship.application_deadline))) {
      deadlines.push({
        id: `scholarship-${scholarship.id}`,
        title: scholarship.scholarship_name,
        subtitle: 'Scholarship Application',
        date: new Date(scholarship.application_deadline),
        type: 'scholarship',
        status: 'pending',
      });
    }
  });

  // Sort by date (earliest first)
  deadlines.sort((a, b) => a.date - b.date);

  // Get urgency level
  const getUrgency = (date) => {
    const days = differenceInDays(date, new Date());
    if (days <= 3) return { level: 'critical', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
    if (days <= 7) return { level: 'high', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' };
    if (days <= 14) return { level: 'medium', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
    return { level: 'low', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' };
  };

  const getDeadlineIcon = (type) => {
    switch(type) {
      case 'offer': return CheckCircle2;
      case 'visa': return Calendar;
      case 'task': return Clock;
      case 'scholarship': return AlertCircle;
      default: return Calendar;
    }
  };

  // Calculate overall progress (tasks + applications)
  const totalItems = applications.length + tasks.length;
  const completedItems = applications.filter(a => a.status === 'enrolled').length + 
                         tasks.filter(t => t.status === 'completed').length;
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Important Deadlines
        </CardTitle>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Overall Progress</span>
            <span className="text-sm font-semibold text-slate-900">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-600 text-sm">No upcoming deadlines</p>
            <p className="text-slate-500 text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deadlines.slice(0, 5).map(deadline => {
              const urgency = getUrgency(deadline.date);
              const daysLeft = differenceInDays(deadline.date, new Date());
              const DeadlineIcon = getDeadlineIcon(deadline.type);
              
              return (
                <div 
                  key={deadline.id} 
                  className={`p-4 rounded-lg border ${urgency.bg} border-${urgency.color.replace('bg-', '')}/20`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${urgency.color} flex items-center justify-center flex-shrink-0`}>
                      <DeadlineIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                        {deadline.title}
                      </h4>
                      <p className="text-xs text-slate-600 mb-2">{deadline.subtitle}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(deadline.date, 'MMM d, yyyy')}
                        </Badge>
                        <Badge className={`${urgency.color} text-white text-xs`}>
                          {isToday(deadline.date) ? 'Today!' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                        </Badge>
                        {deadline.priority && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {deadline.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {deadlines.length > 5 && (
              <p className="text-center text-sm text-slate-500 pt-2">
                +{deadlines.length - 5} more deadline{deadlines.length - 5 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}