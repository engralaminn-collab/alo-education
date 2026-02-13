import React, { useState } from 'react';
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
  );
}