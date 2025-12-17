import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Sparkles, FileText, Flag, Signature
} from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';

export default function AIDocumentVerification({ document, onVerified }) {
  const [verificationResult, setVerificationResult] = useState(null);
  const [counselorNotes, setCounselorNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async () => {
      // First, extract text from document
      const extractResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and extract key information for verification purposes. The document URL is: ${document.file_url}
        
Document Type: ${document.document_type}
Document Name: ${document.name}

Please verify and check for:
1. Document authenticity indicators
2. Information consistency
3. Quality and readability
4. Potential red flags or discrepancies
5. Missing required information`,
        file_urls: [document.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            verification_status: { 
              type: "string",
              enum: ["verified", "flagged", "requires_review"]
            },
            confidence_score: { type: "number" },
            extracted_data: { 
              type: "object",
              properties: {
                name: { type: "string" },
                date_of_birth: { type: "string" },
                issue_date: { type: "string" },
                expiry_date: { type: "string" },
                document_number: { type: "string" },
                institution: { type: "string" }
              }
            },
            discrepancies: { 
              type: "array",
              items: { type: "string" }
            },
            quality_issues: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            verification_notes: { type: "string" }
          }
        }
      });

      return extractResult;
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      toast.success('Document verification complete');
    },
    onError: () => {
      toast.error('Verification failed');
    },
  });

  const signOffMutation = useMutation({
    mutationFn: async (approved) => {
      return base44.entities.Document.update(document.id, {
        status: approved ? 'approved' : 'rejected',
        reviewer_notes: counselorNotes || verificationResult?.verification_notes,
        reviewed_by: user?.email,
        reviewed_date: new Date().toISOString(),
      });
    },
    onSuccess: (_, approved) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(`Document ${approved ? 'approved' : 'rejected'}`);
      if (onVerified) onVerified();
    },
  });

  const statusColors = {
    verified: 'bg-emerald-100 text-emerald-700',
    flagged: 'bg-red-100 text-red-700',
    requires_review: 'bg-amber-100 text-amber-700',
  };

  const statusIcons = {
    verified: CheckCircle2,
    flagged: Flag,
    requires_review: AlertTriangle,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            AI Document Verification
          </CardTitle>
          <Button
            size="sm"
            onClick={() => verifyDocumentMutation.mutate()}
            disabled={verifyDocumentMutation.isPending}
          >
            {verifyDocumentMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Verifying...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Run AI Verification
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!verificationResult ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click "Run AI Verification" to analyze this document</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              {React.createElement(statusIcons[verificationResult.verification_status], {
                className: "w-6 h-6"
              })}
              <div className="flex-1">
                <Badge className={statusColors[verificationResult.verification_status]}>
                  {verificationResult.verification_status.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="text-sm text-slate-500 mt-1">
                  Confidence: {Math.round(verificationResult.confidence_score * 100)}%
                </div>
              </div>
            </div>

            {/* Extracted Data */}
            {verificationResult.extracted_data && Object.keys(verificationResult.extracted_data).length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Extracted Information</h4>
                <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                  {Object.entries(verificationResult.extracted_data).map(([key, value]) => 
                    value ? (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-slate-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Discrepancies */}
            {verificationResult.discrepancies?.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Discrepancies Found
                </h4>
                <ul className="space-y-1 bg-red-50 p-3 rounded-lg">
                  {verificationResult.discrepancies.map((item, idx) => (
                    <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quality Issues */}
            {verificationResult.quality_issues?.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Quality Issues</h4>
                <ul className="space-y-1 bg-amber-50 p-3 rounded-lg">
                  {verificationResult.quality_issues.map((item, idx) => (
                    <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                      <span>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {verificationResult.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Recommendations</h4>
                <ul className="space-y-1 bg-blue-50 p-3 rounded-lg">
                  {verificationResult.recommendations.map((item, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verification Notes */}
            {verificationResult.verification_notes && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">AI Notes</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {verificationResult.verification_notes}
                </p>
              </div>
            )}

            {/* Counselor Sign-off */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Signature className="w-4 h-4" />
                Counselor Review
              </h4>
              <Textarea
                placeholder="Add your review notes (optional)..."
                value={counselorNotes}
                onChange={(e) => setCounselorNotes(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => signOffMutation.mutate(true)}
                  disabled={signOffMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Sign Off
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => signOffMutation.mutate(false)}
                  disabled={signOffMutation.isPending}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}