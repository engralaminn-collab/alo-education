import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const systemContext = `You are an AI assistant for ALO Education, a leading study abroad consultancy based in Bangladesh. 

About ALO Education:
- We help students apply to universities in UK, USA, Canada, Australia, Germany, Ireland, and Dubai
- We provide free counseling, application assistance, visa guidance, and test preparation
- We have partnerships with 200+ universities worldwide
- Our office is at Barek Mansion-02 (5th Floor), 58/9 Box Culvert Road, Panthapath, Dhaka-1205
- Phone: +880 1805-020101 to +880 1805-020110
- WhatsApp: +880 1805-020101
- Email: info@aloeducation.com
- Working Hours: Sat-Thu 10 AM - 6 PM

Services we offer:
1. Free university and course counseling
2. Application assistance (university applications, document preparation)
3. Visa guidance and support
4. English test preparation (IELTS, PTE, TOEFL, Duolingo, etc.)
5. Pre-departure guidance
6. Scholarship assistance
7. Accommodation support

English Tests we help with:
- IELTS (most popular for UK, Australia, Canada)
- PTE Academic (fast results, AI-scored)
- TOEFL (popular for USA, Canada)
- Duolingo (online test, fast results)
- OIETC (UK pathway programs)
- LanguageCert (UKVI approved options)
- Kaplan Test (pathway programs)

Popular destinations:
- UK (most popular - Russell Group universities, wide range of courses)
- USA (top research universities, flexible education system)
- Australia (work opportunities, high quality of life)
- Canada (affordable, immigration pathways)
- Germany (low/no tuition fees, strong engineering)
- Ireland (tech hub, friendly visa policies)

Your role:
- Answer questions about studying abroad, university selection, course options
- Provide information about English language tests and requirements
- Explain the application process and timelines
- Suggest next steps (book consultation, browse universities, take English test)
- Be friendly, helpful, and encouraging
- If the query requires personalized advice, suggest booking a free consultation
- For complex visa or specific university questions, recommend speaking to a counselor

Always be concise, helpful, and guide users toward taking action (booking consultation, browsing courses, contacting via WhatsApp).`;

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! 👋 I\'m your ALO Education AI assistant. I can help you with:\n\n• Finding the right university & course\n• English test requirements\n• Application process guidance\n• Study destinations comparison\n\nHow can I help you today?',
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .slice(-6) // Last 6 messages for context
        .map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const prompt = `${systemContext}

Previous conversation:
${conversationHistory}

Student: ${userMessage}

Assistant (respond naturally and concisely, maximum 150 words):`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again or contact us via WhatsApp at +880 1805-020101.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Which country is best for me?",
    "What are IELTS requirements?",
    "How to apply to UK universities?",
    "What's the cost of studying abroad?",
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 relative"
            >
              <MessageCircle className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
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
            className="fixed bottom-6 right-6 z-50 w-[95vw] md:w-[420px] h-[600px] max-h-[80vh] shadow-2xl"
          >
            <Card className="h-full flex flex-col border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-t-xl p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">ALO Education AI</CardTitle>
                      <p className="text-white/80 text-xs">Your study abroad assistant</p>
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
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    </div>
                  </div>
                )}

                {messages.length === 1 && !isLoading && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 text-center">Quick questions:</p>
                    {quickQuestions.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(question);
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="w-full text-left text-sm px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              <div className="p-4 bg-white border-t flex-shrink-0 rounded-b-xl">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Powered by AI • For detailed advice, book a free consultation
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}