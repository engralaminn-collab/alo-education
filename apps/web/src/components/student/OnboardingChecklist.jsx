import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, FileText, User, GraduationCap, FileCheck } from 'lucide-react';
import { createPageUrl } from './utils';
import { Link } from 'react-router-dom';

const onboardingSteps = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Fill in your personal information and contact details',
    icon: User,
    page: '/MyProfile',
    checkField: (profile) => profile.first_name && profile.last_name && profile.email && profile.phone
  },
  {
    id: 'education',
    title: 'Add Education History',
    description: 'Add your academic background and qualifications',
    icon: GraduationCap,
    page: '/MyProfile?tab=education',
    checkField: (profile) => profile.education_history && profile.education_history.length > 0
  },
  {
    id: 'documents',
    title: 'Upload Required Documents',
    description: 'Upload passport, transcripts, and other essential documents',
    icon: FileText,
    page: '/MyDocuments',
    checkField: (profile, documents) => documents && documents.length >= 2
  },
  {
    id: 'preferences',
    title: 'Set Study Preferences',
    description: 'Tell us about your preferred countries and fields of study',
    icon: FileCheck,
    page: '/MyProfile?tab=preferences',
    checkField: (profile) => profile.preferred_countries && profile.preferred_countries.length > 0
  }
];

export default function OnboardingChecklist({ studentId }) {
  const queryClient = useQueryClient();
  const [expandedStep, setExpandedStep] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ id: studentId });
      return profiles[0];
    }
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['student-documents', studentId],
    queryFn: () => base44.entities.Document.filter({ student_id: studentId })
  });

  const completedSteps = onboardingSteps.filter(step => 
    step.checkField(profile || {}, documents)
  ).length;
  const progress = (completedSteps / onboardingSteps.length) * 100;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Getting Started Checklist</CardTitle>
          <Badge className="bg-education-blue text-white">
            {completedSteps}/{onboardingSteps.length} Complete
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-600 mt-2">Complete these steps to get the most out of ALO Education</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {onboardingSteps.map((step, index) => {
          const isCompleted = step.checkField(profile || {}, documents);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`border rounded-lg p-4 transition-all ${
                isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  isCompleted ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isCompleted ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                  {!isCompleted && (
                    <Link to={createPageUrl(step.page.split('?')[0].slice(1)) + (step.page.includes('?') ? '?' + step.page.split('?')[1] : '')}>
                      <Button size="sm" className="bg-education-blue">
                        Complete This Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {progress === 100 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-900 mb-1">Congratulations! 🎉</h4>
            <p className="text-sm text-green-700">
              You've completed your onboarding. Ready to explore courses?
            </p>
            <Link to={createPageUrl('CourseFinder')}>
              <Button className="mt-3 bg-green-600 hover:bg-green-700">
                Find Courses
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}