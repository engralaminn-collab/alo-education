import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, Trophy, Lock, Play, CheckCircle, 
  BookOpen, Users, Target, FileCheck, Sparkles, Award
} from 'lucide-react';
import { toast } from 'sonner';
import TrainingQuiz from './TrainingQuiz';
import StudentScenario from './StudentScenario';

export default function PartnerTrainingModule({ partnerId, userId, specialization, targetMarkets }) {
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  const { data: training, isLoading } = useQuery({
    queryKey: ['partner-training', partnerId],
    queryFn: async () => {
      const existing = await base44.entities.PartnerTraining.filter({ partner_id: partnerId, user_id: userId });
      return existing[0] || null;
    }
  });

  const initializeTraining = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generatePartnerLearningPath', {
        partner_id: partnerId,
        user_id: userId,
        specialization: specialization || 'General Education Consultant',
        target_markets: targetMarkets || ['UK', 'USA', 'Canada']
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-training'] });
      toast.success('Your personalized learning path is ready!');
    }
  });

  const moduleIcons = {
    course_knowledge: BookOpen,
    student_interaction: Users,
    market_insight: Target,
    compliance: FileCheck
  };

  const badgeColors = {
    beginner: 'bg-green-100 text-green-700',
    specialist: 'bg-blue-100 text-blue-700',
    expert: 'bg-purple-100 text-purple-700',
    master: 'bg-amber-100 text-amber-700'
  };

  if (isLoading) {
    return <div>Loading training...</div>;
  }

  if (!training) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-education-blue" />
            AI-Powered Partner Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Start Your Training Journey</h3>
            <p className="text-slate-600 mb-6">
              Get a personalized learning path based on your specialization and target markets
            </p>
            <Button 
              onClick={() => initializeTraining.mutate()}
              disabled={initializeTraining.isPending}
              className="bg-education-blue"
            >
              {initializeTraining.isPending ? 'Generating...' : 'Generate My Learning Path'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-education-blue" />
              Partner Training Academy
            </CardTitle>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {training.overall_progress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={training.overall_progress} className="h-3 mb-4" />
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-education-blue">
                {training.learning_path?.filter(m => m.status === 'completed').length || 0}
              </p>
              <p className="text-sm text-slate-600">Completed</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">
                {training.learning_path?.filter(m => m.status === 'in_progress').length || 0}
              </p>
              <p className="text-sm text-slate-600">In Progress</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {training.badges_earned?.length || 0}
              </p>
              <p className="text-sm text-slate-600">Badges Earned</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {training.quiz_results?.filter(q => q.passed).length || 0}
              </p>
              <p className="text-sm text-slate-600">Quizzes Passed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Learning Path</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="scenarios">Simulations</TabsTrigger>
        </TabsList>

        {/* Learning Path */}
        <TabsContent value="overview" className="space-y-4">
          {training.learning_path?.map((module, index) => {
            const Icon = moduleIcons[module.module_type] || BookOpen;
            const isLocked = module.status === 'locked';
            const isCompleted = module.status === 'completed';
            
            return (
              <Card key={module.module_id} className={isLocked ? 'opacity-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isCompleted ? 'bg-green-100' : 
                        module.status === 'in_progress' ? 'bg-blue-100' : 
                        'bg-slate-100'
                      }`}>
                        {isLocked ? <Lock className="w-6 h-6 text-slate-400" /> :
                         isCompleted ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                         <Icon className="w-6 h-6 text-education-blue" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{module.module_title}</h3>
                        <Badge variant="outline" className="mb-2">{module.module_type.replace('_', ' ')}</Badge>
                        {module.progress > 0 && (
                          <Progress value={module.progress} className="h-2 mt-3" />
                        )}
                      </div>
                    </div>
                    <Button
                      disabled={isLocked || isCompleted}
                      onClick={() => {
                        setSelectedModule(module);
                        setActiveView('module');
                      }}
                      variant={isCompleted ? 'outline' : 'default'}
                    >
                      {isCompleted ? <CheckCircle className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isCompleted ? 'Review' : isLocked ? 'Locked' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges">
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {training.badges_earned && training.badges_earned.length > 0 ? (
                  training.badges_earned.map((badge, i) => (
                    <div key={i} className={`p-6 rounded-lg text-center ${badgeColors[badge.badge_type]}`}>
                      <Award className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="font-bold text-lg">{badge.badge_name}</h3>
                      <p className="text-sm mt-2">{badge.description}</p>
                      <p className="text-xs mt-2 opacity-75">
                        Earned {new Date(badge.earned_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12 text-slate-500">
                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Complete modules to earn badges!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulations */}
        <TabsContent value="scenarios">
          <StudentScenario 
            specialization={specialization}
            targetMarkets={targetMarkets}
            trainingId={training.id}
          />
        </TabsContent>
      </Tabs>

      {/* Module Content */}
      {selectedModule && activeView === 'module' && (
        <TrainingQuiz 
          module={selectedModule}
          trainingId={training.id}
          targetMarkets={targetMarkets}
          onComplete={() => {
            setActiveView('overview');
            setSelectedModule(null);
            queryClient.invalidateQueries({ queryKey: ['partner-training'] });
          }}
        />
      )}
    </div>
  );
}