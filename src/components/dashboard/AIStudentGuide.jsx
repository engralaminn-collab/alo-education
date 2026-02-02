import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Loader2, AlertTriangle, BookOpen, 
  MessageSquare, Send, Bot, TrendingUp, FileText, Zap, Building2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIStudentGuide({ student }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-guide'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-guide'],
    queryFn: () => base44.entities.Course.list(),
  });

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setAsking(true);
    
    try {
      const prompt = `You are an expert study abroad counselor for ALO Education. Answer this student's question professionally and helpfully.

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}

Student's Question: ${question}

Provide a helpful, accurate, and personalized answer. If the question is about specific universities or courses, mention relevant options from our database. Keep it concise but informative.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setAnswer(response);
    } catch (error) {
      toast.error('Failed to get answer');
    }
    
    setAsking(false);
  };

  const generateRecommendations = async () => {
    setLoadingRecs(true);
    
    try {
      const prompt = `Analyze this student's profile and current stage to provide personalized guidance:

Student Profile:
- Name: ${student.first_name} ${student.last_name}
- Status: ${student.status}
- Profile Completeness: ${student.profile_completeness || 0}%
- Preferred Countries: ${student.preferred_countries?.join(', ') || 'Not specified'}
- Degree Level: ${student.preferred_degree_level || 'Not specified'}
- Fields: ${student.preferred_fields?.join(', ') || 'Not specified'}
- Budget: ${student.budget_max || 'Not specified'}
- English Test: ${student.english_proficiency?.test_type || 'Not taken'}

Provide:
1. "recommended_resources": 5-7 specific resources (title, type: article/video/webinar, description, url_hint)
2. "bottlenecks": Identify 3-5 potential issues or missing requirements that might delay their application
3. "next_actions": 3-5 immediate actionable steps they should take
4. "university_suggestions": Suggest 3-5 universities that match their profile (name and reason)
5. "timeline_reminder": What stage they should be at and what's coming next`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  url_hint: { type: "string" }
                }
              }
            },
            bottlenecks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string" },
                  solution: { type: "string" }
                }
              }
            },
            next_actions: {
              type: "array",
              items: { type: "string" }
            },
            university_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            timeline_reminder: { type: "string" }
          }
        }
      });

      setRecommendations(response);
    } catch (error) {
      toast.error('Failed to generate recommendations');
    }
    
    setLoadingRecs(false);
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-600';
      case 'critical': return 'bg-red-700';
      case 'medium': return 'bg-amber-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Bot className="w-6 h-6 text-blue-600" />
          AI Study Abroad Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommendations">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="recommendations" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-2" />
              Guidance
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {!recommendations ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-sm text-blue-700 mb-4">
                  Get personalized recommendations and identify potential issues
                </p>
                <Button 
                  onClick={generateRecommendations}
                  disabled={loadingRecs}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  {loadingRecs ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Guidance
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Timeline Reminder */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">📅 Your Journey</h4>
                  <p className="text-sm text-purple-800">{recommendations.timeline_reminder}</p>
                </div>

                {/* Bottlenecks */}
                {recommendations.bottlenecks?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Areas Needing Attention
                    </h4>
                    <div className="space-y-2">
                      {recommendations.bottlenecks.map((bottleneck, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-l-red-500">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm text-slate-900">{bottleneck.issue}</p>
                            <Badge className={getSeverityColor(bottleneck.severity)}>
                              {bottleneck.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">{bottleneck.solution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Actions */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    What You Should Do Now
                  </h4>
                  <div className="space-y-2">
                    {recommendations.next_actions?.map((action, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-slate-700 flex-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Resources */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    Helpful Resources
                  </h4>
                  <div className="space-y-2">
                    {recommendations.recommended_resources?.map((resource, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-purple-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm text-slate-900">{resource.title}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {resource.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mb-1">{resource.description}</p>
                            {resource.url_hint && (
                              <p className="text-xs text-blue-600">{resource.url_hint}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* University Suggestions */}
                {recommendations.university_suggestions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Recommended Universities
                    </h4>
                    <div className="space-y-2">
                      {recommendations.university_suggestions.map((uni, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border">
                          <p className="font-medium text-sm text-slate-900">{uni.name}</p>
                          <p className="text-xs text-slate-600">{uni.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => {
                    setRecommendations(null);
                    generateRecommendations();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Refresh Recommendations
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Ask me anything about studying abroad
              </label>
              <div className="flex gap-2">
                <Input 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What are the requirements for UK universities?"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !asking) {
                      askQuestion();
                    }
                  }}
                />
                <Button 
                  onClick={askQuestion}
                  disabled={asking || !question.trim()}
                  className="bg-blue-600"
                >
                  {asking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-slate-500 w-full mb-1">Quick questions:</p>
              {[
                'How do I apply to UK universities?',
                'What IELTS score do I need?',
                'How much does it cost to study in Canada?',
                'What scholarships are available?'
              ].map((q, idx) => (
                <Button 
                  key={idx}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuestion(q);
                    setTimeout(() => askQuestion(), 100);
                  }}
                  className="text-xs"
                >
                  {q}
                </Button>
              ))}
            </div>

            {answer && (
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-blue-900 mb-1">AI Assistant</p>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                      {answer}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAnswer(null);
                    setQuestion('');
                  }}
                  className="w-full mt-2"
                >
                  Ask Another Question
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}