import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Award, DollarSign, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function AIScholarshipRecommendations({ studentProfile, scholarships, universities }) {
  const [recommendations, setRecommendations] = useState(null);

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const context = `
Student Profile:
- Name: ${studentProfile.first_name} ${studentProfile.last_name}
- Nationality: ${studentProfile.nationality || 'Not specified'}
- Study Level: ${studentProfile.admission_preferences?.study_level || 'Not specified'}
- Study Area: ${studentProfile.admission_preferences?.study_area || 'Not specified'}
- Study Destination: ${studentProfile.admission_preferences?.study_destination || 'Not specified'}
- English Test: ${studentProfile.english_proficiency?.has_test ? `${studentProfile.english_proficiency.test_type} - ${studentProfile.english_proficiency.overall_score}` : 'Not taken'}
- Education: ${studentProfile.education_history?.[0]?.academic_level || 'Not specified'}
- GPA: ${studentProfile.education_history?.[0]?.result_value || 'Not specified'}

Available Scholarships: ${JSON.stringify(scholarships.slice(0, 20))}

Task: Analyze the student's profile and recommend the top 5 most suitable scholarships. For each recommendation:
1. Calculate a match score (0-100)
2. Explain why it's a good match
3. Highlight any potential challenges
4. Provide application tips

Return JSON array with: scholarship_id, match_score, match_reasons (array), challenges (array), tips (string)
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scholarship_id: { type: 'string' },
                  match_score: { type: 'number' },
                  match_reasons: { type: 'array', items: { type: 'string' } },
                  challenges: { type: 'array', items: { type: 'string' } },
                  tips: { type: 'string' }
                }
              }
            }
          }
        }
      });

      return response.recommendations;
    },
    onSuccess: (data) => {
      setRecommendations(data);
    },
  });

  const typeColors = {
    merit_based: 'bg-blue-100 text-blue-700',
    need_based: 'bg-emerald-100 text-emerald-700',
    sports: 'bg-orange-100 text-orange-700',
    diversity: 'bg-purple-100 text-purple-700',
    country_specific: 'bg-pink-100 text-pink-700',
    subject_specific: 'bg-cyan-100 text-cyan-700',
    other: 'bg-slate-100 text-slate-700',
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI Scholarship Recommendations
          </CardTitle>
          {recommendations && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateRecommendations.mutate()}
              disabled={generateRecommendations.isPending}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
        <p className="text-sm text-slate-600">
          Personalized scholarship matches based on your profile
        </p>
      </CardHeader>
      <CardContent>
        {!recommendations ? (
          <div className="text-center py-8">
            <Button
              onClick={() => generateRecommendations.mutate()}
              disabled={generateRecommendations.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {generateRecommendations.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing your profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const scholarship = scholarships.find(s => s.id === rec.scholarship_id);
              if (!scholarship) return null;
              
              const university = universityMap[scholarship.university_id];
              
              return (
                <motion.div
                  key={rec.scholarship_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={typeColors[scholarship.scholarship_type]}>
                          {scholarship.scholarship_type?.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className="bg-purple-500 text-white">
                          {rec.match_score}% Match
                        </Badge>
                      </div>
                      <h4 className="font-bold text-lg text-slate-900 mb-1">
                        {scholarship.scholarship_name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {university?.university_name || scholarship.country}
                      </p>
                    </div>
                    <Award className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold">
                        {scholarship.amount_type === 'full_tuition' ? 'Full Tuition' : 
                         `${scholarship.currency} ${scholarship.amount?.toLocaleString()}`}
                      </span>
                    </div>
                    {scholarship.application_deadline && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {format(new Date(scholarship.application_deadline), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 mb-1">Why this scholarship matches you:</p>
                      <ul className="space-y-1">
                        {rec.match_reasons?.map((reason, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">✓</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {rec.challenges?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-1">Considerations:</p>
                        <ul className="space-y-1">
                          {rec.challenges.map((challenge, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">!</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rec.tips && (
                      <div>
                        <p className="text-xs font-semibold text-blue-700 mb-1">Application Tips:</p>
                        <p className="text-sm text-slate-700">{rec.tips}</p>
                      </div>
                    )}
                  </div>

                  {scholarship.application_link && (
                    <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Apply Now
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}