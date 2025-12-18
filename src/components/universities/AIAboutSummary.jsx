import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';

export default function AIAboutSummary({ university }) {
  const [summary, setSummary] = React.useState(null);

  const generateSummary = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this university description and extract 5-7 key bullet points that highlight the most important and unique aspects. Focus on strengths, specialties, and what makes it stand out.

University: ${university.university_name || university.name}
Location: ${university.city}, ${university.country}
About: ${university.about || 'A prestigious institution offering quality education'}

Format as a JSON array of strings, each being a concise, compelling bullet point.`,
        response_json_schema: {
          type: "object",
          properties: {
            key_points: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      return result.key_points;
    },
    onSuccess: (data) => setSummary(data)
  });

  if (!summary && !generateSummary.isPending) {
    return (
      <Card className="border-2" style={{ borderColor: '#0066CC' }}>
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: '#F37021' }} />
          <h3 className="font-semibold text-slate-900 mb-2">AI-Powered Insights</h3>
          <p className="text-sm text-slate-600 mb-4">
            Get a quick summary of key highlights and what makes this university special
          </p>
          <Button
            onClick={() => generateSummary.mutate()}
            style={{ backgroundColor: '#0066CC', color: 'white' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Key Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (generateSummary.isPending) {
    return (
      <Card className="border-2" style={{ borderColor: '#0066CC' }}>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" style={{ color: '#0066CC' }} />
          <p className="text-slate-600">Analyzing university information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Sparkles className="w-5 h-5" />
          Key Highlights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {summary?.map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0066CC' }} />
              <p className="text-slate-700">{point}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}