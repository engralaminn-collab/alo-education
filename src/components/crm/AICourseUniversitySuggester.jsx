import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Building2, GraduationCap, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AICourseUniversitySuggester({ formData }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      const prompt = `Based on this student profile, suggest the top 5 universities and courses they should consider:

Student Profile:
- Name: ${formData.first_name} ${formData.last_name}
- Education: ${formData.highest_education}
- Academic Scores: ${formData.bachelor_gpa || formData.grade_12_result || 'Not provided'}
- English Test: ${formData.has_ielts ? `IELTS ${formData.ielts_overall}` : formData.has_toefl ? `TOEFL ${formData.toefl_total}` : 'Not provided'}
- Work Experience: ${formData.work_experiences?.length || 0} positions
- Target Destinations: Any
- Study Level: ${formData.highest_education === 'grade_12' ? 'Undergraduate' : 'Postgraduate'}

Available Universities: ${universities.slice(0, 100).map(u => `${u.university_name} (${u.country})`).join('; ')}

Available Courses: ${courses.slice(0, 100).map(c => `${c.course_title} - ${c.level}, ${c.subject_area}`).join('; ')}

Return top 5 university suggestions and top 5 course suggestions with reasons why they're good fits.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            universities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">AI Suggestions</h3>
        </div>
        <Button 
          onClick={generateSuggestions}
          disabled={loading}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get Suggestions
            </>
          )}
        </Button>
      </div>

      {suggestions ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Recommended Universities
            </h4>
            <div className="space-y-2">
              {suggestions.universities?.map((uni, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-900">{uni.name}</p>
                      <p className="text-xs text-slate-600">{uni.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Recommended Courses
            </h4>
            <div className="space-y-2">
              {suggestions.courses?.map((course, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-slate-900">{course.title}</p>
                      <p className="text-xs text-slate-600">{course.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Sparkles className="w-8 h-8 text-purple-300 mx-auto mb-2" />
          <p className="text-sm text-purple-700">
            Click "Get Suggestions" to see AI-recommended universities and courses
          </p>
        </div>
      )}
    </div>
  );
}