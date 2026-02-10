import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, ArrowRight, User, BookOpen, Target, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIStudentOnboarding({ studentId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: student } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => base44.entities.StudentProfile.get(studentId),
    enabled: !!studentId
  });

  const generateOnboarding = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generateAIOnboarding', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setOnboardingData(data);
      toast.success('Welcome! Your personalized onboarding is ready');
    }
  });

  const completeTask = useMutation({
    mutationFn: async (taskId) => {
      // Mark task as completed
      await base44.entities.Task.update(taskId, { status: 'completed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', studentId]);
      toast.success('Task completed!');
    }
  });

  useEffect(() => {
    if (studentId && !onboardingData) {
      generateOnboarding.mutate();
    }
  }, [studentId]);

  if (!onboardingData) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-lg font-semibold text-slate-700">
            {generateOnboarding.isPending ? 'Creating your personalized onboarding...' : 'Loading...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const steps = [
    {
      id: 1,
      icon: User,
      title: 'Welcome Message',
      color: 'blue'
    },
    {
      id: 2,
      icon: Target,
      title: 'Your Goals',
      color: 'purple'
    },
    {
      id: 3,
      icon: BookOpen,
      title: 'Course Recommendations',
      color: 'green'
    },
    {
      id: 4,
      icon: FileText,
      title: 'Next Steps',
      color: 'orange'
    }
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Onboarding Progress</span>
            <span className="text-sm text-slate-600">{currentStep} of {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id ? 'bg-green-500' :
                  currentStep === step.id ? `bg-${step.color}-500` : 'bg-slate-200'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <step.icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-xs text-center">{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="w-6 h-6" />
              Welcome to ALO Education, {student?.first_name}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-blue">
              <p className="text-lg text-blue-900">{onboardingData.welcome_message}</p>
            </div>
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-blue-600 hover:bg-blue-700">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Target className="w-6 h-6" />
              Your Education Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingData.profile_insights && (
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-900">Based on your profile:</h4>
                <ul className="space-y-2">
                  {onboardingData.profile_insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                      <span className="text-purple-800">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button onClick={() => setCurrentStep(3)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <BookOpen className="w-6 h-6" />
              Recommended Courses & Programs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingData.course_recommendations?.length > 0 ? (
              <div className="space-y-3">
                {onboardingData.course_recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900">{rec.program}</h4>
                    <p className="text-sm text-green-700 mt-1">{rec.university}</p>
                    <p className="text-sm text-slate-600 mt-2">{rec.reason}</p>
                    <Badge className="mt-2 bg-green-600">{rec.match_score}% Match</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-800">We'll help you find the perfect courses based on your profile!</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={() => setCurrentStep(4)} className="flex-1 bg-green-600 hover:bg-green-700">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <FileText className="w-6 h-6" />
              Your Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingData.essential_tasks?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-900">Complete these essential tasks:</h4>
                {onboardingData.essential_tasks.map((task, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg border border-orange-200 flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-orange-900">{task.title}</h5>
                      <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      {task.priority && <Badge className="mt-2" variant={task.priority === 'high' ? 'destructive' : 'default'}>{task.priority} priority</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
              <Button 
                onClick={() => {
                  toast.success('Onboarding complete! Welcome aboard 🎉');
                  navigate(createPageUrl('MyProfile'));
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Complete Onboarding <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}