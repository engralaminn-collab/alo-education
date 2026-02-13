import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingQuiz({ module, trainingId, targetMarkets, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const { data: quizData, isLoading } = useQuery({
    queryKey: ['training-quiz', module.module_id],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateTrainingQuiz', {
        module_id: module.module_id,
        module_title: module.module_title,
        module_type: module.module_type,
        key_topics: module.key_topics || [],
        target_markets: targetMarkets
      });
      return response.data;
    }
  });

  const submitQuiz = useMutation({
    mutationFn: async (results) => {
      const training = await base44.entities.PartnerTraining.get(trainingId);
      const quizResult = {
        module_id: module.module_id,
        score: results.score,
        total_questions: results.total,
        completed_at: new Date().toISOString(),
        passed: results.score >= 70
      };

      const updatedPath = training.learning_path.map(m => 
        m.module_id === module.module_id 
          ? { ...m, status: 'completed', progress: 100, quiz_score: results.score }
          : m
      );

      // Unlock next module
      const currentIndex = updatedPath.findIndex(m => m.module_id === module.module_id);
      if (currentIndex < updatedPath.length - 1) {
        updatedPath[currentIndex + 1].status = 'available';
      }

      const completed = updatedPath.filter(m => m.status === 'completed').length;
      const overallProgress = (completed / updatedPath.length) * 100;

      // Award badge if threshold met
      const newBadges = [...(training.badges_earned || [])];
      if (completed === 3 && !newBadges.find(b => b.badge_type === 'beginner')) {
        newBadges.push({
          badge_name: 'Learning Foundations',
          badge_type: 'beginner',
          earned_date: new Date().toISOString(),
          description: 'Completed first 3 training modules'
        });
      }
      if (completed === 6 && !newBadges.find(b => b.badge_type === 'specialist')) {
        newBadges.push({
          badge_name: 'Subject Specialist',
          badge_type: 'specialist',
          earned_date: new Date().toISOString(),
          description: 'Completed 6 training modules'
        });
      }

      await base44.entities.PartnerTraining.update(trainingId, {
        learning_path: updatedPath,
        quiz_results: [...(training.quiz_results || []), quizResult],
        badges_earned: newBadges,
        overall_progress: overallProgress
      });

      return { passed: results.score >= 70 };
    },
    onSuccess: (result) => {
      if (result.passed) {
        toast.success('🎉 Quiz passed! Module completed!');
      } else {
        toast.error('Quiz failed. You need 70% to pass. Try again!');
      }
    }
  });

  const handleAnswer = (answer) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correct = 0;
      quizData.quiz.forEach((q, i) => {
        if (selectedAnswers[i] === q.correct_answer) correct++;
      });
      const finalScore = (correct / quizData.quiz.length) * 100;
      setScore(finalScore);
      setShowResults(true);
      submitQuiz.mutate({ score: finalScore, total: quizData.quiz.length });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-education-blue" />
          <p>Generating personalized quiz...</p>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Trophy className={`w-20 h-20 mx-auto mb-4 ${score >= 70 ? 'text-amber-500' : 'text-slate-400'}`} />
          <h2 className="text-3xl font-bold mb-2">
            {score >= 70 ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <p className="text-xl mb-6">Your Score: {score.toFixed(0)}%</p>
          <p className="text-slate-600 mb-8">
            {score >= 70 
              ? 'You passed! The next module is now unlocked.' 
              : 'You need 70% to pass. Review the material and try again.'}
          </p>
          <Button onClick={onComplete}>
            {score >= 70 ? 'Continue Learning' : 'Review & Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = quizData.quiz[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{module.module_title} - Quiz</CardTitle>
          <Badge variant="outline">
            Question {currentQuestion + 1} / {quizData.quiz.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selectedAnswers[currentQuestion] === letter;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(letter)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-education-blue bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-semibold mr-3">{letter}.</span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedAnswers[currentQuestion]}
            className="bg-education-blue"
          >
            {currentQuestion === quizData.quiz.length - 1 ? 'Submit Quiz' : 'Next Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}