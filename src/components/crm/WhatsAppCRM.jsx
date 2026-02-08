import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Search, Send, Paperclip, Phone, Video, MoreVertical, X } from 'lucide-react';
import { toast } from 'sonner';

export default function WhatsAppCRM() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['whatsapp-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get conversations assigned to current counselor or unassigned
      const allConversations = await base44.entities.WhatsAppConversation.list();
      return allConversations.filter(c => 
        c.assigned_counselor_id === user.id || !c.assigned_counselor_id
      );
    },
    enabled: !!user
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['whatsapp-messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const allMessages = await base44.entities.WhatsAppMessage.list();
      return allMessages
        .filter(m => m.conversation_id === selectedConversation.id)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!selectedConversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.WhatsAppMessage.create(messageData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['whatsapp-messages', selectedConversation?.id]);
      
      // Update conversation last_message_at
      if (selectedConversation) {
        await base44.entities.WhatsAppConversation.update(selectedConversation.id, {
          last_message_at: new Date().toISOString()
        });
        queryClient.invalidateQueries(['whatsapp-conversations']);
      }
      
      setMessageText('');
      toast.success('Message sent');
    },
    onError: (error) => {
      toast.error('Failed to send message');
    }
  });

  // Mark as read when conversation is opened
  useEffect(() => {
    if (selectedConversation && selectedConversation.unread_count > 0) {
      base44.entities.WhatsAppConversation.update(selectedConversation.id, {
        unread_count: 0
      });
      queryClient.invalidateQueries(['whatsapp-conversations']);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversation_id: selectedConversation.id,
      sender_type: 'counselor',
      sender_id: user.id,
      message_text: messageText.trim(),
      delivery_status: 'sent'
    });
  };

  const filteredConversations = conversations.filter(c =>
    c.whatsapp_number?.includes(searchQuery) ||
    searchQuery === ''
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-green-600 text-white flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {conversation.whatsapp_number?.slice(-2)}
                      </span>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {conversation.whatsapp_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conversation.last_message_at 
                          ? new Date(conversation.last_message_at).toLocaleTimeString()
                          : 'No messages'}
                      </p>
                    </div>
                  </div>
                  {conversation.unread_count > 0 && (
                    <Badge className="bg-green-600">{conversation.unread_count}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-green-600 text-white flex items-center justify-center">
                  <span className="font-semibold">
                    {selectedConversation.whatsapp_number?.slice(-2)}
                  </span>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedConversation.whatsapp_number}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {selectedConversation.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => {
                  const isCounselor = message.sender_type === 'counselor';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCounselor ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isCounselor
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
                        <p className={`text-xs mt-1 ${isCounselor ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(message.created_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Textarea
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[60px] max-h-32"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ This is a secure CRM chat. All messages are logged and cannot be exported.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a WhatsApp conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}