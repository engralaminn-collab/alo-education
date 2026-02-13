import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AIDocumentReview({ document }) {
  const queryClient = useQueryClient();

  const analyzeDocumentMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('analyzeDocument', {
        document_id: document.id,
        file_url: document.file_url
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-reviews'] });
      toast.success('Document analyzed!');
    }
  });

  const review = analyzeDocumentMutation.data?.review;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-4 h-4" />
          {document.file_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!review ? (
          <Button
            onClick={() => analyzeDocumentMutation.mutate()}
            disabled={analyzeDocumentMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {analyzeDocumentMutation.isPending ? 'Analyzing...' : 'Analyze with AI'}
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completeness</span>
                  <span className="font-bold">{review.completeness_score}%</span>
                </div>
                <Progress value={review.completeness_score} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Correctness</span>
                  <span className="font-bold">{review.correctness_score}%</span>
                </div>
                <Progress value={review.correctness_score} />
              </div>
            </div>

            {/* Category */}
            <div>
              <Badge variant="outline">{review.document_type}</Badge>
            </div>

            {/* Extracted Data */}
            {review.extracted_data && Object.keys(review.extracted_data).length > 0 && (
              <div className="bg-blue-50 p-3 rounded text-sm">
                <strong className="text-blue-900">Extracted Info:</strong>
                <div className="mt-1 space-y-1">
                  {Object.entries(review.extracted_data).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-slate-600">{key}:</span>{' '}
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues */}
            {review.issues_found?.length > 0 && (
              <div className="bg-red-50 p-3 rounded text-sm">
                <div className="flex items-center gap-2 text-red-900 font-semibold mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  Issues Found:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {review.issues_found.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {review.suggestions?.length > 0 && (
              <div className="bg-green-50 p-3 rounded text-sm">
                <div className="flex items-center gap-2 text-green-900 font-semibold mb-1">
                  <CheckCircle className="w-4 h-4" />
                  Suggestions:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {review.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Counselor Review Required */}
            {review.requires_counselor_review && (
              <Badge className="bg-orange-600">Requires Counselor Review</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}