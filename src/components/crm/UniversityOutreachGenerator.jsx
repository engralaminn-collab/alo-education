import React, { useState } from 'react';
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
  );
}