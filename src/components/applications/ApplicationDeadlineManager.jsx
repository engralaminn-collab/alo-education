import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function ApplicationDeadlineManager({ applications, students, universities }) {
  const upcomingDeadlines = applications
    .filter(app => app.offer_deadline && !['enrolled', 'rejected', 'withdrawn'].includes(app.status))
    .map(app => ({
      ...app,
      daysLeft: differenceInDays(new Date(app.offer_deadline), new Date()),
      student: students.find(s => s.id === app.student_id),
      university: universities.find(u => u.id === app.university_id)
    }))
    .filter(app => app.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 7) return 'bg-red-100 text-red-700 border-red-300';
    if (daysLeft <= 14) return 'bg-orange-100 text-orange-700 border-orange-300';
    if (daysLeft <= 30) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No upcoming deadlines</p>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 10).map(app => (
              <div key={app.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {app.student?.first_name} {app.student?.last_name}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {app.university?.university_name || app.university?.name}
                    </p>
                  </div>
                  <Badge className={getUrgencyColor(app.daysLeft)}>
                    {app.daysLeft === 0 ? 'Today' : `${app.daysLeft} days`}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(app.offer_deadline), 'MMM d, yyyy')}
                  {app.daysLeft <= 7 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}