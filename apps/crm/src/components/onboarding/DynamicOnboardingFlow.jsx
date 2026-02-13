import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DynamicOnboardingFlow({ studentId, onComplete }) {
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const getNextQuestionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generateDynamicQuestionnaire', {
        student_id: studentId,
        previous_responses: responses
      });
      return data;
    },
    onSuccess: (data) => {
      setCurrentQuestion(data.next_question);
      setStep(data.step);
    }
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('completeOnboarding', {
        student_id: studentId,
        responses
      });
      return data;
    },
    onSuccess: (data) => {
      setIsCompleted(true);
      toast.success('Onboarding completed! Welcome email sent.');
      if (onComplete) onComplete(data);
    }
  });

  useEffect(() => {
    if (studentId && !currentQuestion) {
      getNextQuestionMutation.mutate();
    }
  }, [studentId]);

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;

    const updatedResponses = {
      ...responses,
      [`question_${step}`]: {
        question: currentQuestion.question,
        answer: currentAnswer
      }
    };
    
    setResponses(updatedResponses);
    setCurrentAnswer('');

    if (step >= 10) {
      completeOnboardingMutation.mutate();
    } else {
      getNextQuestionMutation.mutate();
    }
  };

  if (isCompleted) {
    return (
      <Card className="border-2 border-green-500">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Onboarding Complete!</h2>
          <p className="text-slate-600 mb-4">
            Your personalized study recommendations are ready. A counselor will contact you within 24 hours.
          </p>
          <Badge className="bg-green-600">Welcome Email Sent</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Smart Onboarding
          </CardTitle>
          <span className="text-sm text-slate-600">Step {step} of 10</span>
        </div>
        <Progress value={step * 10} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {currentQuestion ? (
          <>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Label className="text-base font-semibold mb-2 block">
                {currentQuestion.question}
              </Label>
              <p className="text-xs text-slate-600 mb-3">
                {currentQuestion.relevance_reason}
              </p>

              {currentQuestion.question_type === 'text' && (
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  rows={3}
                />
              )}

              {currentQuestion.question_type === 'multiple_choice' && (
                <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                  {currentQuestion.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.question_type === 'yes_no' && (
                <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.question_type === 'number' && (
                <Input
                  type="number"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Enter number..."
                />
              )}
            </div>

            <Button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim() || getNextQuestionMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {step >= 10 ? 'Complete Onboarding' : 'Next Question'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600">Loading personalized questions...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}