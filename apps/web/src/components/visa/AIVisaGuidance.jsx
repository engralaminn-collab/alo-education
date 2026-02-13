import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, AlertCircle, FileText, Globe, 
  Sparkles, ExternalLink, Copy, Download
} from 'lucide-react';
import { toast } from 'sonner';

const VISA_REQUIREMENTS = {
  'United Kingdom': {
    types: ['Student Visa (Tier 4)', 'Short-term Study Visa'],
    documents: [
      'Valid passport',
      'CAS (Confirmation of Acceptance for Studies)',
      'Proof of financial support (£1,023/month for 9 months)',
      'English language proficiency test (IELTS/TOEFL)',
      'TB test certificate',
      'Academic transcripts and certificates',
      'Biometric information',
      'Visa application fee payment'
    ],
    steps: [
      'Receive CAS from your university',
      'Gather required documents',
      'Complete online visa application',
      'Pay visa fee (£363)',
      'Book biometrics appointment',
      'Attend visa interview (if required)',
      'Wait for decision (usually 3 weeks)'
    ],
    portal: 'https://www.gov.uk/student-visa',
    financialProof: '£11,385 (9 months x £1,265)',
    processingTime: '3 weeks'
  },
  'United States': {
    types: ['F-1 Student Visa', 'M-1 Vocational Student Visa'],
    documents: [
      'Valid passport',
      'Form I-20 from university',
      'DS-160 confirmation page',
      'Visa application fee receipt',
      'SEVIS fee payment receipt',
      'Financial documents (bank statements, sponsor letters)',
      'Academic transcripts',
      'English proficiency test scores',
      'Passport-size photographs'
    ],
    steps: [
      'Receive Form I-20 from university',
      'Pay SEVIS fee ($350)',
      'Complete DS-160 form online',
      'Pay visa application fee ($160)',
      'Schedule visa interview',
      'Prepare supporting documents',
      'Attend visa interview at US Embassy',
      'Wait for visa processing'
    ],
    portal: 'https://travel.state.gov/content/travel/en/us-visas/study.html',
    financialProof: 'Full tuition + living expenses for 1 year',
    processingTime: '2-4 weeks after interview'
  },
  'Canada': {
    types: ['Study Permit'],
    documents: [
      'Valid passport',
      'Letter of acceptance from DLI',
      'Proof of financial support (CAD $10,000 + tuition)',
      'Statement of purpose',
      'Medical examination',
      'Police certificate',
      'English/French language test results',
      'Biometric information',
      'GIC (Guaranteed Investment Certificate) - if applicable'
    ],
    steps: [
      'Receive acceptance letter from DLI',
      'Gather financial documents',
      'Complete online application',
      'Pay application fee (CAD $150)',
      'Submit biometrics',
      'Complete medical exam if required',
      'Provide police certificate',
      'Wait for decision (4-12 weeks)'
    ],
    portal: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html',
    financialProof: 'CAD $10,000 + first year tuition',
    processingTime: '4-12 weeks'
  },
  'Australia': {
    types: ['Student Visa (Subclass 500)'],
    documents: [
      'Valid passport',
      'CoE (Confirmation of Enrollment)',
      'GTE statement',
      'Financial capacity evidence (AUD $21,041/year)',
      'English proficiency test',
      'OSHC (Overseas Student Health Cover)',
      'Academic documents',
      'Biometric information'
    ],
    steps: [
      'Receive CoE from university',
      'Arrange OSHC',
      'Prepare GTE statement',
      'Create ImmiAccount',
      'Complete online application',
      'Pay visa fee (AUD $620)',
      'Submit documents',
      'Health examination and biometrics'
    ],
    portal: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500',
    financialProof: 'AUD $21,041 per year',
    processingTime: '4-8 weeks'
  }
};

export default function AIVisaGuidance({ studentProfile, selectedCountry }) {
  const [country, setCountry] = useState(selectedCountry || 'United Kingdom');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [essayPrompt, setEssayPrompt] = useState('');
  const [generatedEssay, setGeneratedEssay] = useState('');

  const assessEligibilityMutation = useMutation({
    mutationFn: async () => {
      const requirements = VISA_REQUIREMENTS[country];
      const prompt = `Assess visa eligibility for ${country} based on student profile:
      
Student Info:
- Name: ${studentProfile?.first_name} ${studentProfile?.last_name}
- Nationality: ${studentProfile?.nationality || 'Not specified'}
- Date of Birth: ${studentProfile?.date_of_birth || 'Not specified'}
- English Test: ${studentProfile?.language_proficiency?.ielts?.overall || 'Not specified'}
- Study Destination: ${country}
- Financial Status: ${studentProfile?.funding_information?.funding_status || 'Not specified'}

Visa Requirements:
${requirements.documents.join('\n')}

Analyze:
1. Eligibility status (high/medium/low)
2. Missing requirements
3. Recommendations
4. Red flags if any

Return JSON with: eligibility_score (0-100), status, missing_items (array), recommendations (array), red_flags (array)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            eligibility_score: { type: 'number' },
            status: { type: 'string' },
            missing_items: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            red_flags: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setEligibilityResult(data);
      toast.success('Eligibility assessment complete!');
    }
  });

  const generateEssayMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Generate a visa application statement/essay for ${country} student visa:

Student Profile:
- Name: ${studentProfile?.first_name} ${studentProfile?.last_name}
- Nationality: ${studentProfile?.nationality}
- Study Level: ${studentProfile?.admission_preferences?.study_level || 'Postgraduate'}
- Study Area: ${studentProfile?.admission_preferences?.study_area || 'Not specified'}
- Previous Education: ${studentProfile?.education_records?.[0]?.level || 'Undergraduate'}
- Work Experience: ${studentProfile?.work_experience?.length || 0} years

Essay Prompt/Guidelines: ${essayPrompt || 'Standard visa statement'}

Country-specific requirements:
${country === 'Australia' ? '- Write a GTE (Genuine Temporary Entrant) statement' : ''}
${country === 'Canada' ? '- Include clear study plan and future goals' : ''}
${country === 'United Kingdom' ? '- Focus on academic motivation and career plans' : ''}
${country === 'United States' ? '- Demonstrate strong ties to home country' : ''}

Write a compelling, honest visa statement (500-800 words) that:
1. Explains motivation for studying in ${country}
2. Demonstrates ties to home country
3. Shows clear study and career plans
4. Proves genuine temporary intent
5. Highlights financial capacity awareness

Use professional, sincere tone. Make it personal and specific.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedEssay(data);
      toast.success('Visa essay generated successfully!');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const requirements = VISA_REQUIREMENTS[country];

  return (
    <div className="space-y-6">
      {/* Country Selection */}
      <Card className="border-2" style={{ borderColor: '#0066CC' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
            <Globe className="w-5 h-5" />
            AI-Powered Visa Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Select Destination Country
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(VISA_REQUIREMENTS).map((c) => (
              <Button
                key={c}
                variant={country === c ? 'default' : 'outline'}
                onClick={() => setCountry(c)}
                style={country === c ? { backgroundColor: '#0066CC' } : {}}
              >
                {c}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="eligibility" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="essay">Visa Essay</TabsTrigger>
          <TabsTrigger value="portal">Apply</TabsTrigger>
        </TabsList>

        {/* Eligibility Assessment */}
        <TabsContent value="eligibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visa Eligibility Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => assessEligibilityMutation.mutate()}
                disabled={assessEligibilityMutation.isPending || !studentProfile}
                className="w-full"
                style={{ backgroundColor: '#F37021' }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {assessEligibilityMutation.isPending ? 'Analyzing...' : 'Assess My Eligibility'}
              </Button>

              {eligibilityResult && (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#0066CC15' }}>
                    <p className="text-sm text-slate-600 mb-2">Eligibility Score</p>
                    <p className="text-5xl font-bold mb-2" style={{ 
                      color: eligibilityResult.eligibility_score >= 70 ? '#10B981' : 
                             eligibilityResult.eligibility_score >= 40 ? '#F59E0B' : '#EF4444' 
                    }}>
                      {eligibilityResult.eligibility_score}%
                    </p>
                    <Badge className={
                      eligibilityResult.status === 'high' ? 'bg-green-100 text-green-700' :
                      eligibilityResult.status === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {eligibilityResult.status.toUpperCase()} ELIGIBILITY
                    </Badge>
                  </div>

                  {/* Missing Items */}
                  {eligibilityResult.missing_items?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Missing Requirements
                      </h4>
                      <div className="space-y-2">
                        {eligibilityResult.missing_items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <span className="text-sm text-amber-900">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {eligibilityResult.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Recommendations
                      </h4>
                      <div className="space-y-2">
                        {eligibilityResult.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm text-green-900">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Red Flags */}
                  {eligibilityResult.red_flags?.length > 0 && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Potential Issues
                      </h4>
                      <ul className="space-y-1">
                        {eligibilityResult.red_flags.map((flag, i) => (
                          <li key={i} className="text-sm text-red-800">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Checklist */}
        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requirements.documents.map((doc, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm text-slate-700">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requirements.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">Financial Proof Required:</span>
                <span className="text-sm text-blue-700">{requirements.financialProof}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">Processing Time:</span>
                <span className="text-sm text-blue-700">{requirements.processingTime}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visa Essay Generator */}
        <TabsContent value="essay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Visa Essay Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Essay Guidelines / Prompt (Optional)
                </label>
                <Textarea
                  placeholder="E.g., Focus on my research interests, mention family ties, explain career goals..."
                  value={essayPrompt}
                  onChange={(e) => setEssayPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={() => generateEssayMutation.mutate()}
                disabled={generateEssayMutation.isPending || !studentProfile}
                className="w-full"
                style={{ backgroundColor: '#F37021' }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateEssayMutation.isPending ? 'Generating...' : 'Generate Visa Essay'}
              </Button>

              {generatedEssay && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">Generated Essay</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedEssay)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {generatedEssay}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-900">
                      <strong>Note:</strong> This is an AI-generated draft. Please review, personalize, and verify all information before submission.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Official Portal */}
        <TabsContent value="portal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Official Visa Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#0066CC' }}>
                  {country} Student Visa Portal
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Apply through the official government portal for {country} student visas.
                </p>
                <a href={requirements.portal} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" style={{ backgroundColor: '#F37021' }}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go to Official Portal
                  </Button>
                </a>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Visa Types Available:</h4>
                {requirements.types.map((type, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border">
                    <p className="font-medium text-slate-900">{type}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Before You Apply:</h4>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>✓ Complete eligibility assessment</li>
                  <li>✓ Gather all required documents</li>
                  <li>✓ Prepare financial proof</li>
                  <li>✓ Have your visa essay ready</li>
                  <li>✓ Check processing times</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}