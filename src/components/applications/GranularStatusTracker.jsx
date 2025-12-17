import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Circle, CheckCircle, Clock, AlertCircle, FileText, 
  Building2, Mail, Video, Plane, GraduationCap 
} from 'lucide-react';
import { format } from 'date-fns';

const universityStages = [
  { 
    key: 'application_received', 
    label: 'Application Received', 
    icon: FileText,
    description: 'Your application has been received by the university'
  },
  { 
    key: 'under_review', 
    label: 'Under Review', 
    icon: Building2,
    description: 'Admissions team is reviewing your application'
  },
  { 
    key: 'additional_documents_requested', 
    label: 'Documents Requested', 
    icon: AlertCircle,
    description: 'University has requested additional documents'
  },
  { 
    key: 'interview_scheduled', 
    label: 'Interview Scheduled', 
    icon: Video,
    description: 'Interview has been scheduled with the university'
  },
  { 
    key: 'decision_pending', 
    label: 'Decision Pending', 
    icon: Clock,
    description: 'Final decision is being made'
  },
  { 
    key: 'offer_received', 
    label: 'Offer Received', 
    icon: Mail,
    description: 'Congratulations! You have received an offer'
  },
  { 
    key: 'visa_processing', 
    label: 'Visa Processing', 
    icon: Plane,
    description: 'Visa application is being processed'
  },
  { 
    key: 'enrolled', 
    label: 'Enrolled', 
    icon: GraduationCap,
    description: 'Successfully enrolled in the program'
  }
];

export default function GranularStatusTracker({ application }) {
  const currentStageIndex = universityStages.findIndex(stage => 
    application.university_stage === stage.key || 
    (stage.key === 'application_received' && !application.university_stage)
  );
  
  const activeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
          <Building2 className="w-5 h-5" />
          University Application Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {universityStages.map((stage, index) => {
            const StageIcon = stage.icon;
            const isCompleted = index < activeStageIndex;
            const isActive = index === activeStageIndex;
            const isPending = index > activeStageIndex;
            
            return (
              <div key={stage.key} className="relative">
                <div className={`flex gap-4 ${!isActive && 'opacity-60'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500' 
                        : isActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-300 bg-slate-50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : isActive ? (
                        <StageIcon className="w-5 h-5" style={{ color: '#0066CC' }} />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    {index < universityStages.length - 1 && (
                      <div className={`w-0.5 h-12 ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold ${
                        isActive ? 'text-slate-900' : 'text-slate-600'
                      }`}>
                        {stage.label}
                      </h4>
                      {isActive && (
                        <Badge style={{ backgroundColor: '#F37021', color: '#000000' }}>
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-green-500 text-white">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {stage.description}
                    </p>
                    {isActive && application.university_stage_updated && (
                      <p className="text-xs text-slate-500 mt-2">
                        Updated: {format(new Date(application.university_stage_updated), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {application.counselor_notes && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2" style={{ color: '#0066CC' }}>
              Counselor Notes
            </h4>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {application.counselor_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}