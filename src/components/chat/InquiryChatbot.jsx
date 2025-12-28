import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function InquiryChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m ALO\'s AI assistant. I can help answer your questions about studying abroad. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [collectedData, setCollectedData] = useState({
    name: '',
    email: '',
    phone: '',
    country_of_interest: '',
    degree_level: '',
    field_of_study: '',
    conversation: []
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const conversationHistory = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ALO Education's intelligent inquiry assistant. Your role is to:
1. Answer common questions about study abroad
2. Collect basic information from prospective students (name, email, phone, country interest, degree level, field)
3. Determine when to hand over to a human counselor

COLLECTED DATA SO FAR:
${Object.entries(collectedData).filter(([k, v]) => v && k !== 'conversation').map(([k, v]) => `${k}: ${v}`).join('\n') || 'None yet'}

CONVERSATION HISTORY:
${conversationHistory}

USER MESSAGE: ${userMessage}

KNOWLEDGE BASE:
- Countries: UK, USA, Canada, Australia, Ireland, Germany, New Zealand, Dubai
- Levels: Undergraduate, Postgraduate, Foundation, PhD
- Popular fields: Business, Engineering, Computer Science, Medicine, Law, Arts
- IELTS typically 6.0-7.0 (varies by course)
- Intakes: UK/AUS (Jan/Sep), USA/CA (Fall/Spring)
- Scholarships: Merit-based, 10-50% reduction
- Application process: ~4-8 weeks
- Free counseling available

INSTRUCTIONS:
- If they ask about specific courses/universities, acknowledge and suggest speaking with a counselor for personalized recommendations
- If they haven't provided contact info, naturally work it into conversation
- Be conversational, friendly, and helpful
- If query is complex or they want to apply, recommend connecting with a counselor

Return JSON with:
- response: your message to the user
- collected_field: if you identified new data (e.g., "email", "country_of_interest", "name") or null
- collected_value: the value if collected_field is not null
- ready_for_handover: boolean (true if they want personal guidance or have complex needs)
- handover_reason: why they should talk to counselor (if ready_for_handover is true)`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            collected_field: { type: "string" },
            collected_value: { type: "string" },
            ready_for_handover: { type: "boolean" },
            handover_reason: { type: "string" }
          }
        }
      });

      // Update collected data if new field identified
      if (response.collected_field && response.collected_value) {
        setCollectedData(prev => ({
          ...prev,
          [response.collected_field]: response.collected_value,
          conversation: [...prev.conversation, { user: userMessage, bot: response.response }]
        }));
      }

      return response;
    },
    onSuccess: async (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        readyForHandover: data.ready_for_handover,
        handoverReason: data.handover_reason
      }]);

      // If ready for handover and we have minimal data, create inquiry
      if (data.ready_for_handover && collectedData.email) {
        try {
          await base44.entities.Inquiry.create({
            name: collectedData.name || 'Chat Inquiry',
            email: collectedData.email,
            phone: collectedData.phone,
            country_of_interest: collectedData.country_of_interest,
            degree_level: collectedData.degree_level,
            field_of_study: collectedData.field_of_study,
            message: data.handover_reason || 'Inquiry from AI chatbot',
            source: 'ai_chatbot',
            status: 'new',
          });
          toast.success('Your inquiry has been submitted! A counselor will contact you soon.');
        } catch (error) {
          console.error('Failed to create inquiry:', error);
        }
      }
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    chatMutation.mutate(userMessage);
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
                    <h3 className="font-semibold">ALO AI Assistant</h3>
                    <p className="text-xs text-white/80">Ask me anything!</p>
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
                      {message.readyForHandover && collectedData.email && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs text-green-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Your inquiry has been submitted!
                          </p>
                        </div>
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
                    placeholder="Type your message..."
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
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}