import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, Paperclip, Loader2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function RealTimeChat({ conversationId, recipientId, recipientName, recipientType = 'counselor' }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: () => base44.entities.DirectMessage.filter({ conversation_id: conversationId }, '-created_date'),
    enabled: !!conversationId
  });

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
        
        // Auto-scroll to bottom on new message
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      }
    });

    return () => unsubscribe();
  }, [conversationId, queryClient]);

  // Auto-scroll on mount and new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (content) => {
      return base44.entities.DirectMessage.create({
        conversation_id: conversationId,
        sender_type: user?.role === 'admin' ? 'counselor' : 'student',
        sender_id: user?.id,
        sender_name: user?.full_name || user?.email,
        recipient_type: recipientType,
        recipient_id: recipientId,
        recipient_name: recipientName,
        message_type: 'chat',
        content,
        is_read: false
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="border-0 shadow-sm dark:bg-slate-800 flex flex-col h-[600px]">
      <CardHeader className="border-b dark:border-slate-700">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-education-blue" />
          <div>
            <CardTitle className="text-base dark:text-white">{recipientName}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isTyping ? 'typing...' : 'Online'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={isOwn ? 'bg-education-blue text-white' : 'bg-slate-200 dark:bg-slate-700'}>
                        {msg.sender_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-education-blue text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 px-2">
                        {format(new Date(msg.created_date), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t dark:border-slate-700 p-4">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="shrink-0 dark:bg-slate-700 select-none">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 dark:bg-slate-700"
              disabled={sendMessage.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
              className="bg-education-blue shrink-0 select-none"
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}