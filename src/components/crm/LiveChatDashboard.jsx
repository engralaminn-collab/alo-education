import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User, Clock, CheckCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function LiveChatDashboard() {
  const queryClient = useQueryClient();
  const [selectedConv, setSelectedConv] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['all-chat-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 500),
    refetchInterval: 5000,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-list'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  // Group messages by conversation
  const conversations = {};
  allMessages.forEach(msg => {
    if (!conversations[msg.conversation_id]) {
      conversations[msg.conversation_id] = [];
    }
    conversations[msg.conversation_id].push(msg);
  });

  const convList = Object.entries(conversations).map(([convId, msgs]) => {
    const lastMessage = msgs[msgs.length - 1];
    const unreadCount = msgs.filter(m => m.sender_type === 'student' && !m.is_read).length;
    const studentMsg = msgs.find(m => m.sender_id);
    const student = students.find(s => s.id === studentMsg?.sender_id || s.email === studentMsg?.sender_id);

    return {
      id: convId,
      messages: msgs,
      lastMessage,
      unreadCount,
      student,
      lastActive: lastMessage.created_date
    };
  }).sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

  const sendReply = useMutation({
    mutationFn: async (content) => {
      const studentMsg = selectedConv.messages.find(m => m.sender_type === 'student');
      
      const reply = await base44.entities.Message.create({
        conversation_id: selectedConv.id,
        sender_id: user.id,
        sender_type: 'counselor',
        recipient_id: studentMsg.sender_id,
        content
      });

      // Mark student messages as read
      for (const msg of selectedConv.messages.filter(m => m.sender_type === 'student' && !m.is_read)) {
        await base44.entities.Message.update(msg.id, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      }

      return reply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
      setReplyText('');
      toast.success('Reply sent!');
    }
  });

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Live Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {convList.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                  selectedConv?.id === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {conv.student?.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {conv.student ? `${conv.student.first_name} ${conv.student.last_name}` : 'Guest User'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(conv.lastActive), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {conv.lastMessage.content}
                </p>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-2">
        {selectedConv ? (
          <>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between">
                <div>
                  <p className="text-lg">
                    {selectedConv.student ? `${selectedConv.student.first_name} ${selectedConv.student.last_name}` : 'Guest User'}
                  </p>
                  <p className="text-sm font-normal text-slate-600">
                    {selectedConv.student?.email}
                  </p>
                </div>
                {selectedConv.student && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    {selectedConv.student.status || 'new_lead'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-3">
                  {selectedConv.messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex ${msg.sender_type === 'student' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.sender_type === 'student'
                            ? 'bg-slate-100 text-slate-900'
                            : msg.sender_type === 'system'
                            ? 'bg-blue-50 text-blue-900 text-center'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs opacity-70">
                            {format(new Date(msg.created_date), 'h:mm a')}
                          </p>
                          {msg.sender_type === 'counselor' && msg.is_read && (
                            <CheckCheck className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (replyText.trim()) sendReply.mutate(replyText);
                      }
                    }}
                  />
                  <Button
                    onClick={() => sendReply.mutate(replyText)}
                    disabled={!replyText.trim() || sendReply.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 shrink-0"
                  >
                    {sendReply.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-12 text-center">
            <div>
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}