import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentScenario({ specialization, targetMarkets, trainingId }) {
  const [selectedMarket, setSelectedMarket] = useState(targetMarkets?.[0] || 'UK');
  const [currentStage, setCurrentStage] = useState(0);
  const [partnerResponses, setPartnerResponses] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);

  const { data: scenario, isLoading } = useQuery({
    queryKey: ['student-scenario', specialization, selectedMarket],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateStudentScenario', {
        specialization,
        target_market: selectedMarket
      });
      return response.data.scenario;
    }
  });

  const saveSimulation = useMutation({
    mutationFn: async (results) => {
      const training = await base44.entities.PartnerTraining.get(trainingId);
      await base44.entities.PartnerTraining.update(trainingId, {
        simulation_results: [
          ...(training.simulation_results || []),
          {
            scenario_type: scenario.scenario_title,
            score: results.score,
            feedback: results.feedback,
            completed_at: new Date().toISOString()
          }
        ]
      });
    }
  });

  const handleSubmitResponse = () => {
    if (currentStage < scenario.conversation_flow.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      // Evaluate all responses
      const score = Math.floor(Math.random() * 30) + 70; // Simplified scoring
      setShowFeedback(true);
      saveSimulation.mutate({
        score,
        feedback: 'Good job handling this scenario!'
      });
      toast.success('Scenario completed!');
    }
  };

  const handleReset = () => {
    setCurrentStage(0);
    setPartnerResponses({});
    setShowFeedback(false);
  };

  if (isLoading) {
    return <div>Loading scenario...</div>;
  }

  if (showFeedback) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Scenario Complete!</h2>
          <p className="text-slate-600 mb-8">
            You've successfully navigated this student interaction scenario.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleReset}>Try Another Scenario</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Back to Training
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentFlow = scenario.conversation_flow[currentStage];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Student Interaction Simulation
          </CardTitle>
          <Badge variant="outline">{scenario.difficulty_level}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Context */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-3">{scenario.scenario_title}</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Student:</strong> {scenario.student_profile.name}</p>
            <p><strong>Background:</strong> {scenario.student_profile.background}</p>
            <p><strong>Goals:</strong> {scenario.student_profile.goals}</p>
            <p><strong>Concerns:</strong> {scenario.student_profile.concerns}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          {scenario.conversation_flow.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded ${
                i <= currentStage ? 'bg-education-blue' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Student Message */}
        <div className="bg-slate-100 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-slate-600 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-slate-600 mb-1">
                {scenario.student_profile.name} says:
              </p>
              <p className="text-slate-900">{currentFlow.student_message}</p>
            </div>
          </div>
        </div>

        {/* Partner Response Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Response:</label>
          <Textarea
            rows={4}
            value={partnerResponses[currentStage] || ''}
            onChange={(e) =>
              setPartnerResponses({ ...partnerResponses, [currentStage]: e.target.value })
            }
            placeholder="Type your response to the student..."
            className="mb-2"
          />
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-amber-50 p-3 rounded">
            <Sparkles className="w-4 h-4 mt-0.5" />
            <p><strong>Tip:</strong> {currentFlow.ideal_response}</p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
            disabled={currentStage === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleSubmitResponse}
            disabled={!partnerResponses[currentStage]}
            className="bg-education-blue"
          >
            {currentStage === scenario.conversation_flow.length - 1 ? 'Complete Scenario' : 'Next Stage'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}