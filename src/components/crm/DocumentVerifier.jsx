import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DocumentVerifier({ studentId }) {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['student-documents', studentId],
    queryFn: () => base44.entities.Document.filter({ student_id: studentId }, '-created_date'),
    enabled: !!studentId
  });

  const verifyDocument = useMutation({
    mutationFn: async (document) => {
      // AI verification
      const verification = await base44.integrations.Core.InvokeLLM({
        prompt: `Verify this student document for study abroad application:

Document Type: ${document.document_type}
Document Name: ${document.name}
Upload Date: ${format(new Date(document.created_date), 'MMM d, yyyy')}
${document.expiry_date ? `Expiry Date: ${document.expiry_date}` : ''}

Analyze and provide:
1. Is this document type appropriate for study abroad applications? (boolean)
2. Is the naming clear and professional? (boolean)
3. Any red flags or concerns? (array of strings)
4. Is it likely expired or near expiry? (boolean)
5. Recommendations for student or counselor (array of strings)
6. Overall authenticity confidence (low/medium/high)
7. Requires manual review? (boolean)

Be thorough and specific.`,
        response_json_schema: {
          type: "object",
          properties: {
            appropriate_type: { type: "boolean" },
            clear_naming: { type: "boolean" },
            red_flags: { type: "array", items: { type: "string" } },
            potentially_expired: { type: "boolean" },
            recommendations: { type: "array", items: { type: "string" } },
            authenticity_confidence: { 
              type: "string",
              enum: ["low", "medium", "high"]
            },
            requires_manual_review: { type: "boolean" }
          }
        }
      });

      // Determine status based on AI analysis
      let newStatus = 'approved';
      const issues = [];

      if (!verification.appropriate_type) {
        issues.push('Document type may not be appropriate');
        newStatus = 'rejected';
      }
      if (verification.potentially_expired) {
        issues.push('Document may be expired');
        newStatus = 'pending';
      }
      if (verification.red_flags?.length > 0) {
        issues.push(...verification.red_flags);
        newStatus = 'pending';
      }
      if (verification.authenticity_confidence === 'low') {
        issues.push('Low authenticity confidence - needs manual review');
        newStatus = 'pending';
      }

      // Update document
      await base44.entities.Document.update(document.id, {
        status: verification.requires_manual_review ? 'pending' : newStatus,
        reviewer_notes: JSON.stringify(verification, null, 2),
        reviewed_date: new Date().toISOString()
      });

      // Create task if issues found
      if (issues.length > 0) {
        const student = await base44.entities.StudentProfile.filter({ id: document.student_id });
        await base44.entities.Task.create({
          title: `Review ${document.document_type} for ${student[0]?.first_name} ${student[0]?.last_name}`,
          description: `AI Document Verification flagged issues:\n\n${issues.map(i => `• ${i}`).join('\n')}\n\nRecommendations:\n${verification.recommendations?.map(r => `• ${r}`).join('\n') || 'None'}`,
          type: 'document_review',
          student_id: document.student_id,
          assigned_to: student[0]?.counselor_id,
          status: 'pending',
          priority: verification.requires_manual_review ? 'high' : 'medium',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }

      return { verification, issues: issues.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      if (result.issues > 0) {
        toast.warning(`Document verified with ${result.issues} issue(s) - task created`);
      } else {
        toast.success('Document verified successfully');
      }
    }
  });

  const verifyAll = useMutation({
    mutationFn: async () => {
      const pendingDocs = documents.filter(d => d.status === 'pending' && !d.reviewed_date);
      const results = [];

      for (const doc of pendingDocs.slice(0, 5)) {
        const result = await verifyDocument.mutateAsync(doc);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return results;
    },
    onSuccess: (results) => {
      const totalIssues = results.reduce((sum, r) => sum + r.issues, 0);
      toast.success(`Verified ${results.length} documents, ${totalIssues} issues found`);
    }
  });

  const pendingDocs = documents.filter(d => d.status === 'pending');

  return (
    <div className="space-y-4">
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            AI Document Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Pending Verification</p>
                <p className="text-sm text-slate-600">{pendingDocs.length} documents</p>
              </div>
              <FileCheck className="w-8 h-8 text-purple-300" />
            </div>

            {pendingDocs.length > 0 && (
              <Button
                onClick={() => verifyAll.mutate()}
                disabled={verifyAll.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {verifyAll.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify All Documents
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-4">Loading documents...</div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => {
            let statusIcon, statusColor;
            if (doc.status === 'approved') {
              statusIcon = <CheckCircle className="w-4 h-4" />;
              statusColor = 'bg-green-100 text-green-700';
            } else if (doc.status === 'rejected') {
              statusIcon = <XCircle className="w-4 h-4" />;
              statusColor = 'bg-red-100 text-red-700';
            } else {
              statusIcon = <AlertCircle className="w-4 h-4" />;
              statusColor = 'bg-amber-100 text-amber-700';
            }

            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor}>
                        {statusIcon}
                        <span className="ml-1">{doc.status}</span>
                      </Badge>
                      {doc.status === 'pending' && !doc.reviewed_date && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyDocument.mutate(doc)}
                          disabled={verifyDocument.isPending}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}