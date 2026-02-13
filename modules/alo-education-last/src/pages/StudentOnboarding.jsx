import React from 'react';
import { useSearchParams } from 'react-router-dom';
import DynamicOnboardingFlow from '@/components/onboarding/DynamicOnboardingFlow';
import StudentChatbot from '@/components/chat/StudentChatbot';

export default function StudentOnboarding() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome to ALO Education! 🎓
          </h1>
          <p className="text-slate-600">
            Let's personalize your study abroad journey with a few questions
          </p>
        </div>

        {studentId ? (
          <>
            <DynamicOnboardingFlow 
              studentId={studentId}
              onComplete={(data) => {
                console.log('Onboarding completed:', data);
              }}
            />
            <StudentChatbot studentId={studentId} context="onboarding" />
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-slate-600">Invalid onboarding link. Please contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}