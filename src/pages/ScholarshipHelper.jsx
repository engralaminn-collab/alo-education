import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Sparkles, FileText, CheckCircle, Award, Clock, 
  ArrowRight, Loader2, Copy, RefreshCw, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import Footer from '@/components/landing/Footer';

const essayPrompts = [
  { id: 'personal_statement', label: 'Personal Statement', description: 'Tell us about yourself and your goals' },
  { id: 'why_scholarship', label: 'Why You Deserve This Scholarship', description: 'Explain why you should be selected' },
  { id: 'academic_goals', label: 'Academic & Career Goals', description: 'Describe your future plans' },
  { id: 'community_impact', label: 'Community Impact', description: 'How you\'ve contributed to your community' },
  { id: 'overcome_challenges', label: 'Overcoming Challenges', description: 'Challenges you\'ve faced and overcome' },
];

const applicationChecklist = [
  { id: 1, task: 'Research scholarship requirements', category: 'preparation' },
  { id: 2, task: 'Gather academic transcripts', category: 'documents' },
  { id: 3, task: 'Request recommendation letters', category: 'documents' },
  { id: 4, task: 'Prepare financial documents', category: 'documents' },
  { id: 5, task: 'Write scholarship essay/personal statement', category: 'essay' },
  { id: 6, task: 'Get essay reviewed and edited', category: 'essay' },
  { id: 7, task: 'Complete application form', category: 'application' },
  { id: 8, task: 'Review application for errors', category: 'application' },
  { id: 9, task: 'Submit before deadline', category: 'submission' },
  { id: 10, task: 'Follow up if required', category: 'submission' },
];

export default function ScholarshipHelper() {
  const [selectedPrompt, setSelectedPrompt] = useState('personal_statement');
  const [essayInput, setEssayInput] = useState('');
  const [scholarshipDetails, setScholarshipDetails] = useState('');
  const [generatedEssay, setGeneratedEssay] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [matchedScholarships, setMatchedScholarships] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships-active'],
    queryFn: () => base44.entities.Scholarship.filter({ status: 'active' }),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-list'],
    queryFn: () => base44.entities.University.list(),
  });

  const generateEssay = async () => {
    if (!essayInput.trim()) {
      toast.error('Please provide some information about yourself');
      return;
    }

    setIsGenerating(true);

    try {
      const promptData = essayPrompts.find(p => p.id === selectedPrompt);
      
      const prompt = `You are an expert scholarship essay writer. Help this student write a compelling ${promptData.label.toLowerCase()}.

Student Information:
${essayInput}

${scholarshipDetails ? `Scholarship Requirements:\n${scholarshipDetails}\n` : ''}

Student Profile:
- Name: ${studentProfile?.first_name} ${studentProfile?.last_name}
- Education: ${studentProfile?.education_history?.[0]?.academic_level} in ${studentProfile?.education_history?.[0]?.group_subject}
- GPA/Result: ${studentProfile?.education_history?.[0]?.result_value}
- Study Destination: ${studentProfile?.admission_preferences?.study_destination}
- Study Area: ${studentProfile?.admission_preferences?.study_area}
- Work Experience: ${studentProfile?.work_experience?.length || 0} positions

Write a compelling, well-structured ${promptData.label.toLowerCase()} (400-600 words) that:
1. Has a strong opening that captures attention
2. Tells a coherent story about the student's journey and aspirations
3. Demonstrates genuine passion and commitment
4. Provides specific examples and achievements
5. Explains how the scholarship will help achieve goals
6. Ends with a memorable conclusion

Make it authentic, personal, and persuasive. Use a professional yet warm tone.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedEssay(result);
      toast.success('Essay generated successfully!');
    } catch (error) {
      toast.error('Failed to generate essay');
    } finally {
      setIsGenerating(false);
    }
  };

  const matchScholarships = async () => {
    if (!studentProfile) {
      toast.error('Please complete your profile first');
      return;
    }

    setIsMatching(true);

    try {
      const prompt = `Analyze this student profile and match them with the most suitable scholarships from the list.

Student Profile:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Nationality: ${studentProfile.nationality}
- Education: ${studentProfile.education_history?.map(e => `${e.academic_level} in ${e.group_subject} (${e.result_value})`).join(', ')}
- English Proficiency: ${studentProfile.english_proficiency?.test_type} ${studentProfile.english_proficiency?.overall_score || ''}
- Study Destination: ${studentProfile.admission_preferences?.study_destination}
- Study Level: ${studentProfile.admission_preferences?.study_level}
- Study Area: ${studentProfile.admission_preferences?.study_area}
- Work Experience: ${studentProfile.work_experience?.length || 0} positions
- Funding Status: ${studentProfile.funding_information?.funding_status}

Available Scholarships:
${scholarships.slice(0, 20).map((s, i) => {
  const uni = universities.find(u => u.id === s.university_id);
  return `${i + 1}. ${s.scholarship_name}
   Type: ${s.scholarship_type}
   Amount: ${s.amount} ${s.currency} (${s.amount_type})
   University: ${uni?.university_name || 'Various'}
   Country: ${s.country}
   Study Levels: ${s.study_level?.join(', ')}
   Subject Areas: ${s.subject_areas?.join(', ') || 'Any'}
   Eligibility: ${s.eligibility_criteria || 'Check requirements'}
   Min GPA: ${s.min_gpa || 'Not specified'}
   ID: ${s.id}`;
}).join('\n\n')}

Based on the student's profile, identify the top 5 most suitable scholarships. Consider:
1. Eligibility match (nationality, GPA, study level, subject area)
2. Scholarship amount and type
3. Geographic preferences
4. Academic qualifications
5. Career goals alignment

Provide match score (0-100) and reasoning for each.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scholarship_id: { type: "string" },
                  match_score: { type: "number" },
                  reasoning: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  requirements: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      const enriched = result.matches.map(m => ({
        ...m,
        scholarship: scholarships.find(s => s.id === m.scholarship_id),
        university: universities.find(u => u.id === scholarships.find(s => s.id === m.scholarship_id)?.university_id)
      })).filter(m => m.scholarship);

      setMatchedScholarships(enriched);
      toast.success(`Found ${enriched.length} matching scholarships!`);
    } catch (error) {
      toast.error('Failed to match scholarships');
    } finally {
      setIsMatching(false);
    }
  };

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const copyEssay = () => {
    navigator.clipboard.writeText(generatedEssay);
    toast.success('Essay copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-16" style={{ background: 'linear-gradient(135deg, var(--alo-blue) 0%, #004999 100%)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--alo-orange)' }}>
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AI Scholarship Assistant
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Get help writing essays, finding scholarships, and completing applications
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="essay" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="essay">Essay Writer</TabsTrigger>
            <TabsTrigger value="matching">Find Scholarships</TabsTrigger>
            <TabsTrigger value="checklist">Application Guide</TabsTrigger>
          </TabsList>

          {/* Essay Writer Tab */}
          <TabsContent value="essay">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: 'var(--alo-orange)' }} />
                    Generate Your Essay
                  </CardTitle>
                  <CardDescription>
                    Provide details and let AI help you craft a compelling scholarship essay
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Essay Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {essayPrompts.map(prompt => (
                        <button
                          key={prompt.id}
                          onClick={() => setSelectedPrompt(prompt.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            selectedPrompt === prompt.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-semibold text-sm">{prompt.label}</div>
                          <div className="text-xs text-slate-500">{prompt.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Tell us about yourself *
                    </label>
                    <Textarea
                      placeholder="Your achievements, experiences, goals, challenges you've overcome, etc..."
                      value={essayInput}
                      onChange={(e) => setEssayInput(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Scholarship Requirements (Optional)
                    </label>
                    <Textarea
                      placeholder="Paste the scholarship requirements or essay prompt..."
                      value={scholarshipDetails}
                      onChange={(e) => setScholarshipDetails(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={generateEssay}
                    disabled={isGenerating || !essayInput.trim()}
                    className="w-full text-white"
                    style={{ backgroundColor: 'var(--alo-orange)' }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Essay
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Essay</CardTitle>
                    {generatedEssay && (
                      <Button variant="ghost" size="sm" onClick={copyEssay}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedEssay ? (
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <div className="bg-slate-50 rounded-lg p-4 whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {generatedEssay}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateEssay}
                          disabled={isGenerating}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex gap-2 items-start">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-sm text-amber-900">
                            <p className="font-semibold mb-1">Important Note</p>
                            <p>This is a draft to help you get started. Always review, personalize, and edit the essay to reflect your authentic voice and experiences.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Your essay will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scholarship Matching Tab */}
          <TabsContent value="matching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  AI-Powered Scholarship Matching
                </CardTitle>
                <CardDescription>
                  We'll analyze your profile and find scholarships that match your qualifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!studentProfile ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">Complete your profile to get personalized scholarship matches</p>
                    <Link to={createPageUrl('MyProfile')}>
                      <Button className="text-white" style={{ backgroundColor: 'var(--alo-blue)' }}>
                        Complete Profile
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Your Profile Summary</h4>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-700">
                        <div>• Education: {studentProfile.education_history?.[0]?.academic_level}</div>
                        <div>• Nationality: {studentProfile.nationality}</div>
                        <div>• Study Destination: {studentProfile.admission_preferences?.study_destination || 'Any'}</div>
                        <div>• Study Area: {studentProfile.admission_preferences?.study_area || 'Any'}</div>
                      </div>
                    </div>

                    <Button
                      onClick={matchScholarships}
                      disabled={isMatching}
                      className="w-full text-white"
                      style={{ backgroundColor: 'var(--alo-orange)' }}
                    >
                      {isMatching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Finding Matches...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Find My Scholarships
                        </>
                      )}
                    </Button>

                    {matchedScholarships.length > 0 && (
                      <div className="space-y-4 mt-6">
                        <h4 className="font-semibold text-slate-900">Your Matched Scholarships</h4>
                        {matchedScholarships.map((match, idx) => (
                          <Card key={idx} className="border-2" style={{ borderColor: idx === 0 ? 'var(--alo-orange)' : 'transparent' }}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${
                                  match.match_score >= 85 ? 'bg-emerald-100 text-emerald-600' :
                                  match.match_score >= 70 ? 'bg-blue-100 text-blue-600' :
                                  'bg-amber-100 text-amber-600'
                                }`}>
                                  {match.match_score}%
                                </div>
                                <div className="flex-1">
                                  {idx === 0 && (
                                    <Badge className="mb-2" style={{ backgroundColor: 'var(--alo-orange)' }}>
                                      Best Match
                                    </Badge>
                                  )}
                                  <h4 className="font-bold text-slate-900 mb-1">{match.scholarship?.scholarship_name}</h4>
                                  <p className="text-sm text-slate-600 mb-2">
                                    {match.university?.university_name} • {match.scholarship?.country}
                                  </p>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{match.scholarship?.scholarship_type}</Badge>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--alo-blue)' }}>
                                      {match.scholarship?.amount?.toLocaleString()} {match.scholarship?.currency}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-3">{match.reasoning}</p>
                                  {match.strengths?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {match.strengths.map((s, i) => (
                                        <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                          ✓ {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {match.requirements?.length > 0 && (
                                    <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-900">
                                      <strong>Requirements:</strong> {match.requirements.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Application Checklist Tab */}
          <TabsContent value="checklist">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Application Checklist
                    </CardTitle>
                    <CardDescription>
                      Track your progress through the scholarship application process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {['preparation', 'documents', 'essay', 'application', 'submission'].map(category => {
                        const tasks = applicationChecklist.filter(t => t.category === category);
                        const completed = tasks.filter(t => completedTasks.includes(t.id)).length;
                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-slate-900 capitalize">{category}</h4>
                              <span className="text-sm text-slate-500">{completed}/{tasks.length}</span>
                            </div>
                            <div className="space-y-2">
                              {tasks.map(task => (
                                <div
                                  key={task.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    completedTasks.includes(task.id)
                                      ? 'bg-emerald-50 border-emerald-200'
                                      : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                                  onClick={() => toggleTask(task.id)}
                                >
                                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                                    completedTasks.includes(task.id)
                                      ? 'bg-emerald-500 border-emerald-500'
                                      : 'border-slate-300'
                                  }`}>
                                    {completedTasks.includes(task.id) && (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <span className={completedTasks.includes(task.id) ? 'line-through text-slate-500' : 'text-slate-900'}>
                                    {task.task}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="tip1">
                        <AccordionTrigger className="text-sm">Start Early</AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600">
                          Begin your scholarship search and application process at least 6 months before deadlines. This gives you time to gather documents and write strong essays.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="tip2">
                        <AccordionTrigger className="text-sm">Tailor Your Application</AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600">
                          Customize each essay to match the specific scholarship's values and requirements. Generic applications are less likely to succeed.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="tip3">
                        <AccordionTrigger className="text-sm">Get Strong Recommendations</AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600">
                          Choose recommenders who know you well and can speak to your achievements. Give them plenty of notice and provide them with your resume and scholarship details.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="tip4">
                        <AccordionTrigger className="text-sm">Proofread Everything</AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600">
                          Review your application multiple times. Have others read your essays. Small errors can make a big difference in competitive scholarship selection.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2" style={{ color: 'var(--alo-blue)' }}>
                        {Math.round((completedTasks.length / applicationChecklist.length) * 100)}%
                      </div>
                      <p className="text-sm text-slate-600">
                        {completedTasks.length} of {applicationChecklist.length} tasks completed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}