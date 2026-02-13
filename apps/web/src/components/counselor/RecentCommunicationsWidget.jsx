import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RecentCommunicationsWidget({ counselorId, limit = 5 }) {
  const { data: messages = [] } = useQuery({
    queryKey: ['recent-communications', counselorId],
    queryFn: async () => {
      const allMessages = await base44.entities.DirectMessage.filter({ 
        sender_id: counselorId 
      });
      
      // Get unique conversations and their latest message
      const conversations = {};
      allMessages.forEach(msg => {
        if (!conversations[msg.conversation_id] || 
            new Date(msg.created_date) > new Date(conversations[msg.conversation_id].created_date)) {
          conversations[msg.conversation_id] = msg;
        }
      });
      
      return Object.values(conversations)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, limit);
    },
    enabled: !!counselorId,
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Recent Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No recent messages</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {msg.recipient_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">
                      {msg.recipient_name}
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {msg.content}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs h-8">
              View All Messages
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}