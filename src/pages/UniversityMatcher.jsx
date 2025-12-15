import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Loader2, Building2, Star, TrendingUp, 
  CheckCircle, ArrowRight, Target, DollarSign, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function UniversityMatcher() {
  const [matches, setMatches] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-all'],
    queryFn: () => base44.entities.University.filter({ status: 'active' }),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-all'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['all-university-reviews'],
    queryFn: () => base44.entities.UniversityReview.filter({ status: 'approved' }),
  });

  const generateMatches = async () => {
    if (!studentProfile) return;

    setIsLoading(true);

    try {
      const reviewsByUniversity = {};
      allReviews.forEach(review => {
        if (!reviewsByUniversity[review.university_id]) {
          reviewsByUniversity[review.university_id] = [];
        }
        reviewsByUniversity[review.university_id].push(review);
      });

      const universitiesWithReviews = universities.map(uni => {
        const uniReviews = reviewsByUniversity[uni.id] || [];
        const avgRating = uniReviews.length > 0
          ? (uniReviews.reduce((sum, r) => sum + r.rating, 0) / uniReviews.length).toFixed(1)
          : 0;
        return {
          ...uni,
          review_count: uniReviews.length,
          avg_rating: avgRating
        };
      });

      const prompt = `Analyze this student profile and recommend the best matching universities from the available options.

Student Profile:
- Education: ${studentProfile.education_history?.map(e => `${e.academic_level} in ${e.group_subject}`).join(', ')}
- Academic Performance: ${studentProfile.education_history?.[0]?.result_value || 'Not specified'}
- Study Destination Preference: ${studentProfile.admission_preferences?.study_destination || 'Flexible'}
- Study Level: ${studentProfile.admission_preferences?.study_level || 'Not specified'}
- Study Area Interest: ${studentProfile.admission_preferences?.study_area || 'Not specified'}
- Course Alignment: ${studentProfile.admission_preferences?.course_alignment || 'Not specified'}
- English Proficiency: ${studentProfile.english_proficiency?.test_type} ${studentProfile.english_proficiency?.overall_score || ''}
- Work Experience: ${studentProfile.work_experience?.length || 0} positions
- Funding: ${studentProfile.funding_information?.funding_status || 'Not specified'}
- Nationality: ${studentProfile.nationality}

Available Universities (with review data):
${universitiesWithReviews.slice(0, 30).map(u => `
- ${u.university_name}, ${u.country}
  - Type: ${u.university_type || 'N/A'}
  - Ranking: ${u.ranking || 'Unranked'}
  - Reviews: ${u.review_count} (avg: ${u.avg_rating}/5)
  - International Students: ${u.international_students_percent || 'N/A'}%
`).join('')}

Provide:
1. Top 8 university matches
2. For each: match score (0-100), reasons (3-5 points), key strengths, potential concerns
3. Consider: academic fit, location preference, budget, career alignment, reviews sentiment, ranking

Be specific, data-driven, and personalized.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  university_name: { type: "string" },
                  match_score: { type: "number" },
                  reasons: {
                    type: "array",
                    items: { type: "string" }
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" }
                  },
                  concerns: {
                    type: "array",
                    items: { type: "string" }
                  },
                  recommended_programs: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            overall_recommendation: { type: "string" }
          }
        }
      });

      const enrichedMatches = result.matches.map(match => {
        const university = universities.find(u => 
          u.university_name.toLowerCase().includes(match.university_name.toLowerCase()) ||
          match.university_name.toLowerCase().includes(u.university_name.toLowerCase())
        );
        return {
          ...match,
          university
        };
      }).filter(m => m.university);

      setMatches({
        matches: enrichedMatches,
        overall_recommendation: result.overall_recommendation
      });
    } catch (error) {
      console.error('Failed to generate matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="py-16 bg-gradient-to-br from-indigo-600 to-purple-600">
          <div className="container mx-auto px-6 text-center">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">AI University Matcher</h1>
            <p className="text-xl text-white/90">Get personalized university recommendations</p>
          </div>
        </section>
        <div className="container mx-auto px-6 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Your Profile</h3>
              <p className="text-slate-600 mb-6">
                To get personalized university matches, please complete your student profile first.
              </p>
              <Link to={createPageUrl('MyProfile')}>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-16 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI University Matcher
            </h1>
            <p className="text-xl text-white/90">
              Discover universities perfectly matched to your profile and goals
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {!matches ? (
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-indigo-200">
              <CardHeader>
                <CardTitle>Your Profile Summary</CardTitle>
                <CardDescription>We'll use this information to find your best matches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Study Level</div>
                    <div className="font-semibold text-slate-900">
                      {studentProfile.admission_preferences?.study_level || 'Not specified'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Study Area</div>
                    <div className="font-semibold text-slate-900">
                      {studentProfile.admission_preferences?.study_area || 'Not specified'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Preferred Destination</div>
                    <div className="font-semibold text-slate-900">
                      {studentProfile.admission_preferences?.study_destination || 'Flexible'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">English Score</div>
                    <div className="font-semibold text-slate-900">
                      {studentProfile.english_proficiency?.test_type} {studentProfile.english_proficiency?.overall_score || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="text-center py-8">
                  <Button
                    onClick={generateMatches}
                    disabled={isLoading}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing {universities.length} Universities...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Find My Perfect Matches
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Recommendation */}
            {matches.overall_recommendation && (
              <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-indigo-900 mb-2">Overall Recommendation</h3>
                      <p className="text-indigo-800 leading-relaxed">{matches.overall_recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Matches */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Your Top Matches ({matches.matches.length})
                </h2>
                <Button variant="outline" onClick={generateMatches} disabled={isLoading}>
                  Regenerate
                </Button>
              </div>

              <div className="grid gap-6">
                {matches.matches.map((match, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-2 border-slate-200 hover:border-indigo-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                              <Building2 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-900 mb-1">
                                {match.university?.university_name || match.university_name}
                              </h3>
                              {match.university && (
                                <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                                  <span>{match.university.city}, {match.university.country}</span>
                                  {match.university.ranking && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-amber-500" />
                                        World Rank #{match.university.ranking}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-indigo-600 mb-1">
                              {match.match_score}%
                            </div>
                            <div className="text-xs text-slate-500">Match Score</div>
                          </div>
                        </div>

                        <Progress value={match.match_score} className="h-2 mb-4" />

                        {/* Reasons */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Why This Match
                          </h4>
                          <ul className="space-y-1">
                            {match.reasons.map((reason, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <span className="text-indigo-600 mt-0.5">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Strengths & Concerns */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          {match.strengths?.length > 0 && (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
                                <TrendingUp className="w-4 h-4" />
                                Key Strengths
                              </div>
                              <ul className="space-y-1">
                                {match.strengths.slice(0, 3).map((strength, i) => (
                                  <li key={i} className="text-xs text-green-800">• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {match.concerns?.length > 0 && (
                            <div className="p-3 bg-amber-50 rounded-lg">
                              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
                                <Award className="w-4 h-4" />
                                Considerations
                              </div>
                              <ul className="space-y-1">
                                {match.concerns.slice(0, 3).map((concern, i) => (
                                  <li key={i} className="text-xs text-amber-800">• {concern}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Recommended Programs */}
                        {match.recommended_programs?.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-slate-900 text-sm mb-2">Recommended Programs:</h4>
                            <div className="flex flex-wrap gap-2">
                              {match.recommended_programs.map((program, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {program}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {match.university && (
                          <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <Link to={createPageUrl('UniversityDetails') + `?id=${match.university.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                View University
                              </Button>
                            </Link>
                            <Link to={createPageUrl('Courses') + `?university=${match.university.id}`} className="flex-1">
                              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                View Courses
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <Card className="border-2 border-emerald-200 bg-emerald-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-emerald-900 mb-2">Next Steps</h3>
                <ul className="space-y-2 text-sm text-emerald-800 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Review detailed information for each recommended university</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Check course offerings and entry requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Book a consultation with our counselors for personalized guidance</span>
                  </li>
                </ul>
                <Link to={createPageUrl('Contact')}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Book Free Consultation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}