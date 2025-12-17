import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileCheck, Clock, XCircle } from 'lucide-react';
import { toast } from "sonner";

export default function DocumentUploadByStage({ application, studentProfile }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({});

  const stages = [
    {
      name: 'Initial Application',
      documents: ['passport', 'photo', 'cv'],
      status: application?.status
    },
    {
      name: 'Academic Documents',
      documents: ['transcript', 'degree_certificate'],
      status: application?.milestones?.documents_submitted?.completed ? 'completed' : 'pending'
    },
    {
      name: 'English Test',
      documents: ['english_test'],
      status: application?.milestones?.documents_submitted?.completed ? 'completed' : 'pending'
    },
    {
      name: 'Supporting Documents',
      documents: ['sop', 'lor', 'financial_proof'],
      status: application?.milestones?.application_submitted?.completed ? 'completed' : 'pending'
    },
  ];

  const uploadDocument = useMutation({
    mutationFn: async ({ file, type }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Document.create({
        student_id: studentProfile.id,
        application_id: application?.id,
        document_type: type,
        name: file.name,
        file_url,
        status: 'pending'
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['student-documents']);
      toast.success(`${variables.type} uploaded successfully!`);
      setUploading(prev => ({ ...prev, [variables.type]: false }));
    },
    onError: (_, variables) => {
      toast.error(`Failed to upload ${variables.type}`);
      setUploading(prev => ({ ...prev, [variables.type]: false }));
    }
  });

  const handleFileUpload = (type, file) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    uploadDocument.mutate({ file, type });
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStageIcon = (status) => {
    switch (status) {
      case 'completed': return <FileCheck className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      default: return <XCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {getStageIcon(stage.status)}
                {stage.name}
              </CardTitle>
              <Badge className={getStageColor(stage.status)}>
                {stage.status === 'completed' ? 'Completed' : 'Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {stage.documents.map((docType) => (
                <div key={docType} className="border rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">
                    {docType.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <label htmlFor={`upload-${docType}`}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={uploading[docType]}
                      onClick={() => document.getElementById(`upload-${docType}`).click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading[docType] ? 'Uploading...' : 'Upload'}
                    </Button>
                  </label>
                  <input
                    id={`upload-${docType}`}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(docType, file);
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}