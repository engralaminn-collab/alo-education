import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, Bot, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentChatbot({ studentId, context = 'general' }) {
  const [conversationId, setConversationId] = useState(null);
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['chatbot-messages', conversationId],
    queryFn: () => base44.entities.ChatbotMessage.filter({ conversation_id: conversationId }),
    enabled: !!conversationId,
    refetchInterval: 3000
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const conv = await base44.entities.ChatbotConversation.create({
        student_id: studentId,
        conversation_context: context,
        status: 'active'
      });
      return conv;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      setIsOpen(true);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg) => {
      const { data } = await base44.functions.invoke('chatbotResponse', {
        conversation_id: conversationId,
        message: msg,
        student_id: studentId,
        context
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-messages'] });
      setMessage('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => {
          if (!conversationId) {
            createConversationMutation.mutate();
          } else {
            setIsOpen(true);
          }
        }}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg bg-purple-600 hover:bg-purple-700 z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="bg-purple-600 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-5 h-5" />
            ALO Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-purple-700">
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-slate-600 py-8">
              <Bot className="w-12 h-12 mx-auto mb-2 text-purple-600" />
              <p className="text-sm">Hi! I'm your ALO assistant. How can I help you today?</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-100 text-slate-900'
              }`}>
                <div className="flex items-start gap-2">
                  {msg.role !== 'user' && <Bot className="w-4 h-4 mt-1" />}
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
          
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Escalation Notice */}
        {messages.some(m => m.message.includes('counselor')) && (
          <div className="px-4 py-2 bg-orange-50 border-t border-orange-200">
            <div className="flex items-center gap-2 text-xs text-orange-800">
              <AlertCircle className="w-4 h-4" />
              A counselor will reach out soon for personalized assistance
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}