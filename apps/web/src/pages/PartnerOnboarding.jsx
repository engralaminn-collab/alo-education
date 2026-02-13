import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import OrganizationInfoStep from '@/components/onboarding/OrganizationInfoStep';
import ReferralPreferencesStep from '@/components/onboarding/ReferralPreferencesStep';
import TeamSetupStep from '@/components/onboarding/TeamSetupStep';
import WelcomeMaterialsStep from '@/components/onboarding/WelcomeMaterialsStep';
import CompletionStep from '@/components/onboarding/CompletionStep';

export default function PartnerOnboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: staffRole } = useQuery({
    queryKey: ['staff-role', user?.id],
    queryFn: async () => {
      const roles = await base44.entities.StaffRole.filter({ user_id: user.id });
      return roles.find(r => r.role === 'partner');
    },
    enabled: !!user?.id
  });

  const { data: onboarding, isLoading } = useQuery({
    queryKey: ['partner-onboarding', staffRole?.partner_organization_id],
    queryFn: async () => {
      const existing = await base44.entities.PartnerOnboarding.filter({
        partner_id: staffRole.partner_organization_id,
        user_id: user.id
      });
      
      if (existing[0]) {
        return existing[0];
      }
      
      // Create new onboarding
      return await base44.entities.PartnerOnboarding.create({
        partner_id: staffRole.partner_organization_id,
        user_id: user.id,
        current_step: 1,
        completed_steps: [],
        status: 'in_progress'
      });
    },
    enabled: !!staffRole?.partner_organization_id && !!user?.id
  });

  useEffect(() => {
    if (onboarding?.current_step) {
      setCurrentStep(onboarding.current_step);
    }
  }, [onboarding]);

  const updateOnboarding = useMutation({
    mutationFn: async (updates) => {
      await base44.entities.PartnerOnboarding.update(onboarding.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-onboarding'] });
    }
  });

  const completeStep = async (stepNumber, stepData) => {
    const completedSteps = [...(onboarding.completed_steps || []), stepNumber];
    const nextStep = stepNumber + 1;
    const progress = (completedSteps.length / 5) * 100;

    await updateOnboarding.mutateAsync({
      ...stepData,
      current_step: nextStep,
      completed_steps: completedSteps,
      completion_percentage: progress,
      status: nextStep > 5 ? 'completed' : 'in_progress',
      completed_at: nextStep > 5 ? new Date().toISOString() : undefined
    });

    if (nextStep <= 5) {
      setCurrentStep(nextStep);
    } else {
      toast.success('Onboarding completed!');
      setTimeout(() => navigate(createPageUrl('PartnerPortal')), 2000);
    }
  };

  const steps = [
    { number: 1, title: 'Organization Info', icon: '🏢' },
    { number: 2, title: 'Referral Preferences', icon: '🎯' },
    { number: 3, title: 'Team Setup', icon: '👥' },
    { number: 4, title: 'Welcome Materials', icon: '📚' },
    { number: 5, title: 'Complete', icon: '🎉' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <p>Loading onboarding...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-2 shadow-sm mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-slate-700">Partner Onboarding</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome to ALO Education</h1>
          <p className="text-lg text-slate-600">Let's get your partner account set up in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8 bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                      onboarding?.completed_steps?.includes(step.number)
                        ? 'bg-green-500 scale-110'
                        : currentStep === step.number
                        ? 'bg-education-blue animate-pulse'
                        : 'bg-slate-200'
                    }`}>
                      {onboarding?.completed_steps?.includes(step.number) ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <span>{step.icon}</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium text-center ${
                      currentStep === step.number ? 'text-education-blue' : 'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 bg-slate-200 rounded">
                      <div 
                        className="h-full bg-education-blue rounded transition-all"
                        style={{ width: onboarding?.completed_steps?.includes(step.number) ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <Progress value={onboarding?.completion_percentage || 0} className="h-2" />
            <p className="text-center text-sm text-slate-600 mt-2">
              {onboarding?.completion_percentage || 0}% Complete
            </p>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <OrganizationInfoStep 
              onboarding={onboarding} 
              onComplete={(data) => completeStep(1, data)} 
            />
          )}
          {currentStep === 2 && (
            <ReferralPreferencesStep 
              onboarding={onboarding} 
              onComplete={(data) => completeStep(2, data)} 
            />
          )}
          {currentStep === 3 && (
            <TeamSetupStep 
              partnerId={staffRole?.partner_organization_id}
              onComplete={() => completeStep(3, {})} 
            />
          )}
          {currentStep === 4 && (
            <WelcomeMaterialsStep 
              onboarding={onboarding}
              partnerId={staffRole?.partner_organization_id}
              onComplete={(data) => completeStep(4, data)} 
            />
          )}
          {currentStep === 5 && (
            <CompletionStep onboarding={onboarding} />
          )}
        </div>

        {/* Skip Option */}
        {currentStep < 5 && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('PartnerPortal'))}
              className="text-slate-500"
            >
              Skip for now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}