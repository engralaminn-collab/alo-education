import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export default function UpcomingDeadlines({ tasks, applications }) {
  const upcomingItems = [];

  // Add tasks with deadlines
  tasks.forEach(task => {
    if (task.deadline && task.status !== 'completed') {
      const deadline = new Date(task.deadline);
      const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil >= 0 && daysUntil <= 30) {
        upcomingItems.push({
          type: 'task',
          title: task.title,
          deadline,
          daysUntil,
          priority: task.priority || 'medium'
        });
      }
    }
  });

  // Add application deadlines
  applications.forEach(app => {
    if (app.applied_date) {
      const appliedDate = new Date(app.applied_date);
      const expectedDecision = new Date(appliedDate);
      expectedDecision.setDate(expectedDecision.getDate() + 60); // Assume 60 days for decision
      
      const daysUntil = Math.ceil((expectedDecision - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil >= 0 && daysUntil <= 30 && app.status === 'applied') {
        upcomingItems.push({
          type: 'application',
          title: `Expected decision: ${app.study_level} Application`,
          deadline: expectedDecision,
          daysUntil,
          priority: 'high'
        });
      }
    }
  });

  // Sort by deadline
  upcomingItems.sort((a, b) => a.deadline - b.deadline);

  const getPriorityColor = (daysUntil) => {
    if (daysUntil <= 3) return 'text-red-600 bg-red-50';
    if (daysUntil <= 7) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingItems.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingItems.slice(0, 5).map((item, index) => (
              <div key={index} className={`p-3 rounded-lg ${getPriorityColor(item.daysUntil)}`}>
                <div className="flex items-start gap-2">
                  {item.daysUntil <= 3 && (
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.title}</p>
                    <p className="text-xs mt-1">
                      {item.deadline.toLocaleDateString()} • {item.daysUntil} day{item.daysUntil !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {item.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}