import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Wand2, Download, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SOPGenerator({ studentProfile }) {
  const [courseName, setCourseName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [whyThisCourse, setWhyThisCourse] = useState('');
  const [generatedSOP, setGeneratedSOP] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: educationRecords = [] } = useQuery({
    queryKey: ['education-records', studentProfile?.id],
    queryFn: () => base44.entities.EducationRecord.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: workExperience = [] } = useQuery({
    queryKey: ['work-experience', studentProfile?.id],
    queryFn: () => base44.entities.WorkExperience.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const generateSOPMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional Statement of Purpose (SOP) for university admission.

Student Information:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Nationality: ${studentProfile.nationality}

Academic Background:
${educationRecords.map(edu => `- ${edu.level}: ${edu.institution}, ${edu.subject} (${edu.result}), ${edu.passing_year}`).join('\n')}

Work Experience:
${workExperience.length > 0 ? workExperience.map(work => `- ${work.designation} at ${work.company_name} (${work.start_date} to ${work.currently_working ? 'Present' : work.end_date})`).join('\n') : 'No work experience'}

Course Applying For: ${courseName}
University: ${universityName}

Career Goals:
${careerGoals}

Why This Course:
${whyThisCourse}

Generate a compelling, professional SOP (800-1000 words) that:
1. Introduces the student and their academic journey
2. Highlights relevant academic achievements and work experience
3. Explains motivation for choosing this specific course and university
4. Outlines clear career goals
5. Demonstrates fit for the program
6. Maintains a formal yet personal tone

Format it with clear paragraphs.`,
        response_json_schema: {
          type: "object",
          properties: {
            sop: { type: "string" }
          }
        }
      });
      return response.sop;
    },
    onSuccess: (sop) => {
      setGeneratedSOP(sop);
      setIsEditing(true);
      toast.success('SOP generated successfully!');
    },
  });

  const handleDownload = () => {
    const blob = new Blob([generatedSOP], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOP_${studentProfile.first_name}_${studentProfile.last_name}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('SOP downloaded!');
  };

  const canGenerate = courseName && universityName && careerGoals && whyThisCourse;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" style={{ color: '#F37021' }} />
          AI-Powered SOP Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!generatedSOP ? (
          <>
            <div>
              <Label>Course Name *</Label>
              <Input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., MSc Computer Science"
                className="mt-2"
              />
            </div>

            <div>
              <Label>University Name *</Label>
              <Input
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="e.g., University of Oxford"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Career Goals *</Label>
              <Textarea
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="Describe your short-term and long-term career goals..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label>Why This Course? *</Label>
              <Textarea
                value={whyThisCourse}
                onChange={(e) => setWhyThisCourse(e.target.value)}
                placeholder="Explain why you're interested in this specific course..."
                className="mt-2"
                rows={4}
              />
            </div>

            <Button
              onClick={() => generateSOPMutation.mutate()}
              disabled={!canGenerate || generateSOPMutation.isPending}
              className="w-full"
              style={{ backgroundColor: '#F37021' }}
            >
              {generateSOPMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating SOP...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate SOP with AI
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Generated SOP</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              {isEditing ? (
                <Textarea
                  value={generatedSOP}
                  onChange={(e) => setGeneratedSOP(e.target.value)}
                  className="mt-2 font-serif"
                  rows={20}
                />
              ) : (
                <div className="bg-slate-50 p-6 rounded-lg border whitespace-pre-wrap font-serif">
                  {generatedSOP}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedSOP('');
                  setIsEditing(false);
                }}
                className="flex-1"
              >
                Generate New SOP
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1"
                style={{ backgroundColor: '#0066CC' }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Download
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}