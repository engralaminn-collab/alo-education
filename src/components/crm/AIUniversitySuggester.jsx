import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIUniversitySuggester({ student, universities, courses, onSelect }) {
  const [suggestions, setSuggestions] = React.useState(null);

  const generateSuggestions = useMutation({
    mutationFn: async () => {
      const prompt = `Analyze this student profile and suggest the top 5 most suitable universities from the list.

STUDENT PROFILE:
- Name: ${student.first_name} ${student.last_name}
- Preferred Destinations: ${student.preferred_study_destinations?.join(', ') || 'Not specified'}
- Study Level: ${student.admission_preferences?.study_level || 'Not specified'}
- Field of Interest: ${student.admission_preferences?.study_area || 'Not specified'}
- Language Proficiency (IELTS): ${student.language_proficiency?.ielts?.overall || 'Not provided'}
- Academic Background: ${student.education_records?.[0]?.level || 'Not provided'}
- Budget Consideration: ${student.funding_information?.funding_status || 'Not specified'}

AVAILABLE UNIVERSITIES:
${universities.slice(0, 30).map(u => `- ${u.university_name} (${u.country}), Ranking: ${u.qs_ranking || 'N/A'}`).join('\n')}

CRITERIA FOR SELECTION:
1. Match with preferred destinations
2. Appropriate for study level
3. Strong in student's field of interest
4. IELTS requirements match student's score
5. Ranking and reputation
6. Scholarship availability
7. Cost considerations

For each suggested university, provide:
- university_name: exact name from the list
- match_score: 0-100 (how well it matches)
- reasons: array of 3-4 specific reasons why it's a good match
- concerns: array of any potential concerns (can be empty)
- recommended_courses: array of 2-3 course titles to inquire about

Return JSON array of exactly 5 suggestions, ordered by match_score.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              university_name: { type: 'string' },
              match_score: { type: 'number' },
              reasons: { type: 'array', items: { type: 'string' } },
              concerns: { type: 'array', items: { type: 'string' } },
              recommended_courses: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setSuggestions(data);
      toast.success('AI suggestions generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate suggestions');
    }
  });

  return (
    <Card className="border-2" style={{ borderColor: '#0066CC' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
          <Sparkles className="w-5 h-5" />
          AI University Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestions ? (
          <div className="text-center py-6">
            <p className="text-slate-600 mb-4">
              Let AI analyze this student's profile and suggest the best matching universities
            </p>
            <Button
              onClick={() => generateSuggestions.mutate()}
              disabled={generateSuggestions.isPending}
              style={{ backgroundColor: '#0066CC' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateSuggestions.isPending ? 'Analyzing...' : 'Get AI Suggestions'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              const university = universities.find(u => 
                u.university_name === suggestion.university_name ||
                u.university_name?.toLowerCase().includes(suggestion.university_name.toLowerCase())
              );

              return (
                <div
                  key={index}
                  className="p-4 border-2 rounded-lg hover:bg-slate-50 transition-colors"
                  style={{ borderColor: index === 0 ? '#F37021' : '#E2E8F0' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">
                          {suggestion.university_name}
                        </h4>
                        {index === 0 && (
                          <Badge style={{ backgroundColor: '#F37021', color: 'white' }}>
                            Top Match
                          </Badge>
                        )}
                      </div>
                      {university && (
                        <p className="text-xs text-slate-500 mb-2">
                          {university.country} • Rank: {university.qs_ranking || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ 
                        color: suggestion.match_score >= 80 ? '#10B981' : 
                               suggestion.match_score >= 60 ? '#F59E0B' : '#3B82F6'
                      }}>
                        {suggestion.match_score}
                      </div>
                      <p className="text-xs text-slate-500">Match</p>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-green-900 mb-1">Why it's a good match:</p>
                    <div className="space-y-1">
                      {suggestion.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-green-800">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Concerns */}
                  {suggestion.concerns?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-amber-900 mb-1">Considerations:</p>
                      <div className="space-y-1">
                        {suggestion.concerns.map((concern, i) => (
                          <div key={i} className="text-xs text-amber-800">
                            • {concern}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Courses */}
                  {suggestion.recommended_courses?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Courses to inquire about:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.recommended_courses.map((course, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {university && (
                    <Button
                      size="sm"
                      onClick={() => onSelect(university, suggestion)}
                      className="w-full"
                      style={{ backgroundColor: '#F37021' }}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Create Outreach
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}