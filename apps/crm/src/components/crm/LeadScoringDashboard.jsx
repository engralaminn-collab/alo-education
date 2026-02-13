import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, TrendingDown, Zap, RefreshCw, Target } from 'lucide-react';
import { toast } from 'sonner';

const gradeColors = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  B: 'bg-blue-100 text-blue-700 border-blue-300',
  C: 'bg-amber-100 text-amber-700 border-amber-300',
  D: 'bg-orange-100 text-orange-700 border-orange-300',
  F: 'bg-red-100 text-red-700 border-red-300'
};

export default function LeadScoringDashboard() {
  const queryClient = useQueryClient();

  const { data: leadScores = [], isLoading } = useQuery({
    queryKey: ['lead-scores'],
    queryFn: () => base44.entities.LeadScore.list('-total_score', 50)
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-scoring'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const calculateScores = useMutation({
    mutationFn: () => base44.functions.invoke('calculateLeadScore', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scores'] });
      toast.success('Lead scores updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to calculate lead scores');
    }
  });

  const studentMap = students.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});

  const gradeDistribution = leadScores.reduce((acc, score) => {
    acc[score.grade] = (acc[score.grade] || 0) + 1;
    return acc;
  }, {});

  const avgScore = leadScores.length > 0 
    ? Math.round(leadScores.reduce((sum, s) => sum + s.total_score, 0) / leadScores.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-2xl font-bold">AI Lead Scoring</h2>
              </div>
              <p className="text-white/90 text-sm">
                Automatically score leads based on engagement, profile completeness, and intent signals
              </p>
            </div>
            <Button
              onClick={() => calculateScores.mutate()}
              disabled={calculateScores.isPending}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${calculateScores.isPending ? 'animate-spin' : ''}`} />
              Recalculate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg Score</p>
                <p className="text-xl font-bold text-slate-900">{avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">A-Grade Leads</p>
                <p className="text-xl font-bold text-slate-900">{gradeDistribution.A || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">B-Grade Leads</p>
                <p className="text-xl font-bold text-slate-900">{gradeDistribution.B || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Low Scores (D/F)</p>
                <p className="text-xl font-bold text-slate-900">{(gradeDistribution.D || 0) + (gradeDistribution.F || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-slate-500">Loading...</p>
          ) : leadScores.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No lead scores calculated yet</p>
              <Button onClick={() => calculateScores.mutate()}>
                Calculate Scores
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {leadScores.map((score) => {
                const student = studentMap[score.student_id];
                if (!student) return null;

                return (
                  <Card key={score.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">
                              {student.first_name} {student.last_name}
                            </h4>
                            <Badge className={`${gradeColors[score.grade]} border`}>
                              Grade {score.grade}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">{score.total_score}</p>
                          <p className="text-xs text-slate-500">Total Score</p>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Engagement</p>
                          <Progress value={(score.engagement_score / 50) * 100} className="h-2" />
                          <p className="text-xs font-medium text-slate-700 mt-1">{score.engagement_score}/50</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Profile</p>
                          <Progress value={(score.profile_score / 30) * 100} className="h-2" />
                          <p className="text-xs font-medium text-slate-700 mt-1">{score.profile_score}/30</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Intent</p>
                          <Progress value={(score.intent_score / 20) * 100} className="h-2" />
                          <p className="text-xs font-medium text-slate-700 mt-1">{score.intent_score}/20</p>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">AI Recommendation:</p>
                        <p className="text-sm text-blue-700">{score.recommended_action}</p>
                      </div>

                      {/* Metadata */}
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Last contact: {score.days_since_last_contact} days ago</span>
                        <span>{score.communication_count} communications • {score.application_count} applications</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}