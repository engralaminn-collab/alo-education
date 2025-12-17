import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, GraduationCap, Video, FileText, 
  CheckCircle2, Clock, TrendingUp, Sparkles,
  ExternalLink, Target, Award
} from 'lucide-react';
import { toast } from "sonner";

export default function PersonalizedLearningPath({ studentId }) {
  const [learningPath, setLearningPath] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-learning', studentId],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ id: studentId });
      return profiles[0];
    },
    enabled: !!studentId,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['student-apps-learning', studentId],
    queryFn: () => base44.entities.Application.filter({ student_id: studentId }),
    enabled: !!studentId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['app-courses'],
    queryFn: async () => {
      const courseIds = applications.map(a => a.course_id).filter(Boolean);
      if (courseIds.length === 0) return [];
      return Promise.all(courseIds.map(id => 
        base44.entities.Course.filter({ id }).then(c => c[0])
      ));
    },
    enabled: applications.length > 0,
  });

  const generatePathMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized learning path for a student with the following profile:

Academic Background:
- Level: ${studentProfile?.admission_preferences?.study_level || 'Not specified'}
- Field: ${studentProfile?.admission_preferences?.study_area || 'Not specified'}
- Education: ${studentProfile?.education_history?.map(e => `${e.academic_level} - ${e.result_value}`).join(', ')}

English Proficiency:
${studentProfile?.english_proficiency?.test_type ? 
  `- ${studentProfile.english_proficiency.test_type}: ${studentProfile.english_proficiency.overall_score}` : 
  '- No test yet'}

Target Courses:
${courses.map(c => `- ${c.course_title} (${c.level})`).join('\n')}

Generate a comprehensive learning path with:
1. Pre-admission skill building (2-3 items)
2. English test preparation (if needed, 2-3 items)
3. Subject-specific preparation (3-4 items)
4. Application skills (2-3 items)
5. Pre-departure preparation (2-3 items)

For each item include: title, description, estimated hours, priority (high/medium/low), type (course/reading/video/practice), and a relevant free resource link.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            estimated_total_hours: { type: "number" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section_title: { type: "string" },
                  section_goal: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        estimated_hours: { type: "number" },
                        priority: { type: "string" },
                        type: { type: "string" },
                        resource_link: { type: "string" },
                        resource_name: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setLearningPath(data);
      toast.success('Personalized learning path created!');
    },
    onError: () => {
      toast.error('Failed to generate learning path');
    },
  });

  const toggleComplete = (sectionIdx, itemIdx) => {
    const key = `${sectionIdx}-${itemIdx}`;
    setCompletedItems(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
  };

  const typeIcons = {
    course: BookOpen,
    reading: FileText,
    video: Video,
    practice: Target,
  };

  if (!studentProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-slate-500">
          Loading student profile...
        </CardContent>
      </Card>
    );
  }

  const totalItems = learningPath?.sections?.reduce((acc, section) => 
    acc + section.items.length, 0) || 0;
  const completedCount = completedItems.length;
  const progressPercent = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-500" />
            Personalized Learning Path
          </CardTitle>
          <Button
            size="sm"
            onClick={() => generatePathMutation.mutate()}
            disabled={generatePathMutation.isPending}
          >
            {generatePathMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {learningPath ? 'Regenerate' : 'Generate Path'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!learningPath ? (
          <div className="text-center py-8 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">Generate an AI-powered personalized learning path</p>
            <p className="text-sm">Based on your profile, goals, and target courses</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Award className="w-6 h-6 text-purple-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">Your Learning Journey</h4>
                  <p className="text-sm text-slate-600">{learningPath.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{learningPath.estimated_total_hours}h total</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{completedCount}/{totalItems} completed</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium text-slate-700">Overall Progress</span>
                <span className="text-slate-500">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {learningPath.sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="border rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {section.section_title}
                    </h3>
                    <p className="text-sm text-slate-600">{section.section_goal}</p>
                  </div>

                  <div className="space-y-3">
                    {section.items.map((item, itemIdx) => {
                      const isCompleted = completedItems.includes(`${sectionIdx}-${itemIdx}`);
                      const Icon = typeIcons[item.type] || BookOpen;

                      return (
                        <div
                          key={itemIdx}
                          className={`border rounded-lg p-3 transition-all ${
                            isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleComplete(sectionIdx, itemIdx)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
                                isCompleted 
                                  ? 'bg-emerald-500 border-emerald-500' 
                                  : 'border-slate-300 hover:border-emerald-500'
                              }`}
                            >
                              {isCompleted && (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className={`font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge variant="outline" className="text-xs">
                                    <Icon className="w-3 h-3 mr-1" />
                                    {item.type}
                                  </Badge>
                                  <Badge className={priorityColors[item.priority]}>
                                    {item.priority}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-sm text-slate-600 mb-2">
                                {item.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.estimated_hours}h
                                  </span>
                                </div>

                                {item.resource_link && (
                                  <a
                                    href={item.resource_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    {item.resource_name || 'View Resource'}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}