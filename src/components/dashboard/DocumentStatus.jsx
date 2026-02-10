import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, XCircle, Clock, AlertCircle, FileText, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DocumentStatus({ studentId }) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['student-docs-status', studentId],
    queryFn: () => base44.entities.Document.filter({ student_id: studentId }),
    enabled: !!studentId
  });

  const statusCounts = {
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
    expired: documents.filter(d => d.status === 'expired').length,
  };

  const totalRequired = 8;
  const uploadedCount = documents.length;
  const completionPercent = Math.min((uploadedCount / totalRequired) * 100, 100);

  const aiVerified = documents.filter(d => d.reviewer_notes && d.reviewed_date);
  const aiIssues = documents.filter(d => {
    if (!d.reviewer_notes) return false;
    try {
      const notes = JSON.parse(d.reviewer_notes);
      return notes.requires_manual_review || notes.authenticity_confidence === 'low' || (notes.red_flags?.length > 0);
    } catch {
      return false;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Document Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              {uploadedCount} of {totalRequired} documents uploaded
            </span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round(completionPercent)}%
            </span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-900">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{statusCounts.approved}</p>
          </div>
          
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-900">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-700">{statusCounts.pending}</p>
          </div>
        </div>

        {/* AI Verification Stats */}
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">AI Verification</span>
          </div>
          <p className="text-sm text-purple-800 mb-1">
            {aiVerified.length} documents verified by AI
          </p>
          {aiIssues.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">
                {aiIssues.length} flagged for review
              </span>
            </div>
          )}
        </div>

        {/* Upload CTA */}
        {uploadedCount < totalRequired && (
          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
            <Link to={createPageUrl('MyDocuments')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Link>
          </Button>
        )}

        {/* View Details */}
        <Button asChild variant="outline" className="w-full">
          <Link to={createPageUrl('MyDocuments')}>
            <FileText className="w-4 h-4 mr-2" />
            View All Documents
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}