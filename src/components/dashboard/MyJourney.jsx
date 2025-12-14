import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function MyJourney({ studentProfile, applications, documents, tasks }) {
  const steps = [
    { label: 'Profile Complete', completed: (studentProfile?.profile_completeness || 0) >= 80 },
    { label: 'Documents Uploaded', completed: documents?.length > 0 },
    { label: 'Application Submitted', completed: applications?.length > 0 },
    { label: 'Offer Received', completed: applications?.some(a => ['conditional_offer', 'unconditional_offer'].includes(a.status)) },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Your Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-600">Overall Progress</span>
              <span className="text-sm font-semibold" style={{ color: '#0B5ED7' }}>
                {completedSteps}/{steps.length} Steps
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-slate-400" />
                )}
                <span className={`flex-1 ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.label}
                </span>
                {step.completed && (
                  <Badge className="bg-green-100 text-green-700">Done</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}