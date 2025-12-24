import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User, Loader2, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! 👋 I\'m ALO Education\'s AI Assistant. I can help you with:\n• Study destinations\n• Course information\n• IELTS requirements\n• Visa guidance\n• Intake timelines\n\nHow can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ALO Education's AI assistant. Help students with study abroad queries.

Context about ALO Education:
- We help students study in UK, Australia, Canada, USA, Ireland, New Zealand, Dubai
- We offer IELTS/PTE preparation
- We provide end-to-end admission support
- Popular courses: Business, Engineering, Computer Science, Medicine
- We have counsellors available for personalized guidance

Student question: ${userMessage}

Provide helpful, friendly responses. If it's a complex query, suggest booking a free counselling session.
Keep responses concise (2-3 sentences).`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            needs_counsellor: { type: "boolean" }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        needsCounsellor: data.needs_counsellor
      }]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    chatMutation.mutate(userMessage);
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/8801805020101', '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full shadow-lg"
              style={{ backgroundColor: '#0066CC' }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <Card className="flex flex-col h-[600px] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#0066CC' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F37021' }}>
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-semibold">ALO Assistant</h3>
                    <p className="text-xs text-white/80">Always here to help</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#0066CC' }}>
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-900 border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.needsCounsellor && (
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          style={{ backgroundColor: '#F37021' }}
                          onClick={handleWhatsApp}
                        >
                          <PhoneCall className="w-4 h-4 mr-2" />
                          Talk to Counsellor
                        </Button>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0066CC' }}>
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-2 border">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1"
                    disabled={chatMutation.isPending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || chatMutation.isPending}
                    style={{ backgroundColor: '#F37021' }}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="w-full mt-2 text-xs text-center text-slate-600 hover:text-blue-600 transition-colors"
                >
                  💬 Continue on WhatsApp
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}