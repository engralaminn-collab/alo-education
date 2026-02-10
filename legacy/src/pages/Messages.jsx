import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Paperclip, Search, MessageSquare, User, 
  Clock, CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', studentProfile?.id],
    queryFn: () => base44.entities.Message.filter({ 
      conversation_id: studentProfile?.id 
    }, 'created_date'),
    enabled: !!studentProfile?.id,
    refetchInterval: 5000,
  });

  const sendMessage = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText('');
    },
  });

  const handleSend = () => {
    if (!messageText.trim() || !studentProfile) return;
    
    sendMessage.mutate({
      conversation_id: studentProfile.id,
      sender_id: studentProfile.id,
      sender_type: 'student',
      recipient_id: studentProfile.counselor_id || 'support',
      content: messageText.trim(),
    });
  };

  const assignedCounselor = counselors.find(c => c.id === studentProfile?.counselor_id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-slate-300">Chat with your counselor and support team</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-300px)] min-h-[500px]">
          {/* Conversations List */}
          <Card className="border-0 shadow-sm lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-2">
              {assignedCounselor ? (
                <div
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedConversation === assignedCounselor.id
                      ? 'bg-emerald-50 border-2 border-emerald-500'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedConversation(assignedCounselor.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {assignedCounselor.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900">{assignedCounselor.name}</h4>
                      <p className="text-sm text-slate-500 truncate">Your assigned counselor</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 shrink-0">
                      Counselor
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Support Team</h4>
                      <p className="text-sm text-slate-500">No counselor assigned yet</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="border-0 shadow-sm lg:col-span-2 flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {assignedCounselor?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-semibold">{assignedCounselor?.name || 'Support Team'}</h4>
                  <p className="text-xs text-slate-500">Usually responds within 24 hours</p>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Start a Conversation</h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    Send a message to your counselor or support team. They'll get back to you soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isOwn = msg.sender_id === studentProfile?.id;
                      
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                              isOwn 
                                ? 'bg-emerald-500 text-white rounded-br-md' 
                                : 'bg-white border border-slate-200 rounded-bl-md'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-slate-400 ${
                              isOwn ? 'justify-end' : ''
                            }`}>
                              <Clock className="w-3 h-3" />
                              {msg.created_date && format(new Date(msg.created_date), 'h:mm a')}
                              {isOwn && <CheckCheck className="w-3 h-3 ml-1" />}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="w-5 h-5 text-slate-400" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMessage.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}