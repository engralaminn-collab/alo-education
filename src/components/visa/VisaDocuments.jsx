import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle, CheckCircle, Download, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const documentsRequired = {
  uk: [
    { name: 'Valid Passport', required: true, description: 'At least 6 months validity', hasTemplate: false },
    { name: 'CAS Letter', required: true, description: 'From your university', hasTemplate: false },
    { name: 'Financial Evidence', required: true, description: '28-day bank statement', hasTemplate: true },
    { name: 'TB Test Certificate', required: true, description: 'From approved clinic', hasTemplate: false },
    { name: 'Academic Documents', required: true, description: 'Transcripts and certificates', hasTemplate: false },
    { name: 'English Test Results', required: true, description: 'IELTS/TOEFL scores', hasTemplate: false },
    { name: 'Passport Photos', required: true, description: 'Recent color photos', hasTemplate: false },
    { name: 'ATAS Certificate', required: false, description: 'For certain subjects', hasTemplate: false },
  ],
  usa: [
    { name: 'Valid Passport', required: true, description: 'Valid for 6+ months', hasTemplate: false },
    { name: 'I-20 Form', required: true, description: 'From your university', hasTemplate: false },
    { name: 'DS-160 Confirmation', required: true, description: 'Online form submission', hasTemplate: false },
    { name: 'SEVIS Fee Receipt', required: true, description: 'Payment confirmation', hasTemplate: false },
    { name: 'Financial Documents', required: true, description: 'Bank statements/sponsorship', hasTemplate: true },
    { name: 'Academic Records', required: true, description: 'Transcripts and diplomas', hasTemplate: false },
    { name: 'Test Scores', required: true, description: 'SAT/GRE/TOEFL', hasTemplate: false },
    { name: 'Passport Photo', required: true, description: '2x2 inch, recent', hasTemplate: false },
  ],
  canada: [
    { name: 'Valid Passport', required: true, description: 'Current passport', hasTemplate: false },
    { name: 'Letter of Acceptance', required: true, description: 'From DLI institution', hasTemplate: false },
    { name: 'Proof of Financial Support', required: true, description: 'CAD $10,000 + tuition', hasTemplate: true },
    { name: 'Biometrics', required: true, description: 'Fingerprints and photo', hasTemplate: false },
    { name: 'Medical Exam', required: false, description: 'If required', hasTemplate: false },
    { name: 'Police Certificate', required: false, description: 'Background check', hasTemplate: false },
    { name: 'Letter of Explanation', required: true, description: 'Study purpose', hasTemplate: true },
    { name: 'Language Test Results', required: true, description: 'IELTS/TEF', hasTemplate: false },
  ],
  australia: [
    { name: 'Valid Passport', required: true, description: 'Current passport', hasTemplate: false },
    { name: 'CoE', required: true, description: 'Confirmation of Enrolment', hasTemplate: false },
    { name: 'OSHC', required: true, description: 'Health cover evidence', hasTemplate: false },
    { name: 'Financial Capacity', required: true, description: 'AUD $21,041/year', hasTemplate: true },
    { name: 'English Proficiency', required: true, description: 'IELTS/PTE scores', hasTemplate: false },
    { name: 'GTE Statement', required: true, description: 'Genuine Temporary Entrant', hasTemplate: true },
    { name: 'Health Examination', required: true, description: 'Medical certificate', hasTemplate: false },
    { name: 'Academic Documents', required: true, description: 'Transcripts', hasTemplate: false },
  ],
  germany: [
    { name: 'Valid Passport', required: true, description: 'Valid passport', hasTemplate: false },
    { name: 'Admission Letter', required: true, description: 'From German university', hasTemplate: false },
    { name: 'Blocked Account', required: true, description: '€11,208 proof', hasTemplate: false },
    { name: 'Health Insurance', required: true, description: 'Coverage proof', hasTemplate: false },
    { name: 'Language Certificate', required: true, description: 'German/English', hasTemplate: false },
    { name: 'Academic Records', required: true, description: 'Certified copies', hasTemplate: false },
    { name: 'Motivation Letter', required: true, description: 'Study purpose', hasTemplate: true },
    { name: 'CV/Resume', required: true, description: 'Updated CV', hasTemplate: true },
  ],
  ireland: [
    { name: 'Valid Passport', required: true, description: 'Current passport', hasTemplate: false },
    { name: 'Offer Letter', required: true, description: 'From Irish institution', hasTemplate: false },
    { name: 'Fee Payment Proof', required: true, description: 'Tuition paid', hasTemplate: false },
    { name: 'Financial Evidence', required: true, description: '€10,000 proof', hasTemplate: true },
    { name: 'Medical Insurance', required: true, description: 'Private insurance', hasTemplate: false },
    { name: 'Academic Documents', required: true, description: 'Certificates', hasTemplate: false },
    { name: 'English Proficiency', required: true, description: 'Test scores', hasTemplate: false },
    { name: 'Explanation Letter', required: true, description: 'Study plan', hasTemplate: true },
  ],
  newzealand: [
    { name: 'Valid Passport', required: true, description: 'Valid for 3+ months', hasTemplate: false },
    { name: 'Offer of Place', required: true, description: 'From NZ institution', hasTemplate: false },
    { name: 'Financial Evidence', required: true, description: 'NZ$20,000/year', hasTemplate: true },
    { name: 'Chest X-ray', required: false, description: 'If required', hasTemplate: false },
    { name: 'Police Certificate', required: true, description: 'Good character', hasTemplate: false },
    { name: 'Medical Certificate', required: false, description: 'If required', hasTemplate: false },
    { name: 'Academic Documents', required: true, description: 'Transcripts', hasTemplate: false },
    { name: 'English Test', required: true, description: 'IELTS scores', hasTemplate: false },
  ],
};

export default function VisaDocuments({ country, studentProfile }) {
  const documents = documentsRequired[country.code] || documentsRequired.uk;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Required Documents - {country.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{doc.name}</h4>
                  {doc.required ? (
                    <Badge className="bg-red-100 text-red-700">Required</Badge>
                  ) : (
                    <Badge variant="outline">Optional</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-2">{doc.description}</p>
                {doc.hasTemplate && (
                  <Button variant="outline" size="sm">
                    <Download className="w-3 h-3 mr-2" />
                    Download Template
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <h4 className="font-bold text-green-900 mb-2">Upload Your Documents</h4>
              <p className="text-sm text-green-800 mb-4">
                Keep all your visa documents organized in one place for easy access.
              </p>
              <Link to={createPageUrl('MyDocuments')}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Go to Documents
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 mb-2">Important Tips</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• All documents must be in English or officially translated</li>
                <li>• Ensure financial documents meet the required date range</li>
                <li>• Keep original copies and certified copies ready</li>
                <li>• Check document expiry dates before submission</li>
                <li>• Follow specific formatting requirements for your country</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}