import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone, Video, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function CommunicationHistory({ studentId }) {
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['student-comms-history', studentId],
    queryFn: () => base44.entities.CommunicationHistory.filter({ student_id: studentId }, '-created_date', 10),
    enabled: !!studentId
  });

  const getTypeIcon = (type) => {
    switch(type) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'video_call': return Video;
      case 'chat': return MessageSquare;
      default: return FileText;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      case 'neutral': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Recent Communications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : communications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm">No communications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {communications.map(comm => {
              const TypeIcon = getTypeIcon(comm.communication_type);
              
              return (
                <div key={comm.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <TypeIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {comm.subject || comm.summary || 'Communication'}
                        </p>
                        <span className="text-xs text-slate-500 shrink-0 ml-2">
                          {format(new Date(comm.created_date), 'MMM d')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {comm.sentiment && (
                          <Badge className={`${getSentimentColor(comm.sentiment)} text-xs`}>
                            {comm.sentiment}
                          </Badge>
                        )}
                        {comm.concerns && comm.concerns.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {comm.concerns.length} concern{comm.concerns.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      {comm.concerns && comm.concerns.length > 0 && (
                        <p className="text-xs text-slate-600 mt-2">
                          Concerns: {comm.concerns.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}