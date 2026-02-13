import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AIUniversitySummary({ university }) {
  const [generateNow, setGenerateNow] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['ai-university-summary', university.id],
    queryFn: async () => {
      const prompt = `Provide a comprehensive yet concise summary of ${university.university_name || university.name} located in ${university.city}, ${university.country}.

University Details:
- World Ranking: #${university.ranking || 'N/A'}
- Student Population: ${university.student_population || 'N/A'}
- International Students: ${university.international_students_percent || 'N/A'}%
- About: ${university.about || 'N/A'}

Create a summary covering:
1. Key strengths and reputation (2-3 sentences)
2. Notable academic programs and research areas (2 sentences)
3. Campus life and student experience (1-2 sentences)
4. Why international students choose this university (1-2 sentences)

Keep the tone professional yet engaging. Make it around 150-200 words total.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      return response;
    },
    enabled: generateNow,
  });

  if (!generateNow) {
    return (
      <Card className="border-0 shadow-sm border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">AI-Powered University Summary</h3>
              <p className="text-slate-600 text-sm mb-4">
                Get an intelligent summary of key features, academic strengths, and what makes this university special
              </p>
              <Button 
                onClick={() => setGenerateNow(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-5 h-5" />
          AI-Generated Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="ml-3 text-slate-600">Generating intelligent summary...</span>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}