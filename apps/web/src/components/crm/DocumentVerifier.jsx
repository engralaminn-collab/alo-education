import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Sparkles, Loader, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function DocumentVerifier({ document, onVerificationComplete }) {
  const verifyDocument = useMutation({
    mutationFn: (documentId) =>
      base44.functions.invoke('verifyDocument', { documentId }),
    onSuccess: (data) => {
      toast.success('Document verification complete');
      if (onVerificationComplete) {
        onVerificationComplete(data.verification);
      }
    },
    onError: () => {
      toast.error('Failed to verify document');
    }
  });

  const handleVerify = () => {
    verifyDocument.mutate(document.id);
  };

  const verification = verifyDocument.data?.verification;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI Document Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verification ? (
          <Button
            onClick={handleVerify}
            disabled={verifyDocument.isPending}
            className="w-full bg-education-blue"
          >
            {verifyDocument.isPending ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Verify Document with AI
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Validation Status */}
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              verification.is_valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {verification.is_valid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold ${verification.is_valid ? 'text-green-900' : 'text-red-900'}`}>
                  {verification.is_valid ? 'Document Appears Valid' : 'Issues Found'}
                </h4>
                <p className={`text-sm ${verification.is_valid ? 'text-green-700' : 'text-red-700'}`}>
                  Confidence: {verification.confidence_score}%
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Summary</h4>
              <p className="text-sm text-gray-700">{verification.summary}</p>
            </div>

            {/* Issues */}
            {verification.issues && verification.issues.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Issues Detected</h4>
                <div className="space-y-2">
                  {verification.issues.map((issue, idx) => (
                    <Alert key={idx} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <span className="text-sm">{issue.issue}</span>
                        <Badge variant={issue.severity === 'high' ? 'destructive' : 'outline'}>
                          {issue.severity}
                        </Badge>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {verification.recommendations && verification.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {verification.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                verifyDocument.reset();
                handleVerify();
              }}
              className="w-full"
            >
              Re-verify Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}