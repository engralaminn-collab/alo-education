import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Sparkles, Copy, Send, RefreshCw, User, FileText,
  Mail, CheckCircle, AlertCircle, TrendingUp, MessageSquare
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';

const emailTemplates = {
  welcome: 'Welcome & Initial Consultation',
  follow_up: 'Application Follow-Up',
  offer_congratulations: 'Offer Letter Received',
  visa_guidance: 'Visa Application Support',
  document_request: 'Document Request',
  status_update: 'Application Status Update',
  deadline_reminder: 'Application Deadline Reminder',
  scholarship_info: 'Scholarship Information',
};

export default function CRMAIAssistant() {
  const [activeTab, setActiveTab] = useState('email');
  
  // Email Drafter State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('welcome');
  const [emailContext, setEmailContext] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  
  // Profile Summary State
  const [summaryStudent, setSummaryStudent] = useState('');
  const [profileSummary, setProfileSummary] = useState(null);
  
  // Recommendations State
  const [recommendStudent, setRecommendStudent] = useState('');
  const [recommendations, setRecommendations] = useState(null);

  const { data: students = [] } = useQuery({
    queryKey: ['crm-students-ai'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['crm-applications-ai'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-ai'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-ai'],
    queryFn: () => base44.entities.Course.list(),
  });

  // Generate Email
  const generateEmail = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.id === selectedStudent);
      if (!student) throw new Error('Student not found');

      const studentApps = applications.filter(a => a.student_id === student.id);
      
      const prompt = `Generate a professional, personalized email for a study abroad counselor.

Student: ${student.first_name} ${student.last_name}
Email: ${student.email}
Country Interest: ${student.preferred_countries?.join(', ') || 'Not specified'}
Degree Level: ${student.preferred_degree_level || 'Not specified'}
Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
Profile Completeness: ${student.profile_completeness || 0}%
Status: ${student.status}
Active Applications: ${studentApps.length}

Template Type: ${emailTemplates[emailTemplate]}
Additional Context: ${emailContext || 'None'}

Create a warm, professional email (200-250 words) that:
1. Addresses ${student.first_name} personally
2. Relates to their specific situation and interests
3. Provides clear value and actionable next steps
4. Has an encouraging tone
5. Signs off from ALO Education Counseling Team

Also provide an appropriate subject line.

Return JSON format:
{
  "subject": "Subject line here",
  "body": "Email body here"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            body: { type: 'string' }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setEmailSubject(data.subject);
      setGeneratedEmail(data.body);
      toast.success('Email generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate email');
    }
  });

  // Generate Profile Summary
  const generateSummary = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.id === summaryStudent);
      if (!student) throw new Error('Student not found');

      const studentApps = applications.filter(a => a.student_id === student.id);
      const appDetails = studentApps.map(app => {
        const uni = universities.find(u => u.id === app.university_id);
        const course = courses.find(c => c.id === app.course_id);
        return {
          university: uni?.name,
          course: course?.name,
          status: app.status,
          intake: app.intake
        };
      });

      const prompt = `Analyze this student profile and provide a comprehensive summary for a counselor.

Student: ${student.first_name} ${student.last_name}
Country: ${student.country || 'Not specified'}
Preferred Countries: ${student.preferred_countries?.join(', ') || 'None'}
Degree Level: ${student.preferred_degree_level || 'Not specified'}
Fields of Interest: ${student.preferred_fields?.join(', ') || 'None'}
Profile Completeness: ${student.profile_completeness || 0}%
Status: ${student.status}

Education:
- Highest Degree: ${student.education?.highest_degree || 'Not specified'}
- Field: ${student.education?.field_of_study || 'Not specified'}
- GPA: ${student.education?.gpa || 'N/A'}/${student.education?.gpa_scale || 4}

English Proficiency:
- Test: ${student.english_proficiency?.test_type?.toUpperCase() || 'Not specified'}
- Score: ${student.english_proficiency?.score || 'N/A'}

Budget: ${student.budget_currency || 'USD'} ${student.budget_min?.toLocaleString() || 'N/A'} - ${student.budget_max?.toLocaleString() || 'N/A'}
Work Experience: ${student.work_experience_years || 0} years

Applications (${studentApps.length}):
${appDetails.map(a => `- ${a.university} - ${a.course} (${a.status})`).join('\n') || 'No applications yet'}

Provide:
1. Quick Overview (2-3 sentences)
2. Strengths (3 bullet points)
3. Concerns/Gaps (2-3 bullet points)
4. Readiness Score (0-100)
5. Priority Actions (3 specific actions)

Return JSON format with these fields.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            concerns: { type: 'array', items: { type: 'string' } },
            readinessScore: { type: 'number' },
            priorityActions: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setProfileSummary(data);
      toast.success('Profile summary generated');
    },
    onError: () => {
      toast.error('Failed to generate summary');
    }
  });

  // Generate Recommendations
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.id === recommendStudent);
      if (!student) throw new Error('Student not found');

      const studentApps = applications.filter(a => a.student_id === recommendStudent);

      const prompt = `As a study abroad counselor AI, provide personalized recommendations for this student.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Budget: ${student.budget_currency} ${student.budget_min}-${student.budget_max}
- Profile Completeness: ${student.profile_completeness}%
- Applications: ${studentApps.length}

Based on their situation, provide:
1. Immediate Next Steps (3 specific actions the counselor should take)
2. Resources to Share (3-4 relevant resources/guides)
3. Timeline Suggestions (key milestone dates)
4. Potential Concerns (2-3 things to watch for)

Return JSON format.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            nextSteps: { type: 'array', items: { type: 'string' } },
            resources: { type: 'array', items: { type: 'string' } },
            timeline: { type: 'string' },
            concerns: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast.success('Recommendations generated');
    },
    onError: () => {
      toast.error('Failed to generate recommendations');
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const sendEmail = async () => {
    const student = students.find(s => s.id === selectedStudent);
    if (!student || !generatedEmail) return;

    try {
      await base44.integrations.Core.SendEmail({
        to: student.email,
        subject: emailSubject,
        body: generatedEmail
      });
      toast.success(`Email sent to ${student.first_name}`);
      setGeneratedEmail('');
      setEmailSubject('');
    } catch {
      toast.error('Failed to send email');
    }
  };

  return (
    <CRMLayout title="AI Assistant">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email Drafter
          </TabsTrigger>
          <TabsTrigger value="summary">
            <User className="w-4 h-4 mr-2" />
            Profile Summary
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <TrendingUp className="w-4 h-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Email Drafter */}
        <TabsContent value="email">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Generate Email
                </CardTitle>
                <CardDescription>AI-powered personalized email composer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Student</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email Template</label>
                  <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(emailTemplates).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Additional Context (Optional)</label>
                  <Textarea
                    value={emailContext}
                    onChange={(e) => setEmailContext(e.target.value)}
                    placeholder="Add specific details like university name, dates, documents needed..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={() => generateEmail.mutate()}
                  disabled={!selectedStudent || generateEmail.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${generateEmail.isPending ? 'animate-spin' : ''}`} />
                  {generateEmail.isPending ? 'Generating...' : 'Generate Email'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Generated Email</CardTitle>
                {emailSubject && (
                  <div className="mt-2">
                    <label className="text-xs font-medium text-slate-500">Subject:</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{emailSubject}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {generatedEmail ? (
                  <div className="space-y-4">
                    <Textarea
                      value={generatedEmail}
                      onChange={(e) => setGeneratedEmail(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(generatedEmail)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        onClick={() => generateEmail.mutate()}
                        variant="outline"
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button 
                        onClick={sendEmail}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Generated email will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Summary */}
        <TabsContent value="summary">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Student Profile Analysis
                </CardTitle>
                <CardDescription>AI-powered comprehensive profile review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Student</label>
                  <Select value={summaryStudent} onValueChange={setSummaryStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} - {s.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => generateSummary.mutate()}
                  disabled={!summaryStudent || generateSummary.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${generateSummary.isPending ? 'animate-spin' : ''}`} />
                  {generateSummary.isPending ? 'Analyzing...' : 'Analyze Profile'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Profile Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {profileSummary ? (
                  <div className="space-y-6">
                    {/* Readiness Score */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">Readiness Score</span>
                        <span className="text-3xl font-bold text-blue-600">{profileSummary.readinessScore}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${profileSummary.readinessScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Overview */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Overview
                      </h4>
                      <p className="text-slate-600 text-sm">{profileSummary.overview}</p>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {profileSummary.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="text-slate-600">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Concerns */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Areas of Concern
                      </h4>
                      <ul className="space-y-2">
                        {profileSummary.concerns.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <span className="text-slate-600">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Priority Actions */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Priority Actions
                      </h4>
                      <ol className="space-y-2">
                        {profileSummary.priorityActions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Badge className="bg-blue-100 text-blue-700 shrink-0">{i + 1}</Badge>
                            <span className="text-slate-600">{a}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Profile insights will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Smart Recommendations
                </CardTitle>
                <CardDescription>AI-suggested next steps and resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Student</label>
                  <Select value={recommendStudent} onValueChange={setRecommendStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.first_name} {s.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => generateRecommendations.mutate()}
                  disabled={!recommendStudent || generateRecommendations.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${generateRecommendations.isPending ? 'animate-spin' : ''}`} />
                  {generateRecommendations.isPending ? 'Generating...' : 'Get Recommendations'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations ? (
                  <div className="space-y-6">
                    {/* Next Steps */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        Immediate Next Steps
                      </h4>
                      <div className="space-y-2">
                        {recommendations.nextSteps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                            <Badge className="bg-emerald-600 text-white shrink-0">{i + 1}</Badge>
                            <span className="text-sm text-slate-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Recommended Resources
                      </h4>
                      <ul className="space-y-2">
                        {recommendations.resources.map((resource, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm p-2 hover:bg-slate-50 rounded">
                            <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <span className="text-slate-600">{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-purple-600" />
                        Suggested Timeline
                      </h4>
                      <p className="text-sm text-slate-600 bg-purple-50 p-3 rounded-lg">
                        {recommendations.timeline}
                      </p>
                    </div>

                    {/* Concerns */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Watch Out For
                      </h4>
                      <ul className="space-y-2">
                        {recommendations.concerns.map((concern, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <span className="text-slate-600">{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Recommendations will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </CRMLayout>
  );
}