import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Send, MessageCircle, MessageSquare, Clock, AlertCircle, 
  ChevronDown, Search, Plus
} from 'lucide-react';

export default function InAppMessaging() {
  const [userType, setUserType] = useState('student'); // student, counselor, partner
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('chat'); // chat or thread
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const msgs = await base44.entities.DirectMessage.filter({
        conversation_id: selectedConversation.id
      });
      return msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!selectedConversation,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['user-conversations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const msgs = await base44.entities.DirectMessage.list();
      const convos = {};
      msgs.forEach(msg => {
        if (msg.conversation_id) {
          if (!convos[msg.conversation_id]) {
            convos[msg.conversation_id] = {
              id: msg.conversation_id,
              participants: new Set(),
              lastMessage: msg,
              unreadCount: 0,
            };
          }
          convos[msg.conversation_id].participants.add(msg.sender_name);
          if (!msg.is_read && msg.recipient_id !== user.email) {
            convos[msg.conversation_id].unreadCount++;
          }
        }
      });
      return Object.values(convos);
    },
    enabled: !!user?.email,
  });

  const sendMessage = useMutation({
    mutationFn: async (messageData) => {
      return base44.entities.DirectMessage.create({
        conversation_id: selectedConversation?.id || `conv_${Date.now()}`,
        sender_type: userType,
        sender_id: user?.id,
        sender_name: user?.full_name,
        recipient_type: selectedConversation?.recipientType || 'counselor',
        recipient_id: selectedConversation?.recipientId,
        message_type: messageType,
        content: messageContent,
        is_urgent: false,
        is_read: false,
      });
    },
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      queryClient.invalidateQueries({ queryKey: ['user-conversations'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(conv =>
    conv.lastMessage?.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Array.from(conv.participants).join(', ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Messages</h1>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations Sidebar */}
          <Card className="border-0 shadow-sm lg:col-span-1 flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left p-3 hover:bg-slate-50 transition-colors border-l-4 ${
                        selectedConversation?.id === conv.id
                          ? 'border-education-blue bg-blue-50'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {conv.lastMessage?.sender_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {conv.lastMessage?.content}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-alo-orange text-white text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="border-0 shadow-sm lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedConversation.lastMessage?.sender_name}</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">
                        {Array.from(selectedConversation.participants).join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {messageType === 'chat' ? 'Real-time Chat' : 'Thread'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-3 rounded-lg ${
                            msg.sender_id === user?.id
                              ? 'bg-education-blue text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="text-xs font-medium opacity-75 mb-1">
                            {msg.sender_name}
                          </p>
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_id === user?.id
                              ? 'text-white/70'
                              : 'text-slate-500'
                          }`}>
                            {new Date(msg.created_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4 space-y-3">
                  <div className="flex gap-2">
                    <Badge
                      variant={messageType === 'chat' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setMessageType('chat')}
                    >
                      Chat
                    </Badge>
                    <Badge
                      variant={messageType === 'thread' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setMessageType('thread')}
                    >
                      Thread
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage.mutate();
                        }
                      }}
                      className="resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={() => sendMessage.mutate()}
                      disabled={!messageContent.trim() || sendMessage.isPending}
                      className="bg-education-blue hover:bg-blue-700 h-fit"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}