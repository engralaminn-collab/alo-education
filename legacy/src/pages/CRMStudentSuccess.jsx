import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentRiskAlerts from '@/components/crm/StudentRiskAlerts';
import AIOutreachSuggestions from '@/components/crm/AIOutreachSuggestions';
import SuccessKPIDashboard from '@/components/crm/SuccessKPIDashboard';
import StudentProgressTracker from '@/components/crm/StudentProgressTracker';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, AlertTriangle, Sparkles, Target } from 'lucide-react';

export default function CRMStudentSuccess() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list()
  });

  const isLoading = studentsLoading || applicationsLoading;

  // Calculate overview stats
  const totalStudents = students.length;
  const activeApplications = applications.filter(app => 
    !['rejected', 'withdrawn', 'enrolled'].includes(app.status)
  ).length;
  const atRiskStudents = students.filter(student => {
    const studentApps = applications.filter(app => app.student_id === student.id);
    const hasPendingDeadlines = studentApps.some(app => 
      app.offer_deadline && new Date(app.offer_deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    return hasPendingDeadlines || student.profile_completeness < 50;
  }).length;

  return (
    <CRMLayout 
      title="Student Success" 
      subtitle="Monitor student progress, identify risks, and get AI-powered outreach suggestions"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Applications</p>
                  <p className="text-2xl font-bold text-emerald-600">{activeApplications}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">At-Risk Students</p>
                  <p className="text-2xl font-bold text-red-600">{atRiskStudents}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {applications.length > 0 
                      ? Math.round((applications.filter(a => a.status === 'enrolled').length / applications.length) * 100)
                      : 0}%
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="risks">Risk Alerts</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="kpis">KPIs & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                This module uses AI to analyze student behavior, identify potential risks, 
                and provide proactive suggestions to improve student success rates.
              </AlertDescription>
            </Alert>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Recent Risk Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StudentRiskAlerts 
                    students={students}
                    applications={applications}
                    limit={5}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Outreach Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIOutreachSuggestions 
                    students={students}
                    applications={applications}
                    tasks={tasks}
                    limit={5}
                  />
                </CardContent>
              </Card>
            </div>

            <StudentProgressTracker 
              students={students}
              applications={applications}
            />
          </TabsContent>

          <TabsContent value="risks" className="mt-6">
            <StudentRiskAlerts 
              students={students}
              applications={applications}
            />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-6">
            <AIOutreachSuggestions 
              students={students}
              applications={applications}
              tasks={tasks}
            />
          </TabsContent>

          <TabsContent value="kpis" className="mt-6">
            <SuccessKPIDashboard 
              students={students}
              applications={applications}
              tasks={tasks}
            />
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}