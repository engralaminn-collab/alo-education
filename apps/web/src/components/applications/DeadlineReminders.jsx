import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

export default function DeadlineReminders({ applications }) {
  const upcomingDeadlines = applications
    .filter(app => app.offer_deadline || app.milestones)
    .map(app => {
      const deadlines = [];
      
      if (app.offer_deadline) {
        const daysUntil = differenceInDays(new Date(app.offer_deadline), new Date());
        deadlines.push({
          type: 'Offer Response',
          date: app.offer_deadline,
          daysUntil,
          applicationId: app.id,
          urgent: daysUntil <= 7
        });
      }
      
      return { application: app, deadlines };
    })
    .filter(item => item.deadlines.length > 0)
    .sort((a, b) => {
      const aMin = Math.min(...a.deadlines.map(d => d.daysUntil));
      const bMin = Math.min(...b.deadlines.map(d => d.daysUntil));
      return aMin - bMin;
    });

  const urgentDeadlines = upcomingDeadlines.filter(item => 
    item.deadlines.some(d => d.urgent)
  );

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Bell className="w-5 h-5" />
          Deadline Reminders
          {urgentDeadlines.length > 0 && (
            <Badge className="ml-auto bg-red-500 text-white">
              {urgentDeadlines.length} Urgent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {urgentDeadlines.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Urgent:</strong> You have {urgentDeadlines.length} deadline(s) within the next 7 days!
            </AlertDescription>
          </Alert>
        )}

        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 5).map((item, idx) => (
              <div key={idx} className="space-y-2">
                {item.deadlines.map((deadline, dIdx) => {
                  const isUrgent = deadline.daysUntil <= 7;
                  const isOverdue = deadline.daysUntil < 0;
                  
                  return (
                    <div 
                      key={dIdx}
                      className={`p-3 rounded-lg border-2 ${
                        isOverdue 
                          ? 'bg-red-50 border-red-300' 
                          : isUrgent 
                          ? 'bg-amber-50 border-amber-300' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className={`w-4 h-4 ${
                              isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-slate-600'
                            }`} />
                            <span className="font-semibold text-sm text-slate-900">
                              {deadline.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {format(new Date(deadline.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={
                          isOverdue 
                            ? 'bg-red-500 text-white' 
                            : isUrgent 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-blue-500 text-white'
                        }>
                          {isOverdue 
                            ? `${Math.abs(deadline.daysUntil)} days overdue` 
                            : deadline.daysUntil === 0 
                            ? 'Today' 
                            : deadline.daysUntil === 1 
                            ? 'Tomorrow' 
                            : `${deadline.daysUntil} days`
                          }
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}