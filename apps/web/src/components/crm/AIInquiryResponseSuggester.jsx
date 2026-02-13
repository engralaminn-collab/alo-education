import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Copy, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AIInquiryResponseSuggester({ inquiry, onResponseSent }) {
  const [suggestedResponse, setSuggestedResponse] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateResponse = useMutation({
    mutationFn: async () => {
      const prompt = `Analyze this student inquiry and suggest a professional, helpful response:

Student Name: ${inquiry.full_name}
Email: ${inquiry.email}
Phone: ${inquiry.phone}
Country of Interest: ${inquiry.country_of_interest}
Study Level: ${inquiry.study_level}
Preferred Intake: ${inquiry.preferred_intake}
Message: ${inquiry.message}

Generate a warm, professional response that:
1. Addresses their specific questions
2. Provides relevant information about studying in ${inquiry.country_of_interest}
3. Offers to schedule a counseling session
4. Is encouraging and helpful
5. Includes next steps

Return just the response text, no subject line needed.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      return response;
    },
    onSuccess: (data) => {
      setSuggestedResponse(data);
      toast.success('Response suggestion generated!');
      setGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate response');
      setGenerating(false);
    }
  });

  const handleGenerate = () => {
    setGenerating(true);
    generateResponse.mutate();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestedResponse);
    toast.success('Response copied to clipboard!');
  };

  const sendResponse = async () => {
    if (!inquiry.email || !suggestedResponse) return;
    
    try {
      await base44.integrations.Core.SendEmail({
        to: inquiry.email,
        subject: `Re: Your Inquiry about ${inquiry.country_of_interest}`,
        body: suggestedResponse
      });
      
      // Update inquiry status
      await base44.entities.Inquiry.update(inquiry.id, { status: 'contacted' });
      
      toast.success('Response sent successfully!');
      if (onResponseSent) onResponseSent();
    } catch (error) {
      toast.error('Failed to send response');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#F37021' }} />
          AI Response Suggester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg space-y-2">
          <p className="text-sm"><strong>From:</strong> {inquiry.full_name}</p>
          <p className="text-sm"><strong>Interest:</strong> {inquiry.country_of_interest} - {inquiry.study_level}</p>
          <p className="text-sm"><strong>Message:</strong></p>
          <p className="text-sm text-slate-700 italic">{inquiry.message}</p>
        </div>

        {!suggestedResponse && (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
            style={{ backgroundColor: '#0066CC' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Response Suggestion'}
          </Button>
        )}

        {suggestedResponse && (
          <>
            <div>
              <Textarea
                value={suggestedResponse}
                onChange={(e) => setSuggestedResponse(e.target.value)}
                rows={10}
                className="font-sans"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={sendResponse} className="flex-1" style={{ backgroundColor: '#F37021' }}>
                <Send className="w-4 h-4 mr-2" />
                Send Response
              </Button>
            </div>

            <Button onClick={handleGenerate} variant="outline" className="w-full" size="sm">
              <Sparkles className="w-3 h-3 mr-2" />
              Regenerate
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}