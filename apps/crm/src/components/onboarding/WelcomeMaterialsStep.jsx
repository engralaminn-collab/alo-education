import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight, Loader2, BookOpen, Lightbulb, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function WelcomeMaterialsStep({ onboarding, partnerId, onComplete }) {
  const [materials, setMaterials] = useState(onboarding?.welcome_materials || null);

  const generateMaterials = useMutation({
    mutationFn: async () => {
      const orgInfo = onboarding.organization_info;
      const refPrefs = onboarding.referral_preferences;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate personalized welcome materials for a new education partner:

Organization: ${orgInfo?.organization_name}
Country: ${orgInfo?.country}
Target Markets: ${orgInfo?.target_markets?.join(', ')}
Specialization: ${refPrefs?.specialization}
Referral Channels: ${refPrefs?.primary_channels?.join(', ')}

Please create:
1. A warm, personalized welcome message (2-3 paragraphs)
2. A quick start guide with 5 actionable steps
3. Top 5 referral tips specific to their profile

Format as JSON with keys: welcome_message, quick_start_guide (array), referral_tips (array)`,
        response_json_schema: {
          type: "object",
          properties: {
            welcome_message: { type: "string" },
            quick_start_guide: {
              type: "array",
              items: { type: "string" }
            },
            referral_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return {
        ...response,
        generated_at: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      setMaterials(data);
      toast.success('Welcome materials generated!');
    },
    onError: () => {
      toast.error('Failed to generate materials');
    }
  });

  const handleContinue = () => {
    if (materials) {
      onComplete({ welcome_materials: materials });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Your Personalized Welcome Materials
        </CardTitle>
        <p className="text-sm text-slate-600">
          AI-generated materials tailored specifically for your organization
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!materials ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Generate Your Welcome Package</h3>
            <p className="text-slate-600 mb-6">
              Our AI will create personalized onboarding materials based on your organization profile
            </p>
            <Button
              onClick={() => generateMaterials.mutate()}
              disabled={generateMaterials.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateMaterials.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Welcome Materials
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-education-blue" />
                <h4 className="font-semibold">Welcome Message</h4>
              </div>
              <p className="text-slate-700 whitespace-pre-line">{materials.welcome_message}</p>
            </div>

            {/* Quick Start Guide */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Quick Start Guide</h4>
              </div>
              <ol className="space-y-2 list-decimal list-inside">
                {materials.quick_start_guide?.map((step, index) => (
                  <li key={index} className="text-slate-700">{step}</li>
                ))}
              </ol>
            </div>

            {/* Referral Tips */}
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold">Top Referral Tips</h4>
              </div>
              <ul className="space-y-2">
                {materials.referral_tips?.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span className="text-slate-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={handleContinue} className="w-full bg-education-blue">
              Continue to Complete Onboarding
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}