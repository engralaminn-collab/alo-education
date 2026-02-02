import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Loader2, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const documentTypes = [
  { value: 'transcript', label: 'Academic Transcript' },
  { value: 'degree_certificate', label: 'Degree Certificate' },
  { value: 'english_test', label: 'English Test Score' },
  { value: 'sop', label: 'Statement of Purpose' },
  { value: 'lor', label: 'Letter of Recommendation' },
  { value: 'cv', label: 'CV/Resume' },
  { value: 'passport', label: 'Passport Copy' },
  { value: 'financial_proof', label: 'Financial Documents' },
  { value: 'photo', label: 'Passport Photo' },
];

export default function StudentDocumentManager({ studentId, documents = [] }) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const queryClient = useQueryClient();

  const uploadDocument = useMutation({
    mutationFn: async ({ file, type }) => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const doc = await base44.entities.Document.create({
        student_id: studentId,
        document_type: type,
        name: file.name,
        file_url: file_url,
        status: 'pending'
      });
      
      return doc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      setUploading(false);
      setSelectedType('');
      toast.success('Document uploaded successfully');
    },
    onError: () => {
      setUploading(false);
      toast.error('Upload failed');
    }
  });

  const deleteDocument = useMutation({
    mutationFn: (docId) => base44.entities.Document.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      toast.success('Document deleted');
    }
  });

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    uploadDocument.mutate({ file, type });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-orange-100 text-orange-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Supporting Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-4">
          {documentTypes.map((docType) => {
            const existingDoc = documents.find(d => d.document_type === docType.value);
            
            return (
              <div key={docType.value} className="border-2 border-dashed rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{docType.label}</p>
                  {existingDoc && (
                    <Badge className={getStatusColor(existingDoc.status)}>
                      {existingDoc.status}
                    </Badge>
                  )}
                </div>
                
                {existingDoc ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="truncate">{existingDoc.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={existingDoc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </a>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (confirm('Delete this document?')) {
                            deleteDocument.mutate(existingDoc.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, docType.value)}
                      disabled={uploading}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      disabled={uploading}
                      className="w-full cursor-pointer"
                      asChild
                    >
                      <span>
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}