import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, File, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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

export default function QuickDocumentUpload({ studentProfile, onSuccess }) {
  const queryClient = useQueryClient();
  const [autoFilled, setAutoFilled] = useState(false);
  
  const [formData, setFormData] = useState({
    document_type: '',
    name: '',
    student_name: '',
    student_email: '',
    student_phone: '',
    passport_no: '',
    dob: '',
    file: null
  });

  // Auto-fill from student profile
  useEffect(() => {
    if (studentProfile && !autoFilled) {
      setFormData(prev => ({
        ...prev,
        student_name: `${studentProfile.first_name || ''} ${studentProfile.last_name || ''}`.trim(),
        student_email: studentProfile.email || '',
        student_phone: studentProfile.phone || '',
        passport_no: studentProfile.passport_no || '',
        dob: studentProfile.date_of_birth || ''
      }));
      setAutoFilled(true);
    }
  }, [studentProfile, autoFilled]);

  const uploadDocument = useMutation({
    mutationFn: async (data) => {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: data.file });
      
      // Create document record
      return base44.entities.Document.create({
        student_id: studentProfile.id,
        document_type: data.document_type,
        name: data.name,
        file_url,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      queryClient.invalidateQueries({ queryKey: ['student-docs-status'] });
      setFormData({
        document_type: '',
        name: '',
        student_name: formData.student_name,
        student_email: formData.student_email,
        student_phone: formData.student_phone,
        passport_no: formData.passport_no,
        dob: formData.dob,
        file: null
      });
      toast.success('Document uploaded and queued for AI verification');
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast.error('Upload failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.document_type || !formData.name || !formData.file) {
      toast.error('Please fill all required fields');
      return;
    }
    uploadDocument.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" />
          Upload Document
          {autoFilled && (
            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Auto-filled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Document Type *</Label>
              <Select 
                value={formData.document_type}
                onValueChange={(v) => setFormData({ ...formData, document_type: v })}
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
              <Label>Document Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Passport - John Doe"
                className="mt-2"
              />
            </div>
          </div>

          {/* Auto-filled Student Info */}
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-xs font-semibold text-emerald-900 mb-2">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Auto-filled from your profile
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-emerald-800">
              <div><strong>Name:</strong> {formData.student_name || 'N/A'}</div>
              <div><strong>Email:</strong> {formData.student_email || 'N/A'}</div>
              <div><strong>Phone:</strong> {formData.student_phone || 'N/A'}</div>
              <div><strong>DOB:</strong> {formData.dob || 'N/A'}</div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label>File *</Label>
            <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
              {formData.file ? (
                <div className="flex items-center justify-center gap-2">
                  <File className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">{formData.file.name}</span>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFormData({ ...formData, file: null })}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Click to upload</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormData({ ...formData, file: e.target.files[0] });
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={uploadDocument.isPending}
          >
            {uploadDocument.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading & Verifying...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}