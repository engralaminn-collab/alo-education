import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Upload, FileText, CheckCircle, XCircle, Clock, 
  Trash2, Eye, Download, Plus, AlertCircle, File, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import DocumentVerifier from '@/components/crm/DocumentVerifier';

const documentTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'transcript', label: 'Academic Transcript' },
  { value: 'degree_certificate', label: 'Degree Certificate' },
  { value: 'english_test', label: 'English Test Score' },
  { value: 'sop', label: 'Statement of Purpose' },
  { value: 'lor', label: 'Letter of Recommendation' },
  { value: 'cv', label: 'CV / Resume' },
  { value: 'financial_proof', label: 'Financial Proof' },
  { value: 'photo', label: 'Passport Photo' },
  { value: 'other', label: 'Other' },
];

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending Review' },
  approved: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
  expired: { color: 'bg-slate-100 text-slate-700', icon: AlertCircle, label: 'Expired' },
};

export default function MyDocuments() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({
    document_type: '',
    name: '',
    file: null,
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['my-documents', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile?.id }, '-created_date'),
    enabled: !!studentProfile?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (docData) => {
      setUploading(true);
      // Upload file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file: docData.file });
      
      // Create document record
      return base44.entities.Document.create({
        student_id: studentProfile.id,
        document_type: docData.document_type,
        name: docData.name,
        file_url,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      setUploadOpen(false);
      setNewDoc({ document_type: '', name: '', file: null });
      toast.success('Document uploaded successfully!');
    },
    onError: () => {
      toast.error('Failed to upload document');
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId) => base44.entities.Document.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      toast.success('Document deleted');
    },
  });

  const handleUpload = () => {
    if (!newDoc.document_type || !newDoc.name || !newDoc.file) {
      toast.error('Please fill all fields');
      return;
    }
    uploadMutation.mutate(newDoc);
  };

  const requiredDocs = documentTypes.slice(0, 8);
  const uploadedTypes = documents.map(d => d.document_type);
  const missingDocs = requiredDocs.filter(d => !uploadedTypes.includes(d.value));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Documents</h1>
              <p className="text-slate-300">Upload and manage your application documents</p>
            </div>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Document Type</Label>
                    <Select 
                      value={newDoc.document_type} 
                      onValueChange={(v) => setNewDoc(prev => ({ ...prev, document_type: v }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(dt => (
                          <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Document Name</Label>
                    <Input
                      placeholder="e.g. Passport - John Doe"
                      value={newDoc.name}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>File</Label>
                    <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                      {newDoc.file ? (
                        <div className="flex items-center justify-center gap-2">
                          <File className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm">{newDoc.file.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setNewDoc(prev => ({ ...prev, file: null }))}
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                          <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setNewDoc(prev => ({ ...prev, file: e.target.files[0] }));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpload} 
                    className="w-full" 
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Missing Documents Alert */}
            {missingDocs.length > 0 && (
          <Card className="border-0 shadow-sm border-l-4 border-l-amber-500 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Missing Documents</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    The following documents are commonly required. Please upload them when available:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missingDocs.map(doc => (
                      <Badge key={doc.value} variant="outline" className="bg-amber-50">
                        {doc.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            )}

            {/* Documents Grid */}
            {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-10 bg-slate-200 rounded mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Documents Yet</h2>
              <p className="text-slate-500 mb-6">
                Upload your documents to complete your application profile.
              </p>
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, index) => {
                const status = statusConfig[doc.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const docType = documentTypes.find(dt => dt.value === doc.document_type);
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-sm hover:shadow-lg transition-all group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate mb-1">
                              {doc.name}
                            </h3>
                            <p className="text-slate-500 text-sm mb-2">
                              {docType?.label || doc.document_type}
                            </p>
                            <Badge className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                        </div>

                        {doc.reviewer_notes && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                            {doc.reviewer_notes}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <span className="text-xs text-slate-400">
                            Uploaded {format(new Date(doc.created_date), 'MMM d, yyyy')}
                          </span>
                          <div className="flex-1" />
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </a>
                          <a href={doc.file_url} download>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                          {doc.status !== 'approved' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Delete this document?')) {
                                  deleteMutation.mutate(doc.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
            )}
          </div>

          {/* AI Verification Sidebar */}
          {studentProfile && (
            <div className="lg:col-span-1">
              <DocumentVerifier studentId={studentProfile.id} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}