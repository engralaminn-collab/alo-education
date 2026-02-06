import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, TrendingUp, Award, Globe, DollarSign, 
  Briefcase, CheckCircle, MapPin, Clock, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIUniversityMatcher({ studentProfileId }) {
  const [matches, setMatches] = useState(null);

  const generateMatches = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('matchUniversitiesAndCourses', {
        studentProfileId
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setMatches(data.matches);
        toast.success(`Found ${data.total_matches} perfect matches for you!`);
      } else {
        toast.error('Could not generate matches');
      }
    },
    onError: () => {
      toast.error('Failed to generate matches');
    }
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-slate-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-slate-100';
  };

  return (
    <div className="space-y-6">
      {!matches ? (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              AI-Powered University Matching
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Let our AI analyze your profile and find the perfect university and course matches 
              tailored to your academics, preferences, and career goals.
            </p>
            <Button
              onClick={() => generateMatches.mutate()}
              disabled={generateMatches.isPending}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateMatches.isPending ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Your Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Find My Perfect Matches
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Your Personalized Matches
              </h3>
              <p className="text-slate-600 mt-1">
                {matches.length} universities perfectly matched to your profile
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => generateMatches.mutate()}
              disabled={generateMatches.isPending}
            >
              Refresh Matches
            </Button>
          </div>

          <div className="grid gap-6">
            {matches.map((match, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 p-6">
                  {/* University Logo */}
                  <div className="shrink-0">
                    {match.university.logo ? (
                      <img 
                        src={match.university.logo} 
                        alt={match.university.name}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {match.university.name[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">
                          {match.university.name}
                        </h4>
                        <p className="text-lg text-slate-700 mt-1">
                          {match.course.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {match.university.city}, {match.university.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {match.course.duration}
                          </span>
                          <Badge>{match.course.level}</Badge>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className={`text-center px-4 py-2 rounded-lg ${getScoreBg(match.match_score)}`}>
                        <div className={`text-3xl font-bold ${getScoreColor(match.match_score)}`}>
                          {match.match_score}%
                        </div>
                        <div className="text-xs text-slate-600 font-semibold">Match</div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Ranking</p>
                        <p className="font-bold text-slate-900">#{match.university.ranking || 'N/A'}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Visa Success</p>
                        <p className="font-bold text-green-600">{match.estimated_visa_success_rate}%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Affordability</p>
                        <p className="font-bold text-purple-600">{match.affordability_score}%</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Briefcase className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Employability</p>
                        <p className="font-bold text-orange-600">{match.university.employability_rate || 'N/A'}%</p>
                      </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Key Benefits:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.key_benefits?.map((benefit, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Scholarship Opportunities */}
                    {match.scholarship_opportunities?.length > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Scholarship Opportunities Available
                        </p>
                        <div className="space-y-1">
                          {match.scholarship_opportunities.slice(0, 2).map((scholarship, i) => (
                            <div key={i} className="text-xs text-yellow-800">
                              <span className="font-semibold">{scholarship.name}</span> - 
                              Up to ${scholarship.amount?.toLocaleString()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Why this match?</p>
                      <ul className="space-y-1">
                        {match.match_reasons?.slice(0, 3).map((reason, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Career Prospects */}
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Career Prospects
                      </p>
                      <p className="text-sm text-slate-600">{match.career_prospects}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link to={createPageUrl('UniversityDetails') + `?id=${match.university.id}`}>
                        <Button variant="outline" size="sm">
                          <Globe className="w-4 h-4 mr-2" />
                          View University
                        </Button>
                      </Link>
                      <Link to={createPageUrl('CourseDetails') + `?id=${match.course.id}`}>
                        <Button variant="outline" size="sm">
                          View Course Details
                        </Button>
                      </Link>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 ml-auto">
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}