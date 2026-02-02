import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, FileText, Video, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingResourceSuggester({ student }) {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateResources = async () => {
    setLoading(true);
    
    try {
      const prompt = `You are an expert study abroad counselor. Based on this student profile, suggest personalized resources and next steps:

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Profile Completeness: ${student.profile_completeness || 0}%
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Fields of Interest: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Budget: ${student.budget_max || 'Not specified'}
- Current Status: ${student.status}
- Has English Test: ${student.english_proficiency?.test_type || 'No'}

Provide:
1. "immediate_actions": 3-5 specific immediate next steps they should take (with priority: urgent/high/medium)
2. "resources": 5-7 helpful resources (articles, guides, videos) with title, type (article/video/guide/checklist), and description
3. "timeline": suggested timeline for their application journey (array of milestones with month and description)
4. "tips": 3-5 personalized tips based on their profile`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            immediate_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            timeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  milestone: { type: "string" }
                }
              }
            },
            tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setResources(response);
      toast.success('Personalized resources generated!');
    } catch (error) {
      toast.error('Failed to generate resources');
    }
    
    setLoading(false);
  };

  const getResourceIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'checklist': return <CheckCircle className="w-4 h-4" />;
      case 'guide': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-blue-900">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Onboarding Assistant
          </span>
          <Button 
            onClick={generateResources}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Plan
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!resources ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <p className="text-sm text-blue-700">
              Generate personalized onboarding plan with resources and timeline
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Immediate Actions */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                Immediate Next Steps
              </h4>
              <div className="space-y-2">
                {resources.immediate_actions?.map((action, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border flex items-start gap-3">
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{action.action}</p>
                      <p className="text-xs text-slate-600">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Resources */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Recommended Resources
              </h4>
              <div className="space-y-2">
                {resources.resources?.map((resource, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-start gap-2">
                      <div className="text-purple-600 mt-0.5">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-slate-900">{resource.title}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {resource.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{resource.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                Suggested Timeline
              </h4>
              <div className="space-y-2">
                {resources.timeline?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border">
                    <div className="w-16 text-center flex-shrink-0">
                      <Badge className="bg-green-600">{item.month}</Badge>
                    </div>
                    <p className="text-sm text-slate-700 flex-1">{item.milestone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Tips */}
            {resources.tips?.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Personalized Tips
                </h4>
                <ul className="space-y-2">
                  {resources.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}