import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, Sparkles, MessageSquare, Bell, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/landing/Footer';
import AIOnboardingGenerator from '@/components/onboarding/AIOnboardingGenerator';
import OnboardingChatbot from '@/components/onboarding/OnboardingChatbot';
import AIOnboardingReminders from '@/components/onboarding/AIOnboardingReminders';

export default function StudentOnboarding() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user-onboarding'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-onboarding', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: checklist } = useQuery({
    queryKey: ['onboarding-checklist', studentProfile?.id],
    queryFn: async () => {
      const checklists = await base44.entities.OnboardingChecklist.filter({ 
        student_id: studentProfile.id 
      });
      return checklists[0];
    },
    enabled: !!studentProfile?.id,
  });

  const toggleItem = useMutation({
    mutationFn: async ({ itemId, completed }) => {
      const updatedItems = checklist.checklist_items.map(item =>
        item.id === itemId
          ? { 
              ...item, 
              completed,
              completed_date: completed ? new Date().toISOString() : null
            }
          : item
      );

      const completedCount = updatedItems.filter(i => i.completed).length;
      const completionPercentage = Math.round((completedCount / updatedItems.length) * 100);

      await base44.entities.OnboardingChecklist.update(checklist.id, {
        checklist_items: updatedItems,
        completion_percentage: completionPercentage
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding-checklist']);
      toast.success('Progress updated!');
    }
  });

  const categoryColors = {
    documents: 'bg-blue-100 text-blue-700',
    profile: 'bg-purple-100 text-purple-700',
    tests: 'bg-amber-100 text-amber-700',
    financial: 'bg-green-100 text-green-700',
    visa: 'bg-red-100 text-red-700',
    other: 'bg-slate-100 text-slate-700',
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
  };

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section style={{ background: '#0066CC' }} className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-3">Welcome to Your Study Abroad Journey!</h1>
            <p className="text-xl text-white/90">
              Let's get you organized with a personalized onboarding checklist
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        {!checklist ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#F37021' }} />
                  Let AI Create Your Personalized Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-slate-600">
                  Based on your profile, target country, and study level, our AI will generate a customized onboarding checklist with all the steps you need to complete.
                </p>
                <AIOnboardingGenerator 
                  student={studentProfile}
                  onGenerated={() => queryClient.invalidateQueries(['onboarding-checklist'])}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="border-2" style={{ borderColor: '#0066CC' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Onboarding Progress</h2>
                    <p className="text-slate-600">
                      {checklist.country_of_interest} • {checklist.study_level}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: '#0066CC' }}>
                      {checklist.completion_percentage}%
                    </div>
                    <p className="text-sm text-slate-600">Complete</p>
                  </div>
                </div>
                <Progress value={checklist.completion_percentage} className="h-3" />
                <p className="text-sm text-slate-600 mt-2">
                  {checklist.checklist_items.filter(i => i.completed).length} of {checklist.checklist_items.length} items completed
                </p>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Checklist */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">
                      <ListChecks className="w-4 h-4 mr-2" />
                      All Items
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      Pending ({checklist.checklist_items.filter(i => !i.completed).length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed ({checklist.checklist_items.filter(i => i.completed).length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3 mt-4">
                    {checklist.checklist_items.map(item => (
                      <Card key={item.id} className={item.completed ? 'bg-green-50' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleItem.mutate({ 
                                itemId: item.id, 
                                completed: !item.completed 
                              })}
                              className="mt-1"
                            >
                              {item.completed ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className={`font-semibold ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                  {item.title}
                                </h3>
                                <div className="flex gap-2">
                                  <Badge className={categoryColors[item.category]}>
                                    {item.category}
                                  </Badge>
                                  <Badge className={priorityColors[item.priority]}>
                                    {item.priority}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                              {item.due_date && (
                                <p className="text-xs text-slate-500">
                                  Due: {new Date(item.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-3 mt-4">
                    {checklist.checklist_items.filter(i => !i.completed).map(item => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleItem.mutate({ 
                                itemId: item.id, 
                                completed: true 
                              })}
                              className="mt-1"
                            >
                              <Circle className="w-6 h-6 text-slate-400" />
                            </button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                <div className="flex gap-2">
                                  <Badge className={categoryColors[item.category]}>
                                    {item.category}
                                  </Badge>
                                  <Badge className={priorityColors[item.priority]}>
                                    {item.priority}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                              {item.due_date && (
                                <p className="text-xs text-slate-500">
                                  Due: {new Date(item.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-3 mt-4">
                    {checklist.checklist_items.filter(i => i.completed).map(item => (
                      <Card key={item.id} className="bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-500 line-through">{item.title}</h3>
                              <p className="text-xs text-slate-500 mt-1">
                                Completed: {item.completed_date && new Date(item.completed_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <AIOnboardingReminders student={studentProfile} checklist={checklist} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Need Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-3">
                      Chat with our AI assistant for guidance on any onboarding step
                    </p>
                    <Button className="w-full" style={{ backgroundColor: '#F37021' }}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Open Chat Assistant
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Chatbot Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#0066CC' }}>
                  <MessageSquare className="w-5 h-5" />
                  AI Onboarding Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OnboardingChatbot student={studentProfile} checklist={checklist} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}