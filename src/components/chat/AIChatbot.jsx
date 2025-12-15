import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const quickQuestions = [
  "How do I apply to universities?",
  "What are the English test requirements?",
  "Tell me about scholarships",
  "What documents do I need?",
  "How long does the application process take?"
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your ALO Education assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful study abroad counselor for ALO Education. Answer the following question about studying abroad, university applications, English tests, or general inquiries. Keep responses concise and helpful.

Context: ALO Education helps students apply to universities in UK, USA, Canada, Australia, and other countries. We provide guidance on applications, English tests (IELTS, PTE, TOEFL), scholarships, and visa requirements.

Student Question: ${message}

Provide a helpful, friendly response:`,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: response || 'I apologize, but I couldn\'t process that. Could you rephrase your question?'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again or contact us directly.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
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
              className="w-16 h-16 rounded-full shadow-lg text-white"
              style={{ backgroundColor: 'var(--alo-orange)' }}
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardHeader 
                className="p-4 text-white cursor-pointer"
                style={{ backgroundColor: 'var(--alo-blue)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <CardTitle className="text-lg">ALO Assistant</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="hover:bg-white/20 p-1 rounded"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-white/20 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="p-0">
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === 'user'
                              ? 'text-white'
                              : 'bg-white text-slate-900 border'
                          }`}
                          style={msg.role === 'user' ? { backgroundColor: 'var(--alo-blue)' } : {}}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border rounded-lg px-4 py-2">
                          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--alo-blue)' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Questions */}
                  {messages.length === 1 && (
                    <div className="p-4 bg-white border-t">
                      <p className="text-xs text-slate-600 mb-2">Quick questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickQuestion(q)}
                            className="text-xs px-3 py-1 rounded-full border hover:bg-slate-50 transition-colors"
                            style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 bg-white border-t">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage(input);
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="text-white"
                        style={{ backgroundColor: 'var(--alo-orange)' }}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}