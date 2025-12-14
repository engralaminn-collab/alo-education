import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function AIDocumentProcessor({ studentId, applicationId }) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const queryClient = useQueryClient();

  const processDocuments = async (files) => {
    setProcessing(true);
    setProgress(0);
    const processedDocs = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 30);

        // Upload file
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        const fileUrl = uploadResult.file_url;

        setProgress(((i + 1) / files.length) * 60);

        // Use AI with OCR to categorize and extract info
        const aiResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this document using OCR to extract all text and information. Then determine:

1. Document type from: passport, transcript, degree_certificate, english_test, sop, lor, cv, financial_proof, photo, visa_documents, offer_letter, other
2. A clean, professional filename based on the extracted content
3. Expiry dates if applicable (YYYY-MM-DD format)
4. Extract key information to auto-fill student profile:
   - If passport: extract name, nationality, date_of_birth, passport number
   - If transcript/degree: extract institution, graduation_year, gpa, field_of_study
   - If english test: extract test_type (ielts/toefl/pte), score, test_date
   - If any document: extract any dates, names, or relevant data

Original filename: ${file.name}

Return JSON with all extracted information.`,
          file_urls: [fileUrl],
          response_json_schema: {
            type: "object",
            properties: {
              document_type: { type: "string" },
              suggested_name: { type: "string" },
              expiry_date: { type: ["string", "null"] },
              notes: { type: "string" },
              extracted_data: {
                type: "object",
                properties: {
                  name: { type: ["string", "null"] },
                  nationality: { type: ["string", "null"] },
                  date_of_birth: { type: ["string", "null"] },
                  institution: { type: ["string", "null"] },
                  graduation_year: { type: ["number", "null"] },
                  gpa: { type: ["number", "null"] },
                  field_of_study: { type: ["string", "null"] },
                  test_type: { type: ["string", "null"] },
                  test_score: { type: ["number", "null"] },
                  test_date: { type: ["string", "null"] }
                }
              }
            }
          }
        });

        setProgress(((i + 1) / files.length) * 90);

        // Create document record
        const document = await base44.entities.Document.create({
          student_id: studentId,
          application_id: applicationId || null,
          document_type: aiResult.document_type,
          name: aiResult.suggested_name || file.name,
          file_url: fileUrl,
          status: 'pending',
          expiry_date: aiResult.expiry_date,
          reviewer_notes: aiResult.notes,
        });

        // Auto-fill student profile with extracted data
        if (aiResult.extracted_data) {
          const student = await base44.entities.StudentProfile.filter({ id: studentId });
          if (student[0]) {
            const updates = {};
            const extracted = aiResult.extracted_data;
            
            // Only update fields that are empty
            if (extracted.nationality && !student[0].nationality) updates.nationality = extracted.nationality;
            if (extracted.date_of_birth && !student[0].date_of_birth) updates.date_of_birth = extracted.date_of_birth;
            
            // Update education info if available
            if (extracted.institution || extracted.graduation_year || extracted.gpa || extracted.field_of_study) {
              updates.education = {
                ...student[0].education,
                institution: extracted.institution || student[0].education?.institution,
                graduation_year: extracted.graduation_year || student[0].education?.graduation_year,
                gpa: extracted.gpa || student[0].education?.gpa,
                field_of_study: extracted.field_of_study || student[0].education?.field_of_study,
              };
            }
            
            // Update english proficiency if available
            if (extracted.test_type || extracted.test_score || extracted.test_date) {
              updates.english_proficiency = {
                ...student[0].english_proficiency,
                test_type: extracted.test_type || student[0].english_proficiency?.test_type,
                score: extracted.test_score || student[0].english_proficiency?.score,
                test_date: extracted.test_date || student[0].english_proficiency?.test_date,
              };
            }
            
            if (Object.keys(updates).length > 0) {
              await base44.entities.StudentProfile.update(studentId, updates);
            }
          }
        }

        processedDocs.push({
          original_name: file.name,
          new_name: aiResult.suggested_name,
          type: aiResult.document_type,
          status: 'success',
          auto_filled: aiResult.extracted_data ? Object.keys(aiResult.extracted_data).length : 0
        });

        setProgress(((i + 1) / files.length) * 100);
      }

      // Send notifications
      const student = await base44.entities.StudentProfile.filter({ id: studentId });
      if (student[0]?.email) {
        await base44.integrations.Core.SendEmail({
          from_name: 'ALO Education',
          to: student[0].email,
          subject: 'Documents Uploaded Successfully',
          body: `Dear Student,\n\n${processedDocs.length} documents have been uploaded to your profile and are being reviewed by your counselor.\n\nBest regards,\nALO Education Team`
        });
      }

      setResults(processedDocs);
      queryClient.invalidateQueries(['documents']);
      toast.success(`${processedDocs.length} documents processed successfully!`);

    } catch (error) {
      toast.error('Error processing documents');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processDocuments(files);
    }
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Document Processor
        </CardTitle>
        <CardDescription>
          Upload multiple documents and AI will automatically categorize and rename them
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!processing && !results && (
          <div className="text-center py-8">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="bulk-upload"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <label htmlFor="bulk-upload">
              <div className="cursor-pointer">
                <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <Button asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Documents to Upload
                  </span>
                </Button>
                <p className="text-sm text-slate-500 mt-3">
                  Supports PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>
            </label>
          </div>
        )}

        {processing && (
          <div className="py-8 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-lg font-semibold">Processing documents with AI...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-slate-600">{Math.round(progress)}% complete</p>
          </div>
        )}

        {results && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-green-900">
                Processing Complete!
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((doc, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.new_name}</p>
                    <p className="text-xs text-slate-500">
                      Type: {doc.type.replace(/_/g, ' ')} • {doc.original_name}
                    </p>
                    {doc.auto_filled > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Auto-filled {doc.auto_filled} profile field(s)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setResults(null)} 
              variant="outline" 
              className="w-full mt-4"
            >
              Upload More Documents
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}