import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Zap } from 'lucide-react';
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
      const eligibleStudents = students.filter(s => 
        (s.profile_completeness || 0) >= filters.minProfileComplete &&
        s.preferred_countries?.length > 0
      );

      const outreaches = [];

      for (const student of eligibleStudents.slice(0, 10)) {
        const matchingCourses = courses.filter(course => {
          if (filters.studyLevel !== 'all' && course.level !== filters.studyLevel) return false;
          if (student.preferred_countries && !student.preferred_countries.some(c => 
            course.country?.toLowerCase().includes(c.toLowerCase())
          )) return false;
          return true;
        });

        for (const course of matchingCourses.slice(0, 2)) {
          const university = universities.find(u => u.id === course.university_id);
          if (!university) continue;

          const prompt = `Draft a professional inquiry email to ${university.university_name || university.name} about ${course.course_title} for student ${student.first_name} ${student.last_name}.

Student Profile:
- Study Level: ${course.level}
- Preferred Destination: ${course.country}
- Academic Background: ${student.education?.highest_degree || 'Bachelor degree'}
- English: ${student.english_proficiency?.test_type || 'Not yet taken'} ${student.english_proficiency?.score || ''}
- GPA: ${student.education?.gpa || 'N/A'}

Email should:
1. Express interest in the specific course
2. Briefly mention student's qualifications
3. Ask about application deadlines and requirements
4. Inquire about scholarship opportunities
5. Request information about accommodation if available
6. Be professional, concise, and compelling

Return JSON with subject and body.`;

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

          const isUrgent = course.application_deadline && 
            new Date(course.application_deadline) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      for (const outreach of outreaches) {
        await base44.entities.UniversityOutreach.create(outreach);
      }

      return outreaches.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['university-outreaches'] });
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
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Auto-Generate Outreaches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Minimum Profile Completeness</Label>
          <Select value={filters.minProfileComplete.toString()} onValueChange={(v) => setFilters({...filters, minProfileComplete: parseInt(v)})}>
            <SelectTrigger className="mt-2">
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
            <SelectTrigger className="mt-2">
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
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
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