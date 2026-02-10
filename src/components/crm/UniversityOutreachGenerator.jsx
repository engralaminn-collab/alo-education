import React, { useState } from 'react';
<<<<<<< HEAD
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UniversityOutreachGenerator({ students, universities, courses }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({
    minProfileComplete: 70,
    preferredCountries: [],
    studyLevel: 'all'
  });

  const generateOutreaches = useMutation({
    mutationFn: async () => {
      // Filter eligible students
      const eligibleStudents = students.filter(s => 
        (s.profile_completeness || 0) >= filters.minProfileComplete
      );

      const outreaches = [];

      for (const student of eligibleStudents.slice(0, 10)) {
        // Find matching courses
        const matchingCourses = courses.filter(course => {
          if (filters.studyLevel !== 'all' && course.level !== filters.studyLevel) return false;
          if (filters.preferredCountries.length > 0 && !filters.preferredCountries.includes(course.country)) return false;
          return true;
        });

        for (const course of matchingCourses.slice(0, 2)) {
          const university = universities.find(u => u.id === course.university_id);
          if (!university) continue;

          // Generate AI email with more personalization
          const prompt = `Draft a highly personalized, professional inquiry email to ${university.university_name} about ${course.course_title} for student ${student.first_name} ${student.last_name}.

STUDENT PROFILE:
- Name: ${student.first_name} ${student.last_name}
- Study Level: ${student.admission_preferences?.study_level || course.level}
- Field of Interest: ${student.admission_preferences?.study_area || course.subject_area}
- Academic Background: ${student.education_records?.[0]?.level || 'Bachelor degree'}
- IELTS Score: ${student.language_proficiency?.ielts?.overall || 'To be taken'}
- Work Experience: ${student.work_experience?.length > 0 ? 'Yes' : 'None'}
- Preferred Destination: ${course.country}
- Funding Status: ${student.funding_information?.funding_status || 'Self-funded'}

UNIVERSITY INFO:
- Name: ${university.university_name}
- Country: ${university.country}
- Ranking: ${university.qs_ranking ? `QS #${university.qs_ranking}` : 'Leading institution'}

COURSE DETAILS:
- Title: ${course.course_title}
- Level: ${course.level}
- Duration: ${course.duration || 'Standard duration'}
- Subject: ${course.subject_area}

EMAIL REQUIREMENTS:
1. Professional greeting addressing admissions team
2. Clear subject line mentioning course and inquiry type
3. Brief introduction of student with relevant qualifications
4. Express specific interest in the course (mention why it matches student's goals)
5. Ask about:
   - Application deadlines for upcoming intake
   - Entry requirements and English language requirements
   - Scholarship opportunities for international students
   - Application process timeline
6. Professional closing with student's contact details
7. Keep total length to 200-250 words
8. Warm, professional tone

Return JSON with subject and body fields.`;

          const emailContent = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" }
              }
            }
          });

          // Check for urgency
          const isUrgent = course.intake && new Date(course.intake) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          outreaches.push({
            student_id: student.id,
            university_id: university.id,
            course_id: course.id,
            outreach_type: 'course_inquiry',
            email_subject: emailContent.subject,
            email_body: emailContent.body,
            is_urgent: isUrgent,
            urgency_reason: isUrgent ? 'Application deadline within 30 days' : null,
            status: 'draft',
            automated: true
          });

          // Delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Save all outreaches
      for (const outreach of outreaches) {
        await base44.entities.UniversityOutreach.create(outreach);
      }

      return outreaches.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries(['university-outreaches']);
      toast.success(`Generated ${count} outreach emails!`);
      setGenerating(false);
    },
    onError: (error) => {
      toast.error('Failed to generate outreaches: ' + error.message);
      setGenerating(false);
    }
  });

  const handleGenerate = () => {
    setGenerating(true);
    generateOutreaches.mutate();
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#F37021' }} />
          Auto-Generate Outreaches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Minimum Profile Completeness</Label>
          <Select value={filters.minProfileComplete.toString()} onValueChange={(v) => setFilters({...filters, minProfileComplete: parseInt(v)})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="70">70%</SelectItem>
              <SelectItem value="85">85%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Study Level</Label>
          <Select value={filters.studyLevel} onValueChange={(v) => setFilters({...filters, studyLevel: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Foundation">Foundation</SelectItem>
              <SelectItem value="Undergraduate">Undergraduate</SelectItem>
              <SelectItem value="Postgraduate">Postgraduate</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full"
          style={{ backgroundColor: '#0066CC' }}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Outreaches
            </>
          )}
        </Button>

        <p className="text-xs text-slate-600">
          AI will analyze student profiles and generate personalized inquiry emails to matching universities.
        </p>
      </CardContent>
    </Card>
=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UniversityOutreachGenerator({ studentId, onSuccess }) {
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [emailSubject, setEmailSubject] = useState('Inquiry from {{UNIVERSITY_NAME}} - {{STUDENT_NAME}}');
  const [emailTemplate, setEmailTemplate] = useState(
    `Dear {{UNIVERSITY_NAME}} Admissions Team,\n\nI am writing to express my interest in studying at {{UNIVERSITY_NAME}}. I am particularly interested in {{STUDENT_INTERESTS}}.\n\nPlease find my details below:\nName: {{STUDENT_NAME}}\nEmail: {{STUDENT_EMAIL}}\nPhone: {{STUDENT_PHONE}}\n\nI would appreciate any information regarding your programs and admissions process.\n\nBest regards,\n{{STUDENT_NAME}}`
  );

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list()
  });

  const { data: student } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => base44.entities.StudentProfile.filter({ id: studentId })
  });

  const sendOutreach = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sendUniversityOutreach', {
        studentId,
        universityIds: selectedUniversities,
        emailTemplate,
        emailSubject
      });
      return response;
    },
    onSuccess: (data) => {
      toast.success(`Outreach sent to ${data.data.sent} universities`);
      setSelectedUniversities([]);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send outreach');
    }
  });

  const toggleUniversity = (uniId) => {
    if (selectedUniversities.includes(uniId)) {
      setSelectedUniversities(selectedUniversities.filter(id => id !== uniId));
    } else {
      setSelectedUniversities([...selectedUniversities, uniId]);
    }
  };

  const emailVariables = [
    { key: '{{STUDENT_NAME}}', label: 'Student Name' },
    { key: '{{STUDENT_EMAIL}}', label: 'Student Email' },
    { key: '{{STUDENT_PHONE}}', label: 'Student Phone' },
    { key: '{{UNIVERSITY_NAME}}', label: 'University Name' },
    { key: '{{STUDENT_INTERESTS}}', label: 'Preferred Fields' },
    { key: '{{CAREER_GOALS}}', label: 'Career Goals' },
    { key: '{{ACHIEVEMENTS}}', label: 'Key Achievements' },
    { key: '{{ACTIVITIES}}', label: 'Activities & Involvement' }
  ];

  return (
    <div className="space-y-6">
      {/* University Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Target Universities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {universities.map(uni => (
              <button
                key={uni.id}
                onClick={() => toggleUniversity(uni.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedUniversities.includes(uni.id)
                    ? 'border-education-blue bg-blue-50'
                    : 'border-slate-200 hover:border-education-blue'
                }`}
              >
                <p className="font-medium text-sm text-slate-900">{uni.university_name}</p>
                <p className="text-xs text-slate-500">{uni.country}</p>
              </button>
            ))}
          </div>
          {selectedUniversities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUniversities.map(uniId => {
                const uni = universities.find(u => u.id === uniId);
                return (
                  <Badge key={uniId} className="bg-education-blue">
                    {uni?.university_name}
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Subject */}
      <Card>
        <CardHeader>
          <CardTitle>Email Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Email subject"
          />
          <p className="text-xs text-slate-500 mt-2">Use variables: {{UNIVERSITY_NAME}}, {{STUDENT_NAME}}</p>
        </CardContent>
      </Card>

      {/* Email Template */}
      <Card>
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            placeholder="Email content"
            rows={10}
          />
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">Available Variables:</p>
            <div className="grid grid-cols-2 gap-2">
              {emailVariables.map(var_ => (
                <button
                  key={var_.key}
                  onClick={() => setEmailTemplate(emailTemplate + ` ${var_.key}`)}
                  className="text-left p-2 rounded bg-slate-100 hover:bg-slate-200 transition-colors text-xs"
                >
                  <span className="font-mono text-education-blue">{var_.key}</span>
                  <p className="text-slate-600">{var_.label}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {student && student[0] && (
        <Card className="border-l-4 border-alo-orange">
          <CardHeader>
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <p className="font-semibold text-slate-900">Subject:</p>
              <p className="text-slate-600 italic">
                {emailSubject
                  .replace('{{STUDENT_NAME}}', student[0].first_name)
                  .replace('{{UNIVERSITY_NAME}}', 'University Name')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Button */}
      <Button
        onClick={() => sendOutreach.mutate()}
        disabled={selectedUniversities.length === 0 || sendOutreach.isPending}
        className="w-full bg-education-blue hover:bg-blue-700 h-12 text-lg"
      >
        {sendOutreach.isPending ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Outreach to {selectedUniversities.length} Universities
          </>
        )}
      </Button>
    </div>
>>>>>>> last/main
  );
}