import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Loader2, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingChatbot({ student, checklist }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${student.first_name}! 👋 I'm your onboarding assistant. I'm here to help you complete your study abroad checklist and answer any questions you have about:\n\n✓ Document requirements\n✓ English tests (IELTS/TOEFL)\n✓ University applications\n✓ Visa process\n✓ Financial documentation\n\nWhat would you like help with today?`
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
      const incompleteItems = checklist?.checklist_items?.filter(i => !i.completed) || [];
      const conversationHistory = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');

      const prompt = `You are ALO Education's onboarding assistant helping ${student.first_name} ${student.last_name}.

STUDENT CONTEXT:
- Target Country: ${checklist?.country_of_interest || 'UK'}
- Study Level: ${checklist?.study_level || 'Postgraduate'}
- Checklist Progress: ${checklist?.completion_percentage || 0}%

INCOMPLETE CHECKLIST ITEMS:
${incompleteItems.map(i => `- ${i.title} (${i.category}, priority: ${i.priority})`).join('\n') || 'All done!'}

CONVERSATION:
${conversationHistory}

USER: ${userMessage}

INSTRUCTIONS:
- Be helpful, friendly, and concise
- Provide specific actionable guidance
- If they ask about documents, explain what's needed and how to prepare
- If they mention completing something, acknowledge it
- For IELTS/tests, give preparation tips and requirements
- For visa questions, provide country-specific guidance
- If they need to upload documents, suggest using the document section
- Keep responses to 3-4 paragraphs max

RESPONSE FORMATTING:
- Use bullet points for lists
- Be encouraging and supportive
- End with a helpful question or next step

Return JSON with:
- response: your message
- suggested_action: null or {"type": "complete_item", "item_title": "..."} if they mentioned completing something
- document_needed: true/false if they should upload a document`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            response: { type: 'string' },
            suggested_action: { type: 'object' },
            document_needed: { type: 'boolean' }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        suggestedAction: data.suggested_action,
        documentNeeded: data.document_needed
      }]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    chatMutation.mutate(userMessage);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b" style={{ backgroundColor: '#0066CC' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F37021' }}>
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="text-white">
          <h3 className="font-semibold">Onboarding Assistant</h3>
          <p className="text-xs text-white/80">Here to help you get started</p>
        </div>
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
              {message.documentNeeded && (
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  style={{ backgroundColor: '#F37021' }}
                  onClick={() => toast.info('Go to Documents section to upload')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
              {message.suggestedAction && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Great! Mark "{message.suggestedAction.item_title}" as complete in your checklist
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
            placeholder="Ask anything about your onboarding..."
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
  );
}