import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const documentTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'transcript', label: 'Academic Transcript' },
  { value: 'degree_certificate', label: 'Degree Certificate' },
  { value: 'english_test', label: 'English Test Score' },
  { value: 'sop', label: 'Statement of Purpose' },
  { value: 'lor', label: 'Letter of Recommendation' },
  { value: 'cv', label: 'CV/Resume' },
  { value: 'financial_proof', label: 'Financial Documents' },
];

const statusConfig = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Pending Review' },
  approved: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Approved' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejected' },
};

export default function QuickDocumentUpload({ studentProfile, documents = [] }) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const queryClient = useQueryClient();

  const uploadDocument = useMutation({
    mutationFn: async (data) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: data.file });
      await base44.entities.Document.create({
        student_id: studentProfile.id,
        document_type: data.type,
        name: data.name,
        file_url,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      toast.success('Document uploaded successfully!');
      setShowUploadDialog(false);
      setDocumentType('');
      setDocumentName('');
      setSelectedFile(null);
    },
    onError: () => {
      toast.error('Failed to upload document');
    },
  });

  const handleUpload = () => {
    if (!documentType || !documentName || !selectedFile) {
      toast.error('Please fill all fields');
      return;
    }
    uploadDocument.mutate({ type: documentType, name: documentName, file: selectedFile });
  };

  const recentDocuments = documents.slice(0, 5);

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Documents</CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowUploadDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">No documents uploaded yet</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowUploadDialog(true)}
              >
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocuments.map((doc, index) => {
                const status = statusConfig[doc.status] || statusConfig.pending;
                const Icon = status.icon;
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-slate-900 text-sm truncate">
                          {doc.name}
                        </h5>
                        <p className="text-xs text-slate-500 capitalize">
                          {doc.document_type?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${status.color} text-xs shrink-0`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </motion.div>
                );
              })}

              {documents.length > 5 && (
                <Link to={createPageUrl('MyDocuments')}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View All Documents
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
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
                className="mt-2"
                placeholder="e.g., My Passport"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>

            <div>
              <Label>Select File *</Label>
              <Input
                type="file"
                className="mt-2"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-slate-500 mt-1">
                Accepted formats: PDF, JPG, PNG (Max 10MB)
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={uploadDocument.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {uploadDocument.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}