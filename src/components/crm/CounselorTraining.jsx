import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Loader2, GraduationCap, MessageSquare, 
  Award, TrendingUp, Target, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

const trainingScenarios = [
  {
    id: 1,
    title: "Low Profile Completeness Student",
    difficulty: "Easy",
    description: "Student joined 2 weeks ago but only completed 30% of their profile",
    studentProfile: {
      name: "Ayesha Rahman",
      profile_completeness: 30,
      status: "new_lead",
      preferred_countries: ["UK"],
      missing_info: ["English test scores", "Academic transcripts", "Budget information"]
    },
    expectedActions: ["Send encouragement", "Explain importance of complete profile", "Offer assistance"]
  },
  {
    id: 2,
    title: "Urgent Deadline Student",
    difficulty: "Medium",
    description: "Student has a conditional offer expiring in 3 days but hasn't submitted required documents",
    studentProfile: {
      name: "Rakib Hasan",
      status: "conditional_offer",
      deadline: "3 days",
      missing_documents: ["Financial proof", "Updated transcript"]
    },
    expectedActions: ["Create urgency", "Provide clear checklist", "Offer immediate support"]
  },
  {
    id: 3,
    title: "Confused About Course Selection",
    difficulty: "Medium",
    description: "Student interested in both Engineering and Business, unsure which to pursue",
    studentProfile: {
      name: "Nusrat Ahmed",
      interests: ["Engineering", "Business Administration"],
      academic_background: "Science (Physics, Math)",
      career_goal: "Unclear"
    },
    expectedActions: ["Ask clarifying questions", "Discuss career outcomes", "Suggest course matcher tool"]
  },
  {
    id: 4,
    title: "Visa Rejection Case",
    difficulty: "Hard",
    description: "Student's visa was rejected, they're demotivated and considering giving up",
    studentProfile: {
      name: "Farhan Khan",
      status: "visa_rejected",
      rejection_reason: "Insufficient financial proof",
      emotional_state: "Demotivated"
    },
    expectedActions: ["Show empathy", "Explain rejection reason", "Provide actionable next steps", "Boost morale"]
  },
  {
    id: 5,
    title: "Budget Constraints",
    difficulty: "Medium",
    description: "Student wants to study in USA but budget is only $15,000/year",
    studentProfile: {
      name: "Sadia Islam",
      preferred_country: "USA",
      budget: "$15,000/year",
      gpa: 3.8
    },
    expectedActions: ["Discuss scholarships", "Suggest affordable alternatives", "Explain part-time work options"]
  }
];

const knowledgeQuestions = [
  {
    question: "What is the typical IELTS requirement for UK postgraduate programs?",
    options: ["5.5 overall", "6.5 overall", "7.5 overall", "8.0 overall"],
    correct: 1,
    explanation: "Most UK postgraduate programs require IELTS 6.5 overall, with some variation by program."
  },
  {
    question: "How should you handle a student with unrealistic expectations?",
    options: [
      "Immediately reject their choices",
      "Gently guide them with data and alternatives",
      "Let them apply anyway",
      "Refer them to another counselor"
    ],
    correct: 1,
    explanation: "Always guide students with empathy, using data to set realistic expectations while offering viable alternatives."
  },
  {
    question: "What's the first priority when a student receives a conditional offer?",
    options: [
      "Celebrate and wait",
      "Review conditions and create action plan",
      "Apply to more universities",
      "Book visa appointment"
    ],
    correct: 1,
    explanation: "Immediately review the offer conditions and create a clear action plan with deadlines to meet requirements."
  },
  {
    question: "When should you recommend a student defer their application?",
    options: [
      "Never, always push forward",
      "When they're missing critical requirements or financially unprepared",
      "Only if they ask",
      "Always defer for better preparation"
    ],
    correct: 1,
    explanation: "Recommend deferral when missing critical requirements or financial unpreparedness would lead to rejection or stress."
  }
];

export default function CounselorTraining() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  const evaluateResponse = useMutation({
    mutationFn: async ({ scenario, counselorResponse }) => {
      setEvaluating(true);

      const prompt = `You are evaluating a counselor trainee's response to a student scenario.

Scenario: ${scenario.title}
Description: ${scenario.description}
Student Profile: ${JSON.stringify(scenario.studentProfile, null, 2)}
Expected Actions: ${scenario.expectedActions.join(', ')}

Counselor's Response: ${counselorResponse}

Evaluate on a scale of 1-100 and provide:
1. "score": Overall score (1-100)
2. "strengths": Array of 2-3 things they did well
3. "improvements": Array of 2-3 areas for improvement
4. "tone_assessment": Was the tone appropriate? (professional/empathetic/too_formal/too_casual)
5. "completeness": Did they address all key points? (complete/partial/missing_key_points)
6. "suggested_response": A better version of the response incorporating best practices`;

      const evaluation = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            improvements: {
              type: "array",
              items: { type: "string" }
            },
            tone_assessment: { type: "string" },
            completeness: { type: "string" },
            suggested_response: { type: "string" }
          }
        }
      });

      return evaluation;
    },
    onSuccess: (data) => {
      setFeedback(data);
      setEvaluating(false);
      toast.success('Evaluation complete!');
    },
    onError: () => {
      setEvaluating(false);
      toast.error('Evaluation failed');
    }
  });

  const handleSubmitResponse = () => {
    if (!response.trim()) {
      toast.error('Please write a response');
      return;
    }
    evaluateResponse.mutate({ scenario: activeScenario, counselorResponse: response });
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    knowledgeQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correct++;
    });
    setQuizCompleted(true);
    toast.success(`Quiz complete! You got ${correct}/${knowledgeQuestions.length} correct.`);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            AI Counselor Training Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scenarios">
            <TabsList className="w-full">
              <TabsTrigger value="scenarios" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Interactive Scenarios
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex-1">
                <Target className="w-4 h-4 mr-2" />
                Knowledge Assessment
              </TabsTrigger>
              <TabsTrigger value="best-practices" className="flex-1">
                <Award className="w-4 h-4 mr-2" />
                Best Practices
              </TabsTrigger>
            </TabsList>

            {/* Scenarios Tab */}
            <TabsContent value="scenarios" className="space-y-4 mt-4">
              {!activeScenario ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {trainingScenarios.map((scenario) => (
                    <Card 
                      key={scenario.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                      onClick={() => {
                        setActiveScenario(scenario);
                        setResponse('');
                        setFeedback(null);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-slate-900">{scenario.title}</h4>
                          <Badge className={
                            scenario.difficulty === 'Easy' ? 'bg-green-600' :
                            scenario.difficulty === 'Medium' ? 'bg-blue-600' :
                            'bg-red-600'
                          }>
                            {scenario.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{scenario.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Scenario Details */}
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-blue-900 mb-1">{activeScenario.title}</h3>
                          <p className="text-sm text-blue-700">{activeScenario.description}</p>
                        </div>
                        <Badge className={
                          activeScenario.difficulty === 'Easy' ? 'bg-green-600' :
                          activeScenario.difficulty === 'Medium' ? 'bg-blue-600' :
                          'bg-red-600'
                        }>
                          {activeScenario.difficulty}
                        </Badge>
                      </div>
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Student Profile:</p>
                        <div className="space-y-1 text-sm text-slate-700">
                          {Object.entries(activeScenario.studentProfile).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {
                                Array.isArray(value) ? value.join(', ') : value
                              }
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Response Input */}
                  {!feedback && (
                    <Card>
                      <CardContent className="p-4">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          How would you handle this situation? Write your response to the student:
                        </label>
                        <Textarea 
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={8}
                          placeholder="Type your counselor response here..."
                          className="mb-4"
                        />
                        <div className="flex gap-3">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setActiveScenario(null);
                              setResponse('');
                            }}
                            className="flex-1"
                          >
                            Back to Scenarios
                          </Button>
                          <Button 
                            onClick={handleSubmitResponse}
                            disabled={evaluating || !response.trim()}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                          >
                            {evaluating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                AI Evaluating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Get AI Feedback
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Feedback */}
                  {feedback && (
                    <div className="space-y-4">
                      {/* Score */}
                      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-purple-900">Your Performance</h3>
                              <p className="text-sm text-purple-700">AI Evaluation Score</p>
                            </div>
                            <div className="text-center">
                              <p className={`text-5xl font-bold ${getScoreColor(feedback.score)}`}>
                                {feedback.score}
                              </p>
                              <p className="text-sm text-slate-600">out of 100</p>
                            </div>
                          </div>
                          <Progress value={feedback.score} className="h-3" />
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-600 mb-1">Tone</p>
                              <Badge className="bg-blue-600">{feedback.tone_assessment}</Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 mb-1">Completeness</p>
                              <Badge className={
                                feedback.completeness === 'complete' ? 'bg-green-600' :
                                feedback.completeness === 'partial' ? 'bg-amber-600' :
                                'bg-red-600'
                              }>
                                {feedback.completeness}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Strengths */}
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            What You Did Well
                          </h4>
                          <div className="space-y-2">
                            {feedback.strengths?.map((strength, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <p className="text-slate-700">{strength}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Improvements */}
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                            Areas for Improvement
                          </h4>
                          <div className="space-y-2">
                            {feedback.improvements?.map((improvement, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-amber-600 mt-0.5">→</span>
                                <p className="text-slate-700">{improvement}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Suggested Response */}
                      <Card className="border-2 border-emerald-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            AI-Suggested Response
                          </h4>
                          <div className="bg-emerald-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">
                            {feedback.suggested_response}
                          </div>
                        </CardContent>
                      </Card>

                      <Button 
                        onClick={() => {
                          setActiveScenario(null);
                          setResponse('');
                          setFeedback(null);
                        }}
                        className="w-full"
                      >
                        Try Another Scenario
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Knowledge Quiz Tab */}
            <TabsContent value="quiz" className="space-y-4 mt-4">
              {!quizCompleted ? (
                <div className="space-y-4">
                  {knowledgeQuestions.map((q, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <p className="font-semibold text-slate-900 mb-3">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => (
                            <label 
                              key={optIdx}
                              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                              <input 
                                type="radio"
                                name={`question-${idx}`}
                                checked={quizAnswers[idx] === optIdx}
                                onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button 
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < knowledgeQuestions.length}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    Submit Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-6 text-center">
                      <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-900 mb-2">Quiz Complete!</h3>
                      <p className="text-green-700">
                        Score: {Object.keys(quizAnswers).filter((key) => quizAnswers[key] === knowledgeQuestions[key].correct).length} / {knowledgeQuestions.length}
                      </p>
                    </CardContent>
                  </Card>

                  {knowledgeQuestions.map((q, idx) => {
                    const isCorrect = quizAnswers[idx] === q.correct;
                    return (
                      <Card key={idx} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 mb-2">{q.question}</p>
                              <p className="text-sm text-slate-600 mb-2">
                                <strong>Correct Answer:</strong> {q.options[q.correct]}
                              </p>
                              <p className="text-sm text-slate-600 italic">{q.explanation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <Button 
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizCompleted(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Retake Quiz
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Best Practices Tab */}
            <TabsContent value="best-practices" className="space-y-4 mt-4">
              <Card className="border-2 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900">Student Engagement Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Active Listening",
                      points: [
                        "Let students fully explain their concerns before responding",
                        "Paraphrase to confirm understanding",
                        "Ask open-ended questions to gather more context"
                      ]
                    },
                    {
                      title: "Clear Communication",
                      points: [
                        "Use simple language, avoid jargon",
                        "Break down complex processes into steps",
                        "Provide written summaries after discussions"
                      ]
                    },
                    {
                      title: "Proactive Support",
                      points: [
                        "Anticipate student needs based on their stage",
                        "Send timely reminders about deadlines",
                        "Check in regularly, especially during critical periods"
                      ]
                    },
                    {
                      title: "Empathy & Encouragement",
                      points: [
                        "Acknowledge student stress and concerns",
                        "Celebrate small wins and milestones",
                        "Provide realistic encouragement based on data"
                      ]
                    }
                  ].map((practice, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border">
                      <h4 className="font-semibold text-slate-900 mb-2">{practice.title}</h4>
                      <ul className="space-y-2">
                        {practice.points.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-emerald-600 mt-0.5">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}