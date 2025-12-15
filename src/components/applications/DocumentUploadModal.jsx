import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const documentTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'transcript', label: 'Academic Transcript' },
  { value: 'degree_certificate', label: 'Degree Certificate' },
  { value: 'english_test', label: 'English Test (IELTS/TOEFL)' },
  { value: 'sop', label: 'Statement of Purpose' },
  { value: 'lor', label: 'Letter of Recommendation' },
  { value: 'cv', label: 'CV/Resume' },
  { value: 'financial_proof', label: 'Financial Documents' },
  { value: 'photo', label: 'Passport Photo' },
  { value: 'other', label: 'Other' }
];

export default function DocumentUploadModal({ open, onClose, applicationId, studentId }) {
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const uploadDocument = useMutation({
    mutationFn: async (data) => {
      setUploading(true);
      
      // Upload file to storage
      const { file_url } = await base44.integrations.Core.UploadFile({ file: data.file });
      
      // Create document record
      return await base44.entities.Document.create({
        student_id: studentId,
        application_id: applicationId,
        document_type: data.documentType,
        name: data.documentName,
        file_url: file_url,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully!');
      queryClient.invalidateQueries(['application-documents']);
      queryClient.invalidateQueries(['student-documents']);
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to upload document');
      console.error(error);
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const resetForm = () => {
    setDocumentType('');
    setDocumentName('');
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!documentName) {
        setDocumentName(selectedFile.name);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!documentType || !documentName || !file) {
      toast.error('Please fill in all fields');
      return;
    }

    uploadDocument.mutate({ documentType, documentName, file });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Document Type *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Document Name *</Label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., IELTS Certificate"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Select File *</Label>
            <div className="mt-2">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ borderColor: 'var(--alo-blue)' }}
              >
                {file ? (
                  <>
                    <FileText className="w-5 h-5" style={{ color: 'var(--alo-blue)' }} />
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                      className="ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" style={{ color: 'var(--alo-blue)' }} />
                    <span className="text-sm">Click to upload file</span>
                  </>
                )}
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white"
              style={{ backgroundColor: 'var(--alo-orange)' }}
              disabled={uploading || !documentType || !documentName || !file}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}