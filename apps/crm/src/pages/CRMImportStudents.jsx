import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function CRMImportStudents() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
    onSuccess: (fileUrl) => {
      setUploadedFileUrl(fileUrl);
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      toast.error('Upload failed: ' + error.message);
    }
  });

  const importMutation = useMutation({
    mutationFn: async (fileUrl) => {
      const response = await base44.functions.invoke('importStudentProfiles', { file_url: fileUrl });
      return response.data;
    },
    onSuccess: (result) => {
      setImportResult(result);
      if (result.success) {
        toast.success(`Successfully imported ${result.imported} student profiles`);
      }
    },
    onError: (error) => {
      toast.error('Import failed: ' + error.message);
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleImport = () => {
    if (uploadedFileUrl) {
      importMutation.mutate(uploadedFileUrl);
    }
  };

  const downloadTemplate = () => {
    window.open('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693eca99c6c08f82cce5122b/5958d91f9_DataforStudentProfile_CRM.xlsx', '_blank');
  };

  return (
    <CRMLayout currentPage="Import Students">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import Student Profiles</h1>
            <p className="text-gray-600 mt-1">Bulk import student data from Excel files</p>
          </div>
          <Button variant="outline" onClick={downloadTemplate} className="gap-2">
            <Download size={16} />
            Download Template
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
            <CardDescription>
              Upload an Excel file (.xlsx or .xls) containing student profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to select an Excel file'}
                </p>
                <Button type="button" variant="outline" size="sm">
                  Select File
                </Button>
              </label>
            </div>

            {selectedFile && !uploadedFileUrl && (
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full bg-education-blue hover:bg-education-blue/90 gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload File
                  </>
                )}
              </Button>
            )}

            {uploadedFileUrl && !importResult && (
              <Button
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="w-full bg-alo-orange hover:bg-alo-orange/90 gap-2"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Import Student Data
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {importResult && (
          <Alert className={importResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            {importResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">
                  {importResult.success
                    ? `Successfully imported ${importResult.imported} student profiles`
                    : 'Import failed'}
                </p>
                {importResult.failed > 0 && (
                  <div>
                    <p className="text-sm text-red-700 font-medium mb-2">
                      {importResult.failed} profiles failed to import:
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {importResult.errors?.map((err, idx) => (
                        <p key={idx} className="text-xs text-red-600">
                          {err.student?.email || 'Unknown'}: {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {importResult.success && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/CRMStudents'}
                    className="mt-2"
                  >
                    View Imported Students
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>File Format Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Excel file must be in .xlsx or .xls format</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Required field: Email (used as unique identifier)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Supported sections: Personal Info, Contact, Education, Passport, Test Scores, Work Experience, Recommendations, Visa History, Preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Download the template file for the exact format</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}