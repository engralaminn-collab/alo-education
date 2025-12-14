import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const commonQuestions = [
  "What documents do I need for my application?",
  "How long does the visa process take?",
  "What are the English language requirements?",
  "How do I check my application status?",
  "What scholarships are available?",
];

export default function AIFAQHelper({ studentProfile }) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const askAI = useMutation({
    mutationFn: async (query) => {
      const context = studentProfile ? `
Student Profile Context:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Nationality: ${studentProfile.nationality || 'Not specified'}
- Study Level: ${studentProfile.admission_preferences?.study_level || 'Not specified'}
- Study Destination: ${studentProfile.admission_preferences?.study_destination || 'Not specified'}
- Study Area: ${studentProfile.admission_preferences?.study_area || 'Not specified'}
` : '';

      const prompt = `You are an AI assistant for ALO Education, a study abroad consultancy platform. 
${context}

Student Question: ${query}

Provide a helpful, accurate, and concise answer. If you don't have specific information, guide them to contact their counselor or support team.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      return response;
    },
    onSuccess: (response, query) => {
      setChatHistory(prev => [
        ...prev,
        { type: 'user', content: query },
        { type: 'ai', content: response }
      ]);
      setQuestion('');
    },
    onError: () => {
      toast.error('Failed to get response. Please try again.');
    },
  });

  const handleAsk = () => {
    if (!question.trim()) return;
    askAI.mutate(question);
  };

  const handleQuickQuestion = (q) => {
    setQuestion(q);
    setExpanded(true);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Help Assistant
          </CardTitle>
          {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="space-y-4">
              {/* Quick Questions */}
              {chatHistory.length === 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-3">Quick questions:</p>
                  <div className="space-y-2">
                    {commonQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickQuestion(q)}
                        className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 inline mr-2 text-purple-500" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-50 text-blue-900 ml-8'
                          : 'bg-slate-50 text-slate-700 mr-8'
                      }`}
                    >
                      {msg.type === 'ai' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                  disabled={askAI.isPending}
                />
                <Button
                  onClick={handleAsk}
                  disabled={askAI.isPending || !question.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {askAI.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {chatHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatHistory([])}
                  className="w-full text-xs"
                >
                  Clear Conversation
                </Button>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}