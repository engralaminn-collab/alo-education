import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tantml:react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileCheck, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIDocumentFeedback({ application, documents }) {
  const [feedback, setFeedback] = useState(null);
  
  const generateFeedback = useMutation({
    mutationFn: async () => {
      const docList = documents.map(d => `${d.document_type}: ${d.status}`).join(', ');
      
      const prompt = `As an education consultant, review this application document status and provide feedback:
      
Application Status: ${application.status}
Documents: ${docList}
      
Provide specific, actionable feedback on:
1. Missing documents
2. Document quality concerns
3. Next steps to improve application
4. Timeline recommendations

Return JSON: {
  "score": 0-100,
  "status": "excellent" | "good" | "needs_improvement" | "incomplete",
  "missing_docs": ["doc1", "doc2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "next_steps": ["step1", "step2"]
}`;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            status: { type: 'string' },
            missing_docs: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            next_steps: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      
      return response;
    },
    onSuccess: (data) => {
      setFeedback(data);
      toast.success('AI feedback generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate feedback');
    }
  });

  const statusColors = {
    excellent: 'bg-green-100 text-green-700 border-green-300',
    good: 'bg-blue-100 text-blue-700 border-blue-300',
    needs_improvement: 'bg-amber-100 text-amber-700 border-amber-300',
    incomplete: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Sparkles className="w-5 h-5" />
          AI Document Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!feedback ? (
          <div className="text-center py-6">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">
              Get AI-powered feedback on your application documents
            </p>
            <Button
              onClick={() => generateFeedback.mutate()}
              disabled={generateFeedback.isPending}
              style={{ backgroundColor: '#F37021', color: '#000000' }}
            >
              {generateFeedback.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Feedback
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${statusColors[feedback.status]}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Document Status: {feedback.status.replace('_', ' ')}</h3>
                <Badge className="text-lg" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                  {feedback.score}/100
                </Badge>
              </div>
            </div>

            {feedback.missing_docs?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Missing Documents
                </h4>
                <ul className="space-y-2">
                  {feedback.missing_docs.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#0066CC' }} />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {feedback.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: '#0066CC' }} />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.next_steps?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4" style={{ color: '#F37021' }} />
                  Next Steps
                </h4>
                <ol className="space-y-2">
                  {feedback.next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="font-bold" style={{ color: '#F37021' }}>{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => generateFeedback.mutate()}
              disabled={generateFeedback.isPending}
              className="w-full"
            >
              Refresh Feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}