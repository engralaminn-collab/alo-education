import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AINextSteps({ studentProfile, applications, documents, currentStage }) {
  const [recommendations, setRecommendations] = useState(null);

  const getRecommendations = useMutation({
    mutationFn: async () => {
      const profileData = {
        completeness: studentProfile?.profile_completeness || 0,
        hasApplications: applications.length > 0,
        applicationStatuses: applications.map(a => a.status),
        documentsCount: documents.length,
        preferredCountries: studentProfile?.preferred_countries || [],
        degreeLevel: studentProfile?.preferred_degree_level,
        currentStage,
      };

      const prompt = `As a study abroad advisor, analyze this student's profile and provide 3-4 specific, actionable next steps they should take:

Student Status:
- Profile completeness: ${profileData.completeness}%
- Applications: ${profileData.hasApplications ? applications.length : 0}
- Application statuses: ${profileData.applicationStatuses.join(', ') || 'None'}
- Documents uploaded: ${profileData.documentsCount}
- Preferred destinations: ${profileData.preferredCountries.join(', ') || 'Not specified'}
- Degree level: ${profileData.degreeLevel || 'Not specified'}
- Current journey stage: ${currentStage}/6

Provide concrete, prioritized next steps. Return ONLY a JSON array of objects with "action", "priority" (high/medium/low), and "description" fields.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.steps || [];
    },
    onSuccess: (data) => {
      setRecommendations(data);
    },
  });

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI-Powered Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recommendations && !getRecommendations.isPending && (
          <div className="text-center py-6">
            <p className="text-slate-600 mb-4">
              Get personalized recommendations based on your current progress
            </p>
            <Button 
              onClick={() => getRecommendations.mutate()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Recommendations
            </Button>
          </div>
        )}

        {getRecommendations.isPending && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-600">Analyzing your profile...</p>
          </div>
        )}

        <AnimatePresence>
          {recommendations && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {recommendations.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 flex-1">
                      {step.action}
                    </h4>
                    <Badge className={priorityColors[step.priority?.toLowerCase()] || priorityColors.medium}>
                      {step.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </motion.div>
              ))}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => getRecommendations.mutate()}
                className="w-full mt-2"
              >
                Refresh Recommendations
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}