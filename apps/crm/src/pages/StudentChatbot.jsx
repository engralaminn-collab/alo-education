import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentChatbot() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Create conversation
  const createConversation = useMutation({
    mutationFn: async () => {
      const conversation = await base44.agents.createConversation({
        agent_name: 'student_chatbot',
        metadata: {
          name: 'Course Advising Chat',
          description: 'Academic advising and course recommendations'
        }
      });
      return conversation;
    },
    onSuccess: (conversation) => {
      setConversationId(conversation.id);
      setMessages(conversation.messages || []);
    }
  });

  // Initialize conversation on mount
  useEffect(() => {
    createConversation.mutate();
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setIsTyping(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = useMutation({
    mutationFn: async (message) => {
      if (!conversationId) return;
      
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: message
      });
    },
    onSuccess: () => {
      setInputMessage('');
      setIsTyping(true);
    }
  });

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMessage.mutate(inputMessage);
  };

  const quickActions = [
    { label: 'Recommend courses', icon: BookOpen },
    { label: 'Explain prerequisites', icon: GraduationCap },
    { label: 'Career paths', icon: Sparkles },
    { label: 'Application help', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[calc(100vh-8rem)]">
          <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600">
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              AI Academic Advisor
            </CardTitle>
            <p className="text-sm text-blue-100 mt-1">
              Get personalized course recommendations and academic guidance
            </p>
          </CardHeader>

          <CardContent className="flex flex-col h-[calc(100%-8rem)] p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Welcome to Your AI Academic Advisor!
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    I can help you explore courses, understand requirements, and find the perfect program for your goals.
                  </p>

                  <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                    {quickActions.map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => sendMessage.mutate(action.label)}
                          className="flex items-center gap-2 p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-900'
                    }`}
                  >
                    {message.content && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about courses, requirements, career paths..."
                  className="flex-1"
                  disabled={!conversationId || sendMessage.isPending}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || !conversationId || sendMessage.isPending}
                  className="bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}