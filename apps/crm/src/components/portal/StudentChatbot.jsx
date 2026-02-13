import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, Send, Loader2, Bot, User as UserIcon,
  Sparkles, X, Minimize2, Maximize2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser && 'flex flex-col items-end'}`}>
        <div className={`rounded-2xl px-4 py-2.5 ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-white border border-slate-200'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown 
              className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                      {children}
                    </code>
                  ) : (
                    <code className="block p-2 rounded bg-slate-100 text-slate-700 text-xs my-2">
                      {children}
                    </code>
                  )
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {!isUser && message.tool_calls?.length > 0 && (
          <div className="mt-1 ml-11">
            {message.tool_calls.map((tool, idx) => (
              <Badge key={idx} variant="outline" className="text-xs mr-1">
                <Sparkles className="w-3 h-3 mr-1" />
                {tool.name?.split('.').pop() || 'Processing'}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

const QuickActions = ({ onQuickQuestion }) => {
  const questions = [
    { text: 'How do I apply?', icon: '📝' },
    { text: 'Check my application status', icon: '📊' },
    { text: 'Visa requirements for UK', icon: '🇬🇧' },
    { text: 'What documents do I need?', icon: '📄' },
    { text: 'IELTS score requirements', icon: '📚' },
    { text: 'Scholarship opportunities', icon: '🎓' }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {questions.map((q, idx) => (
        <Button
          key={idx}
          variant="outline"
          size="sm"
          onClick={() => onQuickQuestion(q.text)}
          className="justify-start text-left h-auto py-2 hover:bg-blue-50 hover:border-blue-300"
        >
          <span className="mr-2">{q.icon}</span>
          <span className="text-xs">{q.text}</span>
        </Button>
      ))}
    </div>
  );
};

export default function StudentChatbot({ studentId, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const conversation = await base44.agents.createConversation({
        agent_name: 'student_advisor',
        metadata: {
          name: 'Study Abroad Q&A',
          student_id: studentId
        }
      });
      return conversation;
    },
    onSuccess: (conversation) => {
      setConversationId(conversation.id);
      setMessages(conversation.messages || []);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!conversationId) {
        const conversation = await base44.agents.createConversation({
          agent_name: 'student_advisor',
          metadata: {
            name: 'Study Abroad Q&A',
            student_id: studentId
          }
        });
        setConversationId(conversation.id);
        
        await base44.agents.addMessage(conversation, {
          role: 'user',
          content
        });
        
        return conversation.id;
      } else {
        const conversation = await base44.agents.getConversation(conversationId);
        await base44.agents.addMessage(conversation, {
          role: 'user',
          content
        });
        return conversationId;
      }
    },
    onSuccess: () => {
      setInputMessage('');
    },
    onError: (error) => {
      toast.error('Failed to send message: ' + error.message);
    }
  });

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMessageMutation.mutate(inputMessage.trim());
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    sendMessageMutation.mutate(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (compact) {
    return (
      <>
        {/* Floating Chat Button */}
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className={`fixed bottom-6 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden transition-all ${
            isMinimized ? 'w-80' : 'w-96 h-[600px]'
          }`}>
            <Card className="h-full flex flex-col border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">Study Abroad Advisor</CardTitle>
                      <p className="text-xs text-white/80">AI-powered assistance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="text-white hover:bg-white/20 h-8 w-8"
                    >
                      {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                          <Bot className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Hi! I'm your Study Abroad Advisor</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Ask me anything about applications, visas, courses, or universities
                        </p>
                        <QuickActions onQuickQuestion={handleQuickQuestion} />
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => (
                          <MessageBubble key={idx} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </CardContent>

                  <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        disabled={sendMessageMutation.isPending}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </>
    );
  }

  // Full page chatbot view
  return (
    <div className="h-full flex flex-col">
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">AI Study Abroad Advisor</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Get instant answers about applications, visas, courses, universities, and study abroad advice
          </p>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-slate-700 mb-3">Try asking:</p>
            <QuickActions onQuickQuestion={handleQuickQuestion} />
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-900 mb-1">Complex queries?</p>
                <p className="text-xs text-amber-800">
                  For sensitive matters like visa refusals, financial issues, or personalized strategy, 
                  I'll connect you with a human counselor.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-slate-200 flex-shrink-0">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about studying abroad..."
                disabled={sendMessageMutation.isPending}
                className="flex-1 h-12"
              />
              <Button
                onClick={handleSend}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-slate-500 mt-3">
              AI-powered advisor • May escalate complex queries to human counselors
            </p>
          </div>
        </>
      )}
    </div>
  );
}