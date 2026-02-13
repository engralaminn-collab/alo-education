import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, PlayCircle, Award, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CounselorOnboardingPortal() {
  const [modules, setModules] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const generateModules = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('counselorOnboarding', {
        action: 'generate_training_modules'
      });
      return data;
    },
    onSuccess: (data) => {
      setModules(data);
      toast.success('Training modules generated');
    }
  });

  const generateScenario = useMutation({
    mutationFn: async (type) => {
      const { data } = await base44.functions.invoke('counselorOnboarding', {
        action: 'generate_scenario',
        scenario_type: type
      });
      return data;
    },
    onSuccess: (data) => {
      setScenario(data);
      toast.success('Training scenario generated');
    }
  });

  const evaluateProgress = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const { data } = await base44.functions.invoke('counselorOnboarding', {
        action: 'evaluate_progress',
        counselor_id: user.id
      });
      return data;
    },
    onSuccess: (data) => {
      setEvaluation(data);
      toast.success('Progress evaluated');
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            Counselor Onboarding Academy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered training program for new counselors
          </p>
        </div>

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="modules">Training Modules</TabsTrigger>
            <TabsTrigger value="scenarios">Role-Playing</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          {/* Training Modules */}
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-indigo-600" />
                  Interactive Training Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Complete these modules to master CRM features and counseling best practices.
                </p>

                <Button
                  onClick={() => generateModules.mutate()}
                  disabled={generateModules.isPending}
                  className="bg-indigo-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generateModules.isPending ? 'Generating...' : 'Generate Personalized Training Path'}
                </Button>

                {modules?.training_modules && (
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    {modules.training_modules.map((module, i) => (
                      <div key={i} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold">{module.title}</h5>
                            <Badge variant="outline" className="mt-1">{module.difficulty}</Badge>
                          </div>
                          <Badge className="bg-indigo-600">{module.duration_minutes}min</Badge>
                        </div>

                        <p className="text-sm text-slate-600 mb-3">{module.description}</p>

                        {module.learning_objectives?.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded mb-3">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Learning Objectives:</p>
                            <ul className="space-y-1">
                              {module.learning_objectives.slice(0, 3).map((obj, j) => (
                                <li key={j} className="text-xs text-blue-800">• {obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {module.interactive_elements?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {module.interactive_elements.map((element, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{element}</Badge>
                            ))}
                          </div>
                        )}

                        <Button size="sm" className="w-full">Start Module</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role-Playing Scenarios */}
          <TabsContent value="scenarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  AI-Generated Role-Playing Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Practice realistic student interactions with AI-powered scenarios and get personalized feedback.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button size="sm" onClick={() => generateScenario.mutate('difficult_conversation')} disabled={generateScenario.isPending}>
                    Difficult Student
                  </Button>
                  <Button size="sm" onClick={() => generateScenario.mutate('application_crisis')} disabled={generateScenario.isPending}>
                    Crisis Situation
                  </Button>
                  <Button size="sm" onClick={() => generateScenario.mutate('scholarship_guidance')} disabled={generateScenario.isPending}>
                    Financial Aid
                  </Button>
                  <Button size="sm" onClick={() => generateScenario.mutate('visa_concerns')} disabled={generateScenario.isPending}>
                    Visa Issues
                  </Button>
                </div>

                {scenario && (
                  <div className="bg-white border rounded-lg p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">{scenario.scenario_title}</h4>
                      <Badge className="bg-purple-600">{scenario.difficulty_level}</Badge>
                    </div>

                    {scenario.student_profile && (
                      <div className="bg-slate-50 p-4 rounded-lg mb-4">
                        <h5 className="font-semibold mb-2">Student Profile</h5>
                        <p className="text-sm text-slate-700 mb-2">
                          <strong>Name:</strong> {scenario.student_profile.name}
                        </p>
                        <p className="text-sm text-slate-700 mb-2">
                          <strong>Background:</strong> {scenario.student_profile.background}
                        </p>
                        {scenario.student_profile.concerns?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-600 mb-1">Key Concerns:</p>
                            <ul className="space-y-1">
                              {scenario.student_profile.concerns.map((concern, i) => (
                                <li key={i} className="text-xs text-slate-700">• {concern}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Situation:</p>
                        <p className="text-sm text-blue-800">{scenario.situation_description}</p>
                      </div>

                      {scenario.recommended_approaches?.length > 0 && (
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm font-semibold text-green-900 mb-2">Recommended Approaches:</p>
                          <ul className="space-y-1">
                            {scenario.recommended_approaches.map((approach, i) => (
                              <li key={i} className="text-sm text-green-800">✓ {approach}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {scenario.common_mistakes?.length > 0 && (
                        <div className="bg-red-50 p-3 rounded">
                          <p className="text-sm font-semibold text-red-900 mb-2">Avoid These Mistakes:</p>
                          <ul className="space-y-1">
                            {scenario.common_mistakes.map((mistake, i) => (
                              <li key={i} className="text-sm text-red-800">✗ {mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {scenario.success_criteria?.length > 0 && (
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-sm font-semibold text-purple-900 mb-2">Success Criteria:</p>
                          <ul className="space-y-1">
                            {scenario.success_criteria.map((criteria, i) => (
                              <li key={i} className="text-sm text-purple-800 flex items-start gap-1">
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1">Start Role-Play</Button>
                      <Button variant="outline" onClick={() => generateScenario.mutate(scenario.scenario_type)}>
                        New Scenario
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tracking */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  My Progress & Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Track your onboarding progress and get personalized feedback from our AI coach.
                </p>

                <Button
                  onClick={() => evaluateProgress.mutate()}
                  disabled={evaluateProgress.isPending}
                  className="bg-green-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {evaluateProgress.isPending ? 'Evaluating...' : 'Get AI Performance Evaluation'}
                </Button>

                {evaluation?.evaluation && (
                  <div className="space-y-4 mt-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-900">Overall Progress</h4>
                        <Badge className="bg-green-600 text-lg px-3 py-1">
                          {evaluation.evaluation.overall_progress}%
                        </Badge>
                      </div>
                      <p className="text-sm text-green-800">
                        Readiness Level: <strong className="capitalize">{evaluation.evaluation.readiness_level}</strong>
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {evaluation.evaluation.strengths?.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2">Your Strengths</h5>
                          <ul className="space-y-1">
                            {evaluation.evaluation.strengths.map((strength, i) => (
                              <li key={i} className="text-sm text-blue-800">✓ {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evaluation.evaluation.improvement_areas?.length > 0 && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-orange-900 mb-2">Areas to Develop</h5>
                          <ul className="space-y-1">
                            {evaluation.evaluation.improvement_areas.map((area, i) => (
                              <li key={i} className="text-sm text-orange-800">→ {area}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {evaluation.evaluation.personalized_recommendations?.length > 0 && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-purple-900 mb-2">Personalized Recommendations</h5>
                        <ul className="space-y-2">
                          {evaluation.evaluation.personalized_recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-purple-800">💡 {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.evaluation.coaching_feedback && (
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <h5 className="font-semibold text-indigo-900 mb-2">Coach's Feedback</h5>
                        <p className="text-sm text-indigo-800">{evaluation.evaluation.coaching_feedback}</p>
                      </div>
                    )}

                    {evaluation.evaluation.next_goals?.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-slate-900 mb-2">Next Goals</h5>
                        <ul className="space-y-1">
                          {evaluation.evaluation.next_goals.map((goal, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-green-600">□</span>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}