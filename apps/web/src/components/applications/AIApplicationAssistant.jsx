import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, FileText, Lightbulb, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AIApplicationAssistant({ studentProfile, universityId, courseId }) {
  const [section, setSection] = useState('personal_statement');
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: university } = useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      if (!universityId) return null;
      const unis = await base44.entities.University.filter({ id: universityId });
      return unis[0];
    },
    enabled: !!universityId,
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async ({ type, content }) => {
      const sectionPrompts = {
        personal_statement: `You are an expert application essay advisor for international university admissions. A student is writing their personal statement for:
University: ${university?.university_name || 'the university'}
Course: ${course?.course_title || 'their chosen program'}
${course?.level ? `Level: ${course.level}` : ''}

Student Profile:
- Academic Background: ${studentProfile?.education_history?.[0]?.academic_level || 'Not specified'}
- Interests: ${studentProfile?.admission_preferences?.study_area || 'Not specified'}
- Work Experience: ${studentProfile?.work_experience?.length ? 'Yes' : 'No'}
${studentProfile?.work_experience?.[0] ? `- Recent Role: ${studentProfile.work_experience[0].designation} at ${studentProfile.work_experience[0].company_name}` : ''}

${content ? `Current Draft:\n${content}\n\n` : ''}

Provide:
1. CONTENT SUGGESTIONS: 3-4 specific points they should include based on their profile
2. STRUCTURE TIPS: How to organize their statement effectively
3. KEY THEMES: What themes to emphasize for this specific university/course
4. OPENING HOOK: Suggest a compelling opening sentence
5. COMMON PITFALLS: What to avoid

Be specific and actionable. Reference their actual background.`,

        statement_of_purpose: `You are an expert SOP advisor for graduate admissions. A student is writing their Statement of Purpose for:
University: ${university?.university_name || 'the university'}
Program: ${course?.course_title || 'their chosen program'}

Student Profile:
- Academic Background: ${studentProfile?.education_history?.[0]?.academic_level || 'Not specified'}
- Study Area: ${studentProfile?.admission_preferences?.study_area || 'Not specified'}
- Research Interests: ${studentProfile?.admission_preferences?.course_alignment || 'Not specified'}

${content ? `Current Draft:\n${content}\n\n` : ''}

Provide:
1. RESEARCH FOCUS: Help them articulate their research interests
2. ACADEMIC GOALS: How to express long-term academic objectives
3. FIT WITH PROGRAM: Specific ways to demonstrate fit with this program
4. FACULTY CONNECTIONS: Suggest how to reference relevant faculty (general advice)
5. CAREER TRAJECTORY: Link their goals to the program

Make it specific to graduate-level applications.`,

        motivation_letter: `You are an expert at crafting motivation letters for university applications. Guide this student applying to:
University: ${university?.university_name || 'the university'}
Course: ${course?.course_title || 'their chosen program'}

${content ? `Current Draft:\n${content}\n\n` : ''}

Provide:
1. MOTIVATION CLARITY: How to articulate why this specific program
2. UNIQUE VALUE: What makes them stand out
3. CULTURAL FIT: How to show alignment with university values
4. PASSION DEMONSTRATION: Ways to convey genuine interest
5. CLOSING IMPACT: Strong concluding paragraph ideas`
      };

      const prompt = sectionPrompts[type] || sectionPrompts.personal_statement;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      return response;
    },
    onSuccess: (data) => {
      setSuggestions(data);
    },
  });

  const improveDraftMutation = useMutation({
    mutationFn: async ({ content }) => {
      const prompt = `You are an expert application essay editor. Improve the following draft while maintaining the student's voice:

Application Type: ${section.replace(/_/g, ' ')}
University: ${university?.university_name || 'Not specified'}
Course: ${course?.course_title || 'Not specified'}

Draft:
${content}

Please provide:
1. An IMPROVED VERSION of the draft (maintain their core ideas but enhance clarity, impact, and professionalism)
2. SPECIFIC EDITS: Point out 3-4 specific improvements you made and why
3. NEXT STEPS: What else they should add or refine

Keep the improved version around the same length but more impactful.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      return response;
    },
    onSuccess: (data) => {
      setSuggestions(data);
      toast.success('Draft improved! Review the suggestions below');
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestions);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#6B21A8' }}>
          <Sparkles className="w-5 h-5" />
          AI Application Assistant
        </CardTitle>
        <p className="text-slate-500 text-sm">
          Get AI-powered help with your application essays and statements
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={section} onValueChange={setSection} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="personal_statement">Personal Statement</TabsTrigger>
            <TabsTrigger value="statement_of_purpose">SOP</TabsTrigger>
            <TabsTrigger value="motivation_letter">Motivation Letter</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div>
              <Label>Your Draft (Optional)</Label>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Paste your ${section.replace(/_/g, ' ')} draft here, or leave empty to get tips on how to start...`}
                className="min-h-[200px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => generateSuggestionsMutation.mutate({ type: section, content: draft })}
                disabled={generateSuggestionsMutation.isPending}
                className="flex-1"
                style={{ backgroundColor: '#6B21A8', color: 'white' }}
              >
                {generateSuggestionsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Tips & Suggestions
                  </>
                )}
              </Button>

              {draft && (
                <Button
                  onClick={() => improveDraftMutation.mutate({ content: draft })}
                  disabled={improveDraftMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  {improveDraftMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Improve My Draft
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {suggestions && (
            <div className="mt-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  AI Suggestions
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="text-purple-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="prose prose-sm prose-slate max-w-none">
                <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {suggestions}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Pro Tips:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Be authentic - let your unique voice shine through</li>
                  <li>• Use specific examples from your experience</li>
                  <li>• Show, don't just tell - demonstrate your qualities with stories</li>
                  <li>• Tailor each statement to the specific university and program</li>
                </ul>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}