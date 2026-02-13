import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AIStudentAssistant({ student, applications, documents }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAssistant = useMutation({
    mutationFn: async (query) => {
      const context = {
        studentName: `${student.first_name} ${student.last_name}`,
        profileCompleteness: student.profile_completeness,
        activeApplications: applications.length,
        documentsUploaded: documents.length,
        recentStatus: applications[0]?.status || 'Getting started'
      };

      const prompt = `You are ALO Education's AI student assistant. Answer this question from ${context.studentName}:

"${query}"

Context:
- Student has ${context.activeApplications} active applications
- Profile is ${context.profileCompleteness}% complete
- ${context.documentsUploaded} documents uploaded
- Recent status: ${context.recentStatus}

Provide a helpful, friendly, and accurate response. Be encouraging and offer next steps when relevant.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      return result;
    },
    onSuccess: (data) => {
      setResponse(data);
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to get response');
      setLoading(false);
    }
  });

  const handleAsk = () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse('');
    askAssistant.mutate(question);
  };

  return (
    <Card className="border-2" style={{ borderColor: '#F37021' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#F37021' }} />
          AI Study Abroad Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about your study abroad journey... e.g., 'What documents do I need?' or 'When should I apply?'"
            rows={3}
          />
        </div>

        <Button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="w-full"
          style={{ backgroundColor: '#0066CC' }}
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Thinking...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Ask Assistant
            </>
          )}
        </Button>

        {response && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700 whitespace-pre-line">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}