import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, Calendar, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

export default function CounsellorChatHistory({ studentProfile }) {
  const { data: messages = [] } = useQuery({
    queryKey: ['recent-messages', studentProfile?.id],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.filter({ 
        recipient_id: studentProfile?.id 
      });
      return allMessages.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ).slice(0, 5);
    },
    enabled: !!studentProfile?.id,
  });

  const { data: counselor } = useQuery({
    queryKey: ['counselor', studentProfile?.counselor_id],
    queryFn: async () => {
      if (!studentProfile?.counselor_id) return null;
      const counselors = await base44.entities.Counselor.filter({ 
        id: studentProfile.counselor_id 
      });
      return counselors[0];
    },
    enabled: !!studentProfile?.counselor_id,
  });

  const unreadCount = messages.filter(m => !m.is_read && m.sender_type === 'counselor').length;

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
            <MessageSquare className="w-5 h-5" />
            Counsellor Chat History
          </CardTitle>
          {unreadCount > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
              {unreadCount} new
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {counselor && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#0066CC' }}>
                {counselor.name?.[0] || 'C'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{counselor.name}</h3>
                <p className="text-sm text-slate-600">{counselor.specializations?.[0] || 'Education Counselor'}</p>
              </div>
            </div>
            <Link to={createPageUrl('Messages')}>
              <Button className="w-full" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                <Send className="w-4 h-4 mr-2" />
                Send New Message
              </Button>
            </Link>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">No messages yet</p>
            <p className="text-slate-400 text-xs">
              Start a conversation with your counselor
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`p-3 rounded-lg border ${!message.is_read && message.sender_type === 'counselor' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${message.sender_type === 'counselor' ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                      {message.sender_type === 'counselor' ? 'C' : 'You'}
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      {message.sender_type === 'counselor' ? 'Counselor' : 'You'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-2">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link to={createPageUrl('Messages')}>
          <Button variant="outline" className="w-full">
            View All Messages
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

        {studentProfile?.counselor_id && (
          <Link to={createPageUrl('AppointmentScheduler')}>
            <Button variant="outline" className="w-full" style={{ borderColor: '#0066CC', color: '#0066CC' }}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}