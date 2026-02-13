import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Upload, FileText, Download, Eye, Shield, Users, 
  Building2, Search, Filter, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import CRMLayout from '@/components/crm/CRMLayout';

const DOC_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'tb_certificate', label: 'TB Certificate' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'cas', label: 'CAS' },
  { value: 'visa', label: 'Visa' },
  { value: 'transcript', label: 'Academic Transcript' },
  { value: 'degree', label: 'Degree Certificate' },
  { value: 'english_test', label: 'English Test' },
  { value: 'other', label: 'Other' }
];

export default function CRMSecureDocuments() {
  const queryClient = useQueryClient();
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterDocType, setFilterDocType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-secure'],
    queryFn: () => base44.auth.me()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['secure-students'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['secure-documents'],
    queryFn: () => base44.entities.Document.list('-created_date')
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ studentId, docType, file }) => {
      // Upload file to Base44 storage
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Create document record
      await base44.entities.Document.create({
        student_id: studentId,
        document_type: docType,
        name: file.name,
        file_url: file_url,
        status: 'pending'
      });

      return file_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-documents'] });
      setUploadDialog(false);
      setSelectedStudent('');
      setSelectedDocType('');
      setUploadFile(null);
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error('Upload failed: ' + error.message);
    }
  });

  const updateDocumentStatus = useMutation({
    mutationFn: ({ docId, status, notes }) => 
      base44.entities.Document.update(docId, { 
        status, 
        reviewer_notes: notes,
        reviewed_by: currentUser?.id,
        reviewed_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-documents'] });
      toast.success('Document status updated');
    }
  });

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    if (filterStudent !== 'all' && doc.student_id !== filterStudent) return false;
    if (filterDocType !== 'all' && doc.document_type !== filterDocType) return false;
    if (searchQuery) {
      const student = students.find(s => s.id === doc.student_id);
      const searchLower = searchQuery.toLowerCase();
      return (
        doc.name?.toLowerCase().includes(searchLower) ||
        student?.first_name?.toLowerCase().includes(searchLower) ||
        student?.last_name?.toLowerCase().includes(searchLower) ||
        student?.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'expired': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  };

  return (
    <CRMLayout title="Secure Documents">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Documents</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <Shield className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Upload */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search documents or students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStudent} onValueChange={setFilterStudent}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDocType} onValueChange={setFilterDocType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DOC_TYPES.map(dt => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Secure Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Student</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.first_name} {s.last_name} - {s.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Document Type</Label>
                    <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_TYPES.map(dt => (
                          <SelectItem key={dt.value} value={dt.value}>
                            {dt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>File</Label>
                    <Input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="mt-2"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Supported: PDF, JPG, PNG, DOC, DOCX
                    </p>
                  </div>

                  <Button
                    onClick={() => uploadDocument.mutate({
                      studentId: selectedStudent,
                      docType: selectedDocType,
                      file: uploadFile
                    })}
                    disabled={!selectedStudent || !selectedDocType || !uploadFile || uploadDocument.isPending}
                    className="w-full"
                  >
                    {uploadDocument.isPending ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredDocs.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filteredDocs.filter(d => d.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filteredDocs.filter(d => d.status === 'approved').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-3">
          {filteredDocs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No documents found</p>
              </CardContent>
            </Card>
          ) : (
            filteredDocs.map(doc => {
              const student = students.find(s => s.id === doc.student_id);
              const docTypeLabel = DOC_TYPES.find(dt => dt.value === doc.document_type)?.label || doc.document_type;

              return (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="w-5 h-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{doc.name}</h4>
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            <Badge variant="outline">{docTypeLabel}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {student?.first_name} {student?.last_name}
                            </span>
                            <span>{format(new Date(doc.created_date), 'MMM d, yyyy')}</span>
                          </div>
                          {doc.reviewer_notes && (
                            <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                              {doc.reviewer_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {doc.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateDocumentStatus.mutate({
                                docId: doc.id,
                                status: 'approved',
                                notes: 'Document approved'
                              })}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateDocumentStatus.mutate({
                                docId: doc.id,
                                status: 'rejected',
                                notes: 'Document rejected - please resubmit'
                              })}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6 space-y-3">
          {filteredDocs.filter(d => d.status === 'pending').map(doc => {
            const student = students.find(s => s.id === doc.student_id);
            const docTypeLabel = DOC_TYPES.find(dt => dt.value === doc.document_type)?.label || doc.document_type;

            return (
              <Card key={doc.id} className="border-l-4 border-amber-400">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{doc.name}</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          Student: {student?.first_name} {student?.last_name} | Type: {docTypeLabel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateDocumentStatus.mutate({
                          docId: doc.id,
                          status: 'approved',
                          notes: 'Document approved'
                        })}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-3">
          {filteredDocs.filter(d => d.status === 'approved').map(doc => {
            const student = students.find(s => s.id === doc.student_id);
            const docTypeLabel = DOC_TYPES.find(dt => dt.value === doc.document_type)?.label || doc.document_type;

            return (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-slate-900">{doc.name}</h4>
                        <p className="text-sm text-slate-600">
                          {student?.first_name} {student?.last_name} | {docTypeLabel}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}