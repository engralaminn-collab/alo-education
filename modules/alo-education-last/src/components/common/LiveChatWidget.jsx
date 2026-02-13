import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X, Send, Loader2, User, Calendar, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: () => base44.entities.StudentProfile.filter({ email: user.email }),
    enabled: !!user?.email,
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['available-counselors'],
    queryFn: () => base44.entities.Counselor.filter({ is_available: true, status: 'active' }),
  });

  const availableCounselor = counselors[0];

  // Generate or get conversation ID
  useEffect(() => {
    if ((user || (guestInfo.name && guestInfo.email)) && !conversationId) {
      const id = user 
        ? `conv_${user.id}_${Date.now()}`
        : `conv_guest_${Date.now()}`;
      setConversationId(id);
    }
  }, [user, guestInfo, conversationId]);

  // Fetch messages
  const { data: fetchedMessages = [] } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversationId }),
    enabled: !!conversationId && !!user,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  useEffect(() => {
    if (fetchedMessages.length > 0) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (content) => {
      const messageData = {
        conversation_id: conversationId,
        sender_id: user?.id || guestInfo.email,
        sender_type: 'student',
        recipient_id: availableCounselor?.user_id || 'support',
        content,
      };
      return base44.entities.Message.create(messageData);
    },
    onSuccess: (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    sendMessage.mutate(userMessage);
  };

  const handleGuestStart = () => {
    if (guestInfo.name && guestInfo.email) {
      setIsNewUser(false);
      // Send welcome message
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi ${guestInfo.name}! 👋 Welcome to ALO Education. I'm here to help you with your study abroad journey. How can I assist you today?`,
        sender_type: 'system',
      }]);
    }
  };

  // Check if user needs to provide info
  useEffect(() => {
    if (!user && isOpen && messages.length === 0) {
      setIsNewUser(true);
    } else if (user && isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi${user.full_name ? ' ' + user.full_name : ''}! 👋 Welcome to ALO Education Live Chat. I'm here to help you with your study abroad journey. How can I assist you today?`,
        sender_type: 'system',
      }]);
    }
  }, [user, isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-2xl flex items-center justify-center"
      >
        <MessageCircle className="w-7 h-7" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">ALO Education</h3>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    {availableCounselor ? availableCounselor.name : 'Support Team'} • Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Info Form */}
            {isNewUser ? (
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Start a conversation</h3>
                  <p className="text-sm text-slate-500 mb-4">Please provide your details to chat with our counsellors</p>
                </div>
                <div>
                  <Input
                    placeholder="Your Name"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleGuestStart}
                  disabled={!guestInfo.name || !guestInfo.email}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                >
                  Start Chat
                </Button>
                <div className="text-center">
                  <button 
                    onClick={() => base44.auth.redirectToLogin()}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex ${msg.sender_type === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.sender_type === 'student'
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                            : 'bg-white text-slate-900 shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {sendMessage.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-3 bg-white border-t border-slate-100">
                  <div className="flex gap-2 mb-3">
                    <Link to={createPageUrl('Contact')} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Book Consultation
                      </Button>
                    </Link>
                    {availableCounselor?.phone && (
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Phone className="w-3 h-3 mr-1" />
                        Call Now
                      </Button>
                    )}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-200">
                  <div className="flex gap-2">
                    <Textarea
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type your message..."
                      className="resize-none"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || sendMessage.isPending}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 shrink-0"
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}