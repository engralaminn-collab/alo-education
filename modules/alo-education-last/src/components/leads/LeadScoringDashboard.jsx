import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Flame, AlertCircle, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadScoringDashboard() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: leadScores = [] } = useQuery({
    queryKey: ['lead-scores'],
    queryFn: () => base44.entities.LeadScore.list('-score', 100)
  });

  const calculateScoreMutation = useMutation({
    mutationFn: async (studentId) => {
      const { data } = await base44.functions.invoke('calculateLeadScore', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scores'] });
      toast.success('Lead score calculated!');
    }
  });

  const filteredLeads = selectedCategory === 'all' 
    ? leadScores 
    : leadScores.filter(l => l.score_category === selectedCategory);

  const scoreColor = (category) => {
    const colors = {
      hot: 'bg-red-100 text-red-800 border-red-300',
      warm: 'bg-orange-100 text-orange-800 border-orange-300',
      cold: 'bg-blue-100 text-blue-800 border-blue-300',
      unqualified: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[category] || colors.cold;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setSelectedCategory('hot')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Hot Leads</p>
                <p className="text-3xl font-bold text-red-600">
                  {leadScores.filter(l => l.score_category === 'hot').length}
                </p>
              </div>
              <Flame className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setSelectedCategory('warm')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Warm Leads</p>
                <p className="text-3xl font-bold text-orange-600">
                  {leadScores.filter(l => l.score_category === 'warm').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setSelectedCategory('cold')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Cold Leads</p>
                <p className="text-3xl font-bold text-blue-600">
                  {leadScores.filter(l => l.score_category === 'cold').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Score</p>
                <p className="text-3xl font-bold">
                  {Math.round(leadScores.reduce((sum, l) => sum + l.score, 0) / (leadScores.length || 1))}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lead Scores</CardTitle>
            <Button variant="outline" onClick={() => setSelectedCategory('all')}>
              Show All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLeads.map(lead => (
              <Card key={lead.id} className={`border-2 ${scoreColor(lead.score_category)}`}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={scoreColor(lead.score_category)}>
                          {lead.score_category.toUpperCase()}
                        </Badge>
                        <span className="font-bold text-2xl">{lead.score}</span>
                        <span className="text-sm text-slate-600">
                          {lead.conversion_probability}% conversion probability
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-slate-600">Profile:</span>
                          <span className="font-semibold ml-1">{lead.factors?.profile_completeness}%</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Engagement:</span>
                          <span className="font-semibold ml-1">{lead.factors?.engagement_level}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Events:</span>
                          <span className="font-semibold ml-1">{lead.factors?.event_participation}</span>
                        </div>
                      </div>

                      {lead.recommended_actions?.length > 0 && (
                        <div className="bg-white p-2 rounded text-xs">
                          <strong>Recommended Actions:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {lead.recommended_actions.map((action, idx) => (
                              <li key={idx}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => calculateScoreMutation.mutate(lead.student_id)}
                      disabled={calculateScoreMutation.isPending}
                    >
                      Recalculate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}