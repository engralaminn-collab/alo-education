import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, FileText, Send, Loader2, CheckCircle, 
  AlertCircle, Globe, BookOpen, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIDocumentAssistant({ studentProfile, documents, universities }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeMode, setActiveMode] = useState(null);

  const modes = [
    {
      id: 'analyze',
      label: 'Analyze Documents',
      icon: FileCheck,
      color: 'bg-blue-500',
      prompt: 'Analyze my uploaded documents and check for completeness and formatting issues.'
    },
    {
      id: 'requirements',
      label: 'Document Requirements',
      icon: BookOpen,
      color: 'bg-purple-500',
      prompt: 'What documents do I need for my target university?'
    },
    {
      id: 'translate',
      label: 'Document Summary',
      icon: Globe,
      color: 'bg-emerald-500',
      prompt: 'Help me create a summary of my academic documents.'
    }
  ];

  const generateResponse = useMutation({
    mutationFn: async (userMessage) => {
      const documentList = documents.map(doc => ({
        type: doc.document_type,
        name: doc.name,
        status: doc.status,
        has_expiry: !!doc.expiry_date,
        expiry_date: doc.expiry_date
      }));

      const systemPrompt = `You are an AI Document Assistant helping international students with their study abroad applications.

Student Profile:
- Name: ${studentProfile?.first_name} ${studentProfile?.last_name}
- Nationality: ${studentProfile?.nationality || 'Not specified'}
- Study Level: ${studentProfile?.admission_preferences?.study_level || 'Not specified'}
- Study Destination: ${studentProfile?.admission_preferences?.study_destination || 'Not specified'}
- English Test: ${studentProfile?.english_proficiency?.test_type || 'Not specified'} (Score: ${studentProfile?.english_proficiency?.overall_score || 'N/A'})

Uploaded Documents (${documents.length}):
${documentList.map(d => `- ${d.type}: "${d.name}" (Status: ${d.status})`).join('\n')}

Provide helpful, specific, and actionable advice about:
1. Document completeness and formatting
2. Missing required documents for their target destination
3. Document verification and translation needs
4. Expiry dates and renewal requirements

Be concise, friendly, and practical. Format your response with clear sections and bullet points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nStudent Question: ${userMessage}`,
        add_context_from_internet: false
      });

      return response;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data }]);
    }
  });

  const handleSend = () => {
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    generateResponse.mutate(query);
    setQuery('');
  };

  const handleModeSelect = (mode) => {
    setActiveMode(mode.id);
    setMessages([{ role: 'user', content: mode.prompt }]);
    generateResponse.mutate(mode.prompt);
  };

  const quickActions = [
    'What documents are missing from my profile?',
    'Do I need to translate my documents?',
    'Which documents need notarization?',
    'Check if my documents meet UK visa requirements'
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--alo-blue)' }}>
            <Sparkles className="w-5 h-5" />
            AI Document Assistant
          </CardTitle>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Beta
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Get instant help with document analysis, requirements, and guidance
        </p>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="grid md:grid-cols-3 gap-4">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleModeSelect(mode)}
                    className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 transition-all text-left"
                  >
                    <div className={`w-12 h-12 rounded-lg ${mode.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{mode.label}</h4>
                    <p className="text-xs text-slate-500">{mode.prompt}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Quick Questions:</p>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(action);
                      setMessages([{ role: 'user', content: action }]);
                      generateResponse.mutate(action);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-sm text-slate-700"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="max-h-96 overflow-y-auto space-y-4 mb-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {generateResponse.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about your documents..."
                className="flex-1 min-h-[60px] max-h-[120px]"
              />
              <Button
                onClick={handleSend}
                disabled={!query.trim() || generateResponse.isPending}
                className="px-6"
                style={{ backgroundColor: 'var(--alo-blue)' }}
              >
                {generateResponse.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMessages([]);
                setActiveMode(null);
                setQuery('');
              }}
              className="w-full"
            >
              Start New Conversation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}