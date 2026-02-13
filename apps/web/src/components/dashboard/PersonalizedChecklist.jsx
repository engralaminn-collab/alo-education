import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export default function PersonalizedChecklist({ studentProfile }) {
  const { data: applications = [] } = useQuery({
    queryKey: ['student-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['student-documents', studentProfile?.id],
    queryFn: () => base44.entities.Document.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: englishTests = [] } = useQuery({
    queryKey: ['english-tests', studentProfile?.id],
    queryFn: () => base44.entities.EnglishTest.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: educationRecords = [] } = useQuery({
    queryKey: ['education-records', studentProfile?.id],
    queryFn: () => base44.entities.EducationRecord.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  // Build personalized checklist
  const checklist = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      completed: !!(studentProfile?.first_name && studentProfile?.email && studentProfile?.phone),
      required: true
    },
    {
      id: 'passport',
      title: 'Upload Valid Passport',
      completed: studentProfile?.passport_details?.has_passport && 
                 documents.some(d => d.document_type === 'passport' && d.status === 'approved'),
      required: true
    },
    {
      id: 'english_test',
      title: 'Take English Proficiency Test',
      completed: englishTests.length > 0 && 
                 documents.some(d => d.document_type === 'english_test'),
      required: true
    },
    {
      id: 'education',
      title: 'Add Education History',
      completed: educationRecords.length > 0,
      required: true
    },
    {
      id: 'transcripts',
      title: 'Upload Academic Transcripts',
      completed: documents.some(d => d.document_type === 'transcript' && d.status === 'approved'),
      required: true
    },
    {
      id: 'sop',
      title: 'Prepare Statement of Purpose',
      completed: documents.some(d => d.document_type === 'sop'),
      required: false
    },
    {
      id: 'lor',
      title: 'Get Letters of Recommendation',
      completed: documents.filter(d => d.document_type === 'lor').length >= 2,
      required: false
    },
    {
      id: 'cv',
      title: 'Upload CV/Resume',
      completed: documents.some(d => d.document_type === 'cv'),
      required: false
    },
    {
      id: 'financial',
      title: 'Financial Proof Documents',
      completed: documents.some(d => d.document_type === 'financial_proof'),
      required: false
    },
    {
      id: 'apply',
      title: 'Submit University Application',
      completed: applications.some(a => a.status !== 'lead'),
      required: true
    }
  ];

  const completedCount = checklist.filter(item => item.completed).length;
  const requiredCount = checklist.filter(item => item.required).length;
  const completedRequired = checklist.filter(item => item.required && item.completed).length;
  const progressPercentage = (completedCount / checklist.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Application Checklist</CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Overall Progress</span>
            <span className="font-semibold">{completedCount}/{checklist.length} Completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-slate-500">
            Required: {completedRequired}/{requiredCount} • Optional: {completedCount - completedRequired}/{checklist.length - requiredCount}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklist.map(item => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              item.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${item.completed ? 'text-green-900' : 'text-slate-700'}`}>
                  {item.title}
                </span>
                {item.required && !item.completed && (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Required
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}