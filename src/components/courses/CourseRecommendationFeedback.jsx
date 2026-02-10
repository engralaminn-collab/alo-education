import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, TrendingUp, Briefcase, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseRecommendationFeedback({ studentId }) {
  const [selectedRec, setSelectedRec] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, comments: '' });

  // Fetch enhanced recommendations
  const { data: recommendations, refetch } = useQuery({
    queryKey: ['enhanced-recommendations', studentId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('enhancedCourseRecommendations', {
        student_id: studentId,
        include_success_prediction: true,
        include_employment_data: true
      });
      return data;
    },
    enabled: !!studentId
  });

  // Submit feedback
  const submitFeedback = useMutation({
    mutationFn: async () => {
      await base44.entities.CourseRecommendation.update(selectedRec.id, {
        feedback_rating: feedback.rating,
        feedback_comments: feedback.comments,
        feedback_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Feedback submitted');
      setSelectedRec(null);
      setFeedback({ rating: 0, comments: '' });
      refetch();
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Enhanced Course Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            AI-powered recommendations considering career goals, success predictions, and employment outcomes.
          </p>

          {recommendations?.recommendations?.map((rec, i) => (
            <div key={i} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-semibold">{rec.course_title}</h5>
                  <p className="text-xs text-slate-500 mt-1">{rec.course_details?.university_id}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500">{rec.match_score}%</Badge>
                  <p className="text-xs text-slate-500 mt-1">
                    Career Fit: {rec.career_alignment_score}%
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-3">{rec.reasoning}</p>

              {/* Career Outcomes */}
              {rec.career_outcomes && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-900">Career Outcomes</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-blue-700 font-medium">Typical Roles:</p>
                      <p className="text-blue-600">
                        {rec.career_outcomes.typical_roles?.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <p className="text-blue-700 font-medium">Salary Range:</p>
                      </div>
                      <p className="text-blue-600">{rec.career_outcomes.salary_range}</p>
                    </div>
                  </div>
                  {rec.career_outcomes.employment_rate && (
                    <p className="text-xs text-blue-700 mt-2">
                      <Star className="w-3 h-3 inline mr-1" />
                      {rec.career_outcomes.employment_rate}% employment rate
                    </p>
                  )}
                </div>
              )}

              {/* Success Prediction */}
              {rec.predicted_success_rate && (
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <p className="text-xs font-semibold text-green-900 mb-1">
                    Predicted Success Rate: {rec.predicted_success_rate}%
                  </p>
                  <p className="text-xs text-green-700">
                    Learning Curve: <Badge variant="outline">{rec.learning_curve}</Badge>
                  </p>
                </div>
              )}

              {/* Why Recommended */}
              {rec.why_recommended?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Why Recommended:</p>
                  <ul className="space-y-1">
                    {rec.why_recommended.map((reason, j) => (
                      <li key={j} className="text-xs text-green-700">✓ {reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Potential Challenges */}
              {rec.potential_challenges?.length > 0 && (
                <div className="bg-yellow-50 p-2 rounded mb-3">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">Considerations:</p>
                  <ul className="space-y-1">
                    {rec.potential_challenges.map((challenge, j) => (
                      <li key={j} className="text-xs text-yellow-800">• {challenge}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedRec({ ...rec, id: `rec_${i}` })}
                className="w-full"
              >
                Provide Feedback
              </Button>
            </div>
          ))}

          {recommendations?.personalization_factors && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-slate-700 mb-2">Personalization Factors:</p>
              <div className="flex flex-wrap gap-1">
                {recommendations.personalization_factors.map((factor, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{factor}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Modal */}
      {selectedRec && (
        <Card className="border-blue-300">
          <CardHeader>
            <CardTitle className="text-base">Rate Recommendation: {selectedRec.course_title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFeedback({ ...feedback, rating })}
                    className={`p-2 rounded ${
                      feedback.rating >= rating ? 'text-yellow-500' : 'text-slate-300'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Comments (Optional)</label>
              <Textarea
                value={feedback.comments}
                onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                placeholder="What did you think of this recommendation?"
                className="min-h-24"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => submitFeedback.mutate()}
                disabled={feedback.rating === 0 || submitFeedback.isPending}
                className="flex-1"
              >
                Submit Feedback
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRec(null);
                  setFeedback({ rating: 0, comments: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}