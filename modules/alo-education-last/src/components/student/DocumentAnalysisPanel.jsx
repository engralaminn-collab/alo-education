import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, FileSearch, Shield, Sparkles, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentAnalysisPanel({ document, onAnalysisComplete }) {
  const queryClient = useQueryClient();

  const analyzeDoc = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('analyzeDocument', {
        document_id: document.id
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.needs_review ? 'Document needs review' : 'Document verified');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (onAnalysisComplete) onAnalysisComplete(data);
    }
  });

  // Parse AI analysis from reviewer_notes if exists
  let aiAnalysis = null;
  if (document.reviewer_notes) {
    try {
      const parsed = JSON.parse(document.reviewer_notes);
      aiAnalysis = parsed.ai_analysis;
    } catch (e) {
      // Not JSON or no analysis
    }
  }

  const validityColors = {
    official: 'bg-green-100 text-green-700',
    unofficial: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700',
    incomplete: 'bg-orange-100 text-orange-700',
    suspicious: 'bg-red-100 text-red-700'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSearch className="w-5 h-5 text-indigo-600" />
            {document.name}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeDoc.mutate()}
            disabled={analyzeDoc.isPending}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {analyzeDoc.isPending ? 'Analyzing...' : 'AI Analyze'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiAnalysis ? (
          <>
            {/* Category & Validity */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{aiAnalysis.category}</Badge>
              {aiAnalysis.subcategory && (
                <Badge variant="outline" className="text-xs">{aiAnalysis.subcategory}</Badge>
              )}
              {aiAnalysis.validity && (
                <Badge className={validityColors[aiAnalysis.validity]}>
                  {aiAnalysis.validity}
                </Badge>
              )}
            </div>

            {/* Tags */}
            {aiAnalysis.tags?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-slate-400" />
                {aiAnalysis.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Confidence Score */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Authenticity Confidence
              </span>
              <span className={`font-bold ${
                aiAnalysis.confidence_score >= 80 ? 'text-green-600' :
                aiAnalysis.confidence_score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {aiAnalysis.confidence_score}%
              </span>
            </div>

            {/* Issues */}
            {aiAnalysis.issues?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Detected Issues
                </h4>
                <div className="space-y-2">
                  {aiAnalysis.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                      <Badge 
                        variant="outline"
                        className={
                          issue.severity === 'critical' ? 'border-red-500 text-red-700' :
                          issue.severity === 'high' ? 'border-orange-500 text-orange-700' :
                          'border-yellow-500 text-yellow-700'
                        }
                      >
                        {issue.severity}
                      </Badge>
                      <p className="text-sm text-slate-700 flex-1">{issue.issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Actions */}
            {aiAnalysis.required_actions?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Required Actions
                </h4>
                <ul className="space-y-1">
                  {aiAnalysis.required_actions.map((action, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extracted Info */}
            {aiAnalysis.extracted_info && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-700 mb-1">Extracted Information</p>
                <div className="text-sm space-y-1">
                  {aiAnalysis.extracted_info.institution && (
                    <p><strong>Institution:</strong> {aiAnalysis.extracted_info.institution}</p>
                  )}
                  {aiAnalysis.extracted_info.date_range && (
                    <p><strong>Date Range:</strong> {aiAnalysis.extracted_info.date_range}</p>
                  )}
                  {aiAnalysis.extracted_info.grade_gpa && (
                    <p><strong>Grade/GPA:</strong> {aiAnalysis.extracted_info.grade_gpa}</p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <FileSearch className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Click "AI Analyze" to verify this document</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}