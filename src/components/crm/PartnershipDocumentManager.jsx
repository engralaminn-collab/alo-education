import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { FileText, Upload, Download, Trash2, Eye, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PartnershipDocumentManager({ agreementId, agreement }) {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['partnershipDocuments', agreementId],
    queryFn: async () => {
      const docs = await base44.entities.Document.filter({ 
        related_type: 'partnership_agreement',
        related_id: agreementId 
      });
      return docs;
    },
    enabled: !!agreementId
  });

  const deleteDocument = useMutation({
    mutationFn: (docId) => base44.entities.Document.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnershipDocuments'] });
      toast.success('Document deleted');
    },
    onError: () => toast.error('Failed to delete document')
  });

  const handleUpload = async () => {
    if (!uploadFile || !documentTitle) {
      toast.error('Please provide file and title');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadFile });
      
      await base44.entities.Document.create({
        student_id: null,
        application_id: null,
        related_type: 'partnership_agreement',
        related_id: agreementId,
        document_type: 'agreement',
        title: documentTitle,
        file_url,
        file_name: uploadFile.name,
        file_size: uploadFile.size,
        status: 'approved',
        upload_date: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['partnershipDocuments'] });
      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      setUploadFile(null);
      setDocumentTitle('');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Partnership Documents</h3>
        <Button onClick={() => setShowUploadModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Loading documents...</div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">No documents uploaded yet</p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {documents.map(doc => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{doc.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {doc.document_type}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {format(new Date(doc.upload_date || doc.created_date), 'PP')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(doc.file_url, '_blank')}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = doc.file_url;
                      link.download = doc.file_name;
                      link.click();
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteDocument.mutate(doc.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Partnership Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Title *</Label>
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g., Partnership Agreement 2026"
              />
            </div>
            <div>
              <Label>Select File *</Label>
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {uploadFile && (
                <p className="text-xs text-slate-500 mt-1">
                  {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}