import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'transcript', label: 'Academic Transcripts' },
  { value: 'degree_certificate', label: 'Degree Certificates' },
  { value: 'english_test', label: 'English Test Results' },
  { value: 'sop', label: 'Statement of Purpose (SOP)' },
  { value: 'lor', label: 'Letter of Recommendation (LOR)' },
  { value: 'cv', label: 'CV/Resume' },
  { value: 'financial_proof', label: 'Financial Documents' },
  { value: 'photo', label: 'Passport Photo' },
  { value: 'other', label: 'Other Documents' },
];

export default function DocumentManager({ studentId, readOnly = false }) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ['student-documents', studentId],
    queryFn: () => base44.entities.Document.filter({ student_id: studentId }),
    enabled: !!studentId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      toast.success('Document uploaded successfully!');
      setSelectedType('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) => base44.entities.Document.update(id, { status, reviewer_notes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      toast.success('Document status updated!');
    },
  });

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await uploadMutation.mutateAsync({
        student_id: studentId,
        document_type: docType,
        name: file.name,
        file_url,
        status: 'pending',
      });
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    }
    setUploading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      expired: 'bg-slate-100 text-slate-700',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const groupedDocs = DOCUMENT_TYPES.map(type => ({
    ...type,
    docs: documents.filter(d => d.document_type === type.value),
    required: ['passport', 'transcript', 'degree_certificate', 'english_test'].includes(type.value),
  }));

  return (
    <div className="space-y-4">
      {groupedDocs.map((group) => (
        <Card key={group.value}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {group.label}
                {group.required && <Badge variant="outline" className="text-xs">Required</Badge>}
              </span>
              {!readOnly && (
                <div>
                  <input
                    type="file"
                    id={`upload-${group.value}`}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, group.value)}
                    disabled={uploading}
                  />
                  <label htmlFor={`upload-${group.value}`}>
                    <Button size="sm" asChild disabled={uploading}>
                      <span>
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {group.docs.length > 0 ? (
              <div className="space-y-2">
                {group.docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          Uploaded {new Date(doc.created_date).toLocaleDateString()}
                        </p>
                        {doc.reviewer_notes && (
                          <p className="text-xs text-slate-600 mt-1">Note: {doc.reviewer_notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </a>
                      {!readOnly && (
                        <select
                          value={doc.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: doc.id, status: e.target.value })}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No documents uploaded yet
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}