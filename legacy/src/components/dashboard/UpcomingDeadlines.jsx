import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays } from 'date-fns';

export default function UpcomingDeadlines({ studentId }) {
  const { data: applications = [] } = useQuery({
    queryKey: ['student-apps-deadlines', studentId],
    queryFn: () => base44.entities.Application.filter({ student_id: studentId }),
    enabled: !!studentId
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['student-tasks', studentId],
    queryFn: () => base44.entities.Task.filter({ 
      student_id: studentId,
      status: { $ne: 'completed' }
    }, 'due_date'),
    enabled: !!studentId
  });

  const deadlines = [];

  // Add application deadlines
  applications.forEach(app => {
    if (app.offer_deadline && new Date(app.offer_deadline) > new Date()) {
      deadlines.push({
        type: 'application',
        date: app.offer_deadline,
        title: 'Application Offer Deadline',
        description: `Accept or decline offer`,
        status: app.status,
        id: app.id
      });
    }
  });

  // Add task deadlines
  tasks.forEach(task => {
    if (task.due_date && new Date(task.due_date) > new Date()) {
      deadlines.push({
        type: 'task',
        date: task.due_date,
        title: task.title,
        description: task.description,
        priority: task.priority,
        id: task.id
      });
    }
  });

  // Sort by date
  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = deadlines.slice(0, 5);

  const getUrgencyColor = (date) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days <= 3) return 'bg-red-100 text-red-700 border-red-300';
    if (days <= 7) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm">No upcoming deadlines</p>
          </div>
        ) : (
          <>
            {upcoming.map((deadline, idx) => {
              const daysLeft = differenceInDays(new Date(deadline.date), new Date());
              
              return (
                <div
                  key={`${deadline.type}-${deadline.id}`}
                  className={`p-3 rounded-lg border ${getUrgencyColor(deadline.date)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm mb-1">{deadline.title}</h5>
                      <p className="text-xs opacity-80 line-clamp-1">
                        {deadline.description}
                      </p>
                    </div>
                    {daysLeft <= 3 && (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {format(new Date(deadline.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {daysLeft} days left
                    </Badge>
                  </div>
                </div>
              );
            })}

            <Button asChild variant="outline" className="w-full mt-2">
              <Link to={createPageUrl('MyApplications')}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}