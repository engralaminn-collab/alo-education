import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, Send, Loader2, User, 
  Check, CheckCheck, Clock, Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function RealTimeChat({ studentId, counselorId }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationId] = useState(`student-${studentId}-counselor-${counselorId || 'unassigned'}`);

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ conversation_id: conversationId }, '-created_date');
      return msgs.reverse();
    },
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Get counselor info
  const { data: counselor } = useQuery({
    queryKey: ['counselor-chat', counselorId],
    queryFn: async () => {
      if (!counselorId) return null;
      const counselors = await base44.entities.Counselor.filter({ user_id: counselorId });
      return counselors[0];
    },
    enabled: !!counselorId,
  });

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-chat'],
    queryFn: () => base44.auth.me(),
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content) => {
      const newMessage = await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        sender_type: 'student',
        recipient_id: counselorId || 'unassigned',
        content: content,
        is_read: false
      });

      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
      setMessage('');
      scrollToBottom();
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (messageIds) => {
      await Promise.all(
        messageIds.map(id => 
          base44.entities.Message.update(id, { is_read: true, read_at: new Date().toISOString() })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
    }
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    const unreadMessages = messages.filter(m => 
      !m.is_read && m.sender_type !== 'student' && m.sender_id !== currentUser?.id
    );
    
    if (unreadMessages.length > 0) {
      markAsRead.mutate(unreadMessages.map(m => m.id));
    }
  }, [messages, currentUser]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupMessagesByDate = (msgs) => {
    const grouped = {};
    msgs.forEach(msg => {
      const date = format(new Date(msg.created_date), 'yyyy-MM-dd');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Card className="shadow-lg flex flex-col h-[600px]">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-cyan-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10 bg-emerald-100 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">
              {counselor ? counselor.name : 'Your Counselor'}
            </CardTitle>
            <p className="text-xs text-slate-500">
              {isTyping ? (
                <span className="text-emerald-600 font-medium">Typing...</span>
              ) : (
                'Active now'
              )}
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <MessageCircle className="w-3 h-3" />
            Chat
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center justify-center my-4">
              <Badge variant="outline" className="text-xs">
                {format(new Date(date), 'MMMM d, yyyy')}
              </Badge>
            </div>

            <AnimatePresence>
              {msgs.map((msg, idx) => {
                const isOwn = msg.sender_type === 'student' && msg.sender_id === currentUser?.id;
                const showAvatar = idx === 0 || msgs[idx - 1].sender_id !== msg.sender_id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && showAvatar && (
                      <Avatar className="w-8 h-8 bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-slate-400" />
                      </Avatar>
                    )}
                    {!isOwn && !showAvatar && <div className="w-8" />}

                    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-emerald-600 text-white rounded-br-sm'
                            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-xs text-slate-400">
                          {format(new Date(msg.created_date), 'h:mm a')}
                        </span>
                        {isOwn && (
                          msg.is_read ? (
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Check className="w-3 h-3 text-slate-400" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Start a conversation</h3>
            <p className="text-sm text-slate-500">
              Send a message to your counselor for instant support
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4 bg-slate-50">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="pr-10 resize-none"
              disabled={sendMessage.isPending}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => toast.info('File upload coming soon!')}
            >
              <Paperclip className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
            size="icon"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </Card>
  );
}