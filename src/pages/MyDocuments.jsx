import React from 'react';
import { base44 } from '@/api/base44Client';
<<<<<<< HEAD
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import DocumentManager from '@/components/documents/DocumentManager';
=======
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
>>>>>>> last/main
import Footer from '@/components/landing/Footer';
import DocumentVerifier from '@/components/crm/DocumentVerifier';

export default function MyDocuments() {
  const { data: user } = useQuery({
    queryKey: ['current-user-docs'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-docs', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#0066CC' }}>
              <FileText className="w-8 h-8" />
              My Documents
            </h1>
            <p className="text-slate-600 mt-2">
              Upload and manage your application documents
            </p>
          </div>

          {studentProfile ? (
            <DocumentManager studentId={studentProfile.id} />
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-600">Loading...</p>
            </div>
          )}
        </div>
      </div>
<<<<<<< HEAD
=======

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

>>>>>>> last/main
      <Footer />
    </div>
  );
}