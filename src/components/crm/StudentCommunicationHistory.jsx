import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentCommunicationHistory({ student }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['communication-logs', student.id],
    queryFn: () => base44.entities.CommunicationLog.filter({ student_id: student.id }, '-created_date', 50),
  });

  const getSentimentColor = (sentiment) => {
    const s = sentiment?.toLowerCase();
    if (s?.includes('positive') || s?.includes('excited')) return 'bg-green-100 text-green-800 border-green-300';
    if (s?.includes('negative') || s?.includes('frustrated')) return 'bg-red-100 text-red-800 border-red-300';
    if (s?.includes('anxious')) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency?.toLowerCase()) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Communication History ({logs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No communications logged yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white rounded-lg border-2 border-slate-200 p-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <p className="text-xs text-slate-600">
                        {format(new Date(log.created_date), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSentimentColor(log.sentiment)}>
                        {log.sentiment}
                      </Badge>
                      <Badge className={getUrgencyColor(log.urgency_level)}>
                        {log.urgency_level}
                      </Badge>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm font-medium text-slate-900 mb-3">{log.summary}</p>

                  {/* Student Concerns */}
                  {log.student_concerns?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Student Concerns:</p>
                      <div className="space-y-1">
                        {log.student_concerns.map((concern, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-slate-600">{concern}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Counselor Actions */}
                  {log.counselor_actions?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Counselor Actions:</p>
                      <div className="space-y-1">
                        {log.counselor_actions.map((action, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-slate-600">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Auto-Generated Items */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                    {log.tasks_created?.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {log.tasks_created.length} task{log.tasks_created.length > 1 ? 's' : ''} created
                      </Badge>
                    )}
                    {log.status_change && (
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Status: {log.status_change.from} → {log.status_change.to}
                      </Badge>
                    )}
                    {log.follow_up_needed && (
                      <Badge variant="outline" className="text-xs bg-orange-50">
                        Follow-up required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}