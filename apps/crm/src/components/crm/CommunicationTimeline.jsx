import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone, User, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function CommunicationTimeline({ studentId }) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['communication-history', studentId],
    queryFn: () => base44.entities.CommunicationHistory.filter(
      { student_id: studentId }, 
      '-created_date', 
      50
    ),
    enabled: !!studentId
  });

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'urgent': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-600" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      case 'urgent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-600">Loading...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600">No communication history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((comm, idx) => (
        <div key={comm.id} className="relative">
          {idx !== history.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-px bg-slate-200" />
          )}
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 flex-shrink-0">
                  {getTypeIcon(comm.communication_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getSentimentColor(comm.ai_analysis?.sentiment)}>
                      {getSentimentIcon(comm.ai_analysis?.sentiment)}
                      <span className="ml-1">{comm.ai_analysis?.sentiment}</span>
                    </Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(comm.created_date), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 mb-3">
                    {comm.content.substring(0, 200)}
                    {comm.content.length > 200 && '...'}
                  </p>

                  {comm.ai_analysis?.concerns?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Concerns:</p>
                      <div className="flex flex-wrap gap-1">
                        {comm.ai_analysis.concerns.map((concern, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {comm.ai_analysis?.action_items?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Action Items:</p>
                      <ul className="space-y-1">
                        {comm.ai_analysis.action_items.map((item, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {comm.tasks_created?.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700">
                      {comm.tasks_created.length} task{comm.tasks_created.length > 1 ? 's' : ''} created
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}