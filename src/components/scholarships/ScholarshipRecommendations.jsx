import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Award, Calendar, FileText, ExternalLink, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ScholarshipRecommendations({ studentId }) {
  const queryClient = useQueryClient();

  const { data: recommendations = [] } = useQuery({
    queryKey: ['scholarship-recommendations', studentId],
    queryFn: () => base44.entities.ScholarshipRecommendation.filter({ 
      student_id: studentId 
    }, '-match_score'),
    enabled: !!studentId
  });

  const generate = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('recommendScholarships', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-recommendations'] });
      toast.success(`${data.recommendations_count} scholarships recommended`);
    }
  });

  const eligibilityColors = {
    highly_eligible: 'bg-green-500',
    eligible: 'bg-blue-500',
    partially_eligible: 'bg-yellow-500',
    not_eligible: 'bg-gray-400'
  };

  const difficultyColors = {
    easy: 'text-green-600',
    moderate: 'text-yellow-600',
    difficult: 'text-red-600'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            AI Scholarship Finder
          </CardTitle>
          <Button
            size="sm"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="bg-yellow-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generate.isPending ? 'Finding...' : 'Find Scholarships'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Click "Find Scholarships" to discover opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <Card key={rec.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{idx + 1}</Badge>
                        <Badge className={eligibilityColors[rec.eligibility_status]}>
                          {rec.eligibility_status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lg mb-1">
                        {rec.scholarship?.scholarship_name || 'Scholarship'}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>{rec.scholarship?.provider}</span>
                        <span>•</span>
                        <span>{rec.scholarship?.country}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-yellow-600" />
                        <span className="text-2xl font-bold text-yellow-600">
                          {rec.match_score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">Amount:</span>
                        <span>{rec.scholarship?.amount || 'Varies'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">Deadline:</span>
                        <span>{rec.scholarship?.application_deadline || 'Not specified'}</span>
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${difficultyColors[rec.application_difficulty]}`}>
                        {rec.application_difficulty} application
                      </p>
                    </div>
                  </div>

                  {rec.match_reasons?.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <p className="text-xs font-semibold text-green-900 mb-1">Why you qualify:</p>
                      <ul className="space-y-1">
                        {rec.match_reasons.slice(0, 3).map((reason, i) => (
                          <li key={i} className="text-xs text-green-800">• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.missing_requirements?.length > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg mb-3">
                      <p className="text-xs font-semibold text-orange-900 mb-1">What you need:</p>
                      <ul className="space-y-1">
                        {rec.missing_requirements.map((req, i) => (
                          <li key={i} className="text-xs text-orange-800">• {req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rec.status}</Badge>
                    {rec.scholarship?.application_link && (
                      <Button size="sm" variant="outline" className="ml-auto" asChild>
                        <a href={rec.scholarship.application_link} target="_blank" rel="noopener">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Apply
                        </a>
                      </Button>
                    )}
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