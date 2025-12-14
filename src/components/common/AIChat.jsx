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