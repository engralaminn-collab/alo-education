import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, MapPin, DollarSign, Target, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AIRecommendationsPanel({ studentId }) {
  const [generating, setGenerating] = useState(false);

  const { data: recommendations = [], refetch } = useQuery({
    queryKey: ['course-recommendations', studentId],
    queryFn: () => base44.entities.CourseRecommendation.filter({ 
      student_id: studentId 
    }, '-match_score'),
    enabled: !!studentId
  });

  const generateRecs = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      const { data } = await base44.functions.invoke('generateCourseRecommendations', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      refetch();
      toast.success(`${data.recommendations_count} recommendations generated`);
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Course Recommendations
          </CardTitle>
          <Button
            size="sm"
            onClick={() => generateRecs.mutate()}
            disabled={generating}
            className="bg-indigo-600"
          >
            {generating ? 'Generating...' : 'Generate Recommendations'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="mb-2">No recommendations yet</p>
            <p className="text-sm">Click "Generate Recommendations" to get AI-powered course suggestions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 10).map((rec, idx) => (
              <Card key={rec.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-indigo-600">#{rec.ranking || idx + 1}</Badge>
                        <h4 className="font-semibold text-lg">Course Match</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
                          {rec.match_score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Match Score</p>
                    </div>
                  </div>

                  <Progress value={rec.match_score} className="mb-4" />

                  {/* Match Factors */}
                  {rec.match_factors && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Academic</p>
                        <p className="font-bold text-blue-600">{rec.match_factors.academic_fit}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Budget</p>
                        <p className="font-bold text-green-600">{rec.match_factors.budget_fit}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Location</p>
                        <p className="font-bold text-purple-600">{rec.match_factors.location_preference}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600">Career</p>
                        <p className="font-bold text-orange-600">{rec.match_factors.career_alignment}%</p>
                      </div>
                    </div>
                  )}

                  {/* Rationale */}
                  {rec.rationale?.length > 0 && (
                    <div className="bg-indigo-50 p-3 rounded-lg mb-3">
                      <p className="text-xs font-semibold text-indigo-900 mb-2">Why this match?</p>
                      <ul className="space-y-1">
                        {rec.rationale.slice(0, 3).map((reason, i) => (
                          <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      rec.status === 'applied' ? 'border-green-500 text-green-700' :
                      rec.status === 'interested' ? 'border-blue-500 text-blue-700' :
                      'border-slate-300'
                    }>
                      {rec.status}
                    </Badge>
                    <Button size="sm" variant="ghost" className="ml-auto">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}