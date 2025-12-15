import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Copy, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VisaFormAssistant({ country, studentProfile, applications }) {
  const [formData, setFormData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  const generateFormData = async () => {
    setIsGenerating(true);

    try {
      const hasApplications = applications && applications.length > 0;
      const application = hasApplications ? applications[0] : null;

      const prompt = `Generate visa application form data for a student applying to ${country.name}.

Student Profile:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Date of Birth: ${studentProfile.date_of_birth || 'Not provided'}
- Nationality: ${studentProfile.nationality}
- Passport: ${studentProfile.passport_details?.passport_number || 'Not provided'}
- Email: ${studentProfile.email}
- Phone: ${studentProfile.phone}
- Current Address: ${studentProfile.present_address?.address || 'Not provided'}, ${studentProfile.present_address?.city || ''}, ${studentProfile.present_address?.country || ''}
- Education: ${studentProfile.education_history?.[0]?.institution_name || 'Not provided'} - ${studentProfile.education_history?.[0]?.academic_level || ''}
- English Test: ${studentProfile.english_proficiency?.test_type || 'Not provided'} ${studentProfile.english_proficiency?.overall_score || ''}
- Funding: ${studentProfile.funding_information?.funding_status || 'Not provided'}
${hasApplications ? `- University Applied: ${application.university_id}
- Course: ${application.course_id}` : ''}

Generate detailed, accurate form field data for ${country.name} student visa application including:
1. Personal Information section
2. Travel Information section
3. Education Background section
4. Financial Information section
5. Purpose of Study section (detailed statement)

Provide realistic, complete information based on the profile.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            personal_info: {
              type: "object",
              properties: {
                full_name: { type: "string" },
                date_of_birth: { type: "string" },
                place_of_birth: { type: "string" },
                nationality: { type: "string" },
                passport_number: { type: "string" },
                gender: { type: "string" },
                marital_status: { type: "string" }
              }
            },
            contact_info: {
              type: "object",
              properties: {
                email: { type: "string" },
                phone: { type: "string" },
                current_address: { type: "string" },
                permanent_address: { type: "string" }
              }
            },
            travel_info: {
              type: "object",
              properties: {
                intended_arrival_date: { type: "string" },
                intended_course_start: { type: "string" },
                course_duration: { type: "string" },
                accommodation_arranged: { type: "string" }
              }
            },
            education: {
              type: "object",
              properties: {
                highest_qualification: { type: "string" },
                institution: { type: "string" },
                year_of_completion: { type: "string" },
                grades: { type: "string" }
              }
            },
            financial: {
              type: "object",
              properties: {
                funding_source: { type: "string" },
                sponsor_name: { type: "string" },
                annual_income: { type: "string" },
                tuition_fees: { type: "string" }
              }
            },
            purpose_statement: { type: "string" }
          }
        }
      });

      setGeneratedData(result);
      toast.success('Form data generated successfully!');
    } catch (error) {
      toast.error('Failed to generate form data');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadFormData = () => {
    const dataStr = JSON.stringify(generatedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${country.code}-visa-form-data.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded form data!');
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Powered Form Assistant
          </CardTitle>
          <CardDescription>
            Let AI automatically fill out visa application forms based on your profile data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedData ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-6">
                Click the button below to generate pre-filled form data for your {country.name} visa application
              </p>
              <Button
                onClick={generateFormData}
                disabled={isGenerating}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Form Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Form Data
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Form data generated successfully!</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadFormData}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={generateFormData} disabled={isGenerating}>
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Personal Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(generatedData.personal_info || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs text-slate-600 capitalize">{key.replace(/_/g, ' ')}</Label>
                        <div className="flex gap-2">
                          <Input value={value} readOnly className="bg-white" />
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(value)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Contact Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(generatedData.contact_info || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs text-slate-600 capitalize">{key.replace(/_/g, ' ')}</Label>
                        <div className="flex gap-2">
                          <Input value={value} readOnly className="bg-white" />
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(value)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Travel Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(generatedData.travel_info || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs text-slate-600 capitalize">{key.replace(/_/g, ' ')}</Label>
                        <div className="flex gap-2">
                          <Input value={value} readOnly className="bg-white" />
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(value)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {generatedData.purpose_statement && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Purpose of Study Statement</h4>
                    <div className="space-y-2">
                      <Textarea
                        value={generatedData.purpose_statement}
                        readOnly
                        rows={8}
                        className="bg-white"
                      />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedData.purpose_statement)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Statement
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}