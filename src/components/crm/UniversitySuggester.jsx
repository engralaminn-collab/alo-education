import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, TrendingUp, Target, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function UniversitySuggester({ students, universities, courses }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [suggestions, setSuggestions] = useState(null);

  const generateSuggestions = useMutation({
    mutationFn: async (studentId) => {
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      // Get all applications across all students for success rate analysis
      const allApplications = await base44.entities.Application.list();
      
      // Calculate university success rates
      const universityStats = {};
      allApplications.forEach(app => {
        if (!universityStats[app.university_id]) {
          universityStats[app.university_id] = { total: 0, successful: 0 };
        }
        universityStats[app.university_id].total++;
        if (['unconditional_offer', 'enrolled'].includes(app.status)) {
          universityStats[app.university_id].successful++;
        }
      });

      const studentContext = `
Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Preferred Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Budget: ${student.budget_max || 'Not specified'}
- Education: ${student.education?.highest_degree || 'Not specified'} in ${student.education?.field_of_study || 'Not specified'}
- GPA: ${student.education?.gpa || 'Not specified'}/${student.education?.gpa_scale || 'Not specified'}
- English: ${student.english_proficiency?.test_type || 'Not taken'} ${student.english_proficiency?.score || ''}

Available Universities:
${universities.slice(0, 30).map(u => `
- ${u.university_name}, ${u.country}
  Ranking: ${u.qs_ranking || u.ranking || 'Not ranked'}
  Success Rate: ${universityStats[u.id] ? ((universityStats[u.id].successful / universityStats[u.id].total) * 100).toFixed(0) : 0}%
  Applications: ${universityStats[u.id]?.total || 0}
`).join('\n')}

Based on the student profile and university success rates, suggest 5-7 target universities that:
1. Match student's preferences (country, field, level)
2. Are within budget range if specified
3. Have good acceptance rates for our students
4. Match academic profile (GPA, test scores)
5. Provide scholarship opportunities

For each suggestion, provide: university name, match score (0-100), key reasons (3-4 bullet points), and outreach priority (high/medium/low).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: studentContext,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  university_name: { type: "string" },
                  match_score: { type: "number" },
                  reasons: { type: "array", items: { type: "string" } },
                  priority: { type: "string" },
                  estimated_success_rate: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      // Match suggestions with actual university IDs
      const enrichedSuggestions = response.suggestions.map(sugg => {
        const university = universities.find(u => 
          u.university_name?.toLowerCase().includes(sugg.university_name.toLowerCase()) ||
          sugg.university_name.toLowerCase().includes(u.university_name?.toLowerCase())
        );
        return {
          ...sugg,
          university_id: university?.id,
          university
        };
      });

      return {
        ...response,
        suggestions: enrichedSuggestions,
        student
      };
    },
    onSuccess: (data) => {
      setSuggestions(data);
      toast.success('University suggestions generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate suggestions: ' + error.message);
    }
  });

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-amber-100 text-amber-700 border-amber-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          AI University Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Student</Label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} - {student.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => generateSuggestions.mutate(selectedStudent)}
          disabled={!selectedStudent || generateSuggestions.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {generateSuggestions.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get Suggestions
            </>
          )}
        </Button>

        {suggestions && (
          <div className="mt-6 space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">{suggestions.summary}</p>
            </div>

            <div className="space-y-3">
              {suggestions.suggestions.map((sugg, idx) => (
                <Card key={idx} className="border-l-4" style={{ borderLeftColor: sugg.priority === 'high' ? '#ef4444' : sugg.priority === 'medium' ? '#f59e0b' : '#3b82f6' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {sugg.university_name}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={priorityColors[sugg.priority]}>
                            {sugg.priority} priority
                          </Badge>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                            {sugg.estimated_success_rate} success
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-blue-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xl font-bold">{sugg.match_score}</span>
                        </div>
                        <p className="text-xs text-slate-500">Match Score</p>
                      </div>
                    </div>

                    <ul className="space-y-1">
                      {sugg.reasons.map((reason, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <Award className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}