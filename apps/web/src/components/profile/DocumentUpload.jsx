import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentUpload({ studentId, documents = [], onDocumentsUpdate }) {
  const [selectedType, setSelectedType] = useState('transcript');
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    { value: 'transcript', label: 'Academic Transcript', icon: '📄' },
    { value: 'sop', label: 'Statement of Purpose (SOP)', icon: '✍️' },
    { value: 'lor', label: 'Letter of Recommendation (LOR)', icon: '💌' },
    { value: 'passport', label: 'Passport', icon: '🛂' },
    { value: 'test_score', label: 'Test Score Certificate', icon: '📊' },
    { value: 'certificate', label: 'Additional Certificate', icon: '🎖️' }
  ];

  const uploadDocument = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      const fileUrl = await base44.integrations.Core.UploadFile({ file });
      const docRecord = await base44.entities.Document.create({
        student_id: studentId,
        document_type: selectedType,
        name: file.name,
        file_url: fileUrl.file_url,
        status: 'pending'
      });
      return docRecord;
    },
    onSuccess: (data) => {
      toast.success('Document uploaded successfully');
      onDocumentsUpdate?.([...documents, data]);
      setUploading(false);
    },
    onError: (error) => {
      toast.error('Failed to upload document');
      setUploading(false);
    }
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument.mutate(file);
    }
  };

  const deleteDocument = async (docId) => {
    try {
      await base44.entities.Document.delete(docId);
      onDocumentsUpdate?.(documents.filter(d => d.id !== docId));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const statusConfig = {
    pending: { icon: AlertCircle, color: 'bg-amber-100 text-amber-800', label: 'Pending Review' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' }
  };

  const groupedDocs = documentTypes.reduce((acc, type) => {
    acc[type.value] = documents.filter(d => d.document_type === type.value);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📁 Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-education-blue rounded-lg p-6 text-center space-y-3 hover:bg-blue-50 transition-colors">
          <div className="flex justify-center">
            <div className="p-3 bg-education-blue rounded-full">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Upload Document</p>
            <p className="text-sm text-slate-600">Select document type and choose file</p>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label>
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            <Button
              as="span"
              className="bg-education-blue hover:bg-blue-700 cursor-pointer"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </label>
          <p className="text-xs text-slate-500">Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
        </div>

        {/* Documents by Type */}
        <div className="space-y-6">
          {documentTypes.map(type => {
            const docs = groupedDocs[type.value];
            if (docs.length === 0) return null;

            return (
              <div key={type.value} className="space-y-2">
                <h4 className="font-semibold text-slate-900 text-sm">{type.icon} {type.label}</h4>
                <div className="space-y-2">
                  {docs.map(doc => {
                    const config = statusConfig[doc.status] || statusConfig.pending;
                    const Icon = config.icon;
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                            <p className="text-xs text-slate-500">
                              Uploaded: {new Date(doc.created_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={config.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="p-1">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {documents.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No documents uploaded yet</p>
        )}
      </CardContent>
    </Card>
  );
}