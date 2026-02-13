import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, MapPin, Users, DollarSign, CheckCircle,
  Building2, TrendingUp, Award, BookOpen, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function SharedComparison() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const { data: comparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['shared-comparison', token],
    queryFn: async () => {
      const comparisons = await base44.entities.UniversityComparison.filter({ share_token: token });
      return comparisons[0];
    },
    enabled: !!token
  });

  const { data: universities = [], isLoading: universitiesLoading } = useQuery({
    queryKey: ['comparison-universities', comparison?.university_ids],
    queryFn: async () => {
      if (!comparison?.university_ids?.length) return [];
      const allUnis = await base44.entities.University.list();
      return allUnis.filter(u => comparison.university_ids.includes(u.id));
    },
    enabled: !!comparison?.university_ids
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['comparison-courses', comparison?.university_ids],
    queryFn: async () => {
      if (!comparison?.university_ids?.length) return [];
      const allCourses = await base44.entities.Course.list();
      return allCourses.filter(c => comparison.university_ids.includes(c.university_id));
    },
    enabled: !!comparison?.university_ids
  });

  const getUniversityCourses = (uniId) => {
    return courses.filter(c => c.university_id === uniId);
  };

  const getPopularFields = (uniId) => {
    const uniCourses = getUniversityCourses(uniId);
    const fields = {};
    uniCourses.forEach(c => {
      if (c.subject_area) {
        fields[c.subject_area] = (fields[c.subject_area] || 0) + 1;
      }
    });
    return Object.entries(fields)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([field]) => field);
  };

  if (comparisonLoading || universitiesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (!comparison || universities.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Comparison not found</h2>
          <p className="text-slate-600 mb-6">The comparison you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl('Universities')}>
            <Button>Browse Universities</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-600 to-cyan-600 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center text-white">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl font-bold mb-3">{comparison.name || 'University Comparison'}</h1>
            <p className="text-white/80 text-lg">
              Comparing {universities.length} universities side-by-side
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-600 bg-slate-50 sticky left-0 z-10">
                      Criteria
                    </th>
                    {universities.map(uni => (
                      <th key={uni.id} className="p-4 text-center min-w-[250px]">
                        <div className="space-y-2">
                          {uni.logo && (
                            <img src={uni.logo} alt={uni.university_name} className="h-12 mx-auto object-contain mb-2" />
                          )}
                          <h4 className="font-bold text-slate-900">{uni.university_name}</h4>
                          <div className="flex items-center justify-center gap-1 text-sm text-slate-500">
                            <MapPin className="w-3 h-3" />
                            {uni.city}, {uni.country}
                          </div>
                          <Link to={createPageUrl('UniversityDetails') + `?id=${uni.id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Ranking */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        World Ranking
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4 text-center">
                        {uni.ranking ? (
                          <Badge className="bg-amber-100 text-amber-700">
                            #{uni.ranking}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* QS Ranking */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        QS Ranking
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4 text-center">
                        {uni.qs_ranking ? (
                          <Badge className="bg-blue-100 text-blue-700">
                            #{uni.qs_ranking}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Tuition Fees */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        Tuition Range
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4 text-center">
                        <div className="text-sm">
                          <div className="font-semibold text-emerald-600">
                            Contact for fees
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Student Population */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        Students
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4 text-center">
                        {uni.student_population ? (
                          <div className="text-sm">
                            <div className="font-semibold">{uni.student_population.toLocaleString()}</div>
                            {uni.international_students_percent && (
                              <div className="text-xs text-slate-500">
                                {uni.international_students_percent}% international
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Acceptance Rate */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        Acceptance Rate
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4 text-center">
                        {uni.acceptance_rate ? (
                          <Badge variant="outline">{uni.acceptance_rate}%</Badge>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Popular Fields */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cyan-500" />
                        Popular Courses
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {getPopularFields(uni.id).length > 0 ? getPopularFields(uni.id).map((field, i) => (
                            <Badge key={i} variant="outline" className="text-xs capitalize">
                              {field}
                            </Badge>
                          )) : <span className="text-slate-400">N/A</span>}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Available Courses */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Total Courses
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4 text-center">
                        <div className="font-semibold text-lg">{getUniversityCourses(uni.id).length}</div>
                        <Link to={createPageUrl('Courses') + `?university=${uni.id}`}>
                          <Button size="sm" variant="link" className="text-xs">
                            View Courses
                          </Button>
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Entry Requirements */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        Entry Requirements
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4">
                        <div className="text-xs text-slate-600 text-left">
                          {uni.entry_requirements_summary || 'Contact university for details'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Scholarship Availability */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        Scholarships
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4 text-center">
                        {uni.scholarships_summary ? (
                          <div className="text-xs text-slate-600 text-left">
                            {uni.scholarships_summary}
                          </div>
                        ) : (
                          <span className="text-slate-400">Contact for info</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Intakes */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-500" />
                        Main Intakes
                      </div>
                    </td>
                    {universities.map(uni => (
                      <td key={uni.id} className="p-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {uni.intakes ? (
                            uni.intakes.split(/[,/]/).map((intake, i) => (
                              <Badge key={i} className="bg-blue-100 text-blue-700 text-xs">
                                {intake.trim()}
                              </Badge>
                            ))
                          ) : <span className="text-slate-400">N/A</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
              <Link to={createPageUrl('Universities')}>
                <Button variant="outline">
                  Browse More Universities
                </Button>
              </Link>
              <Link to={createPageUrl('Contact')}>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Get Expert Guidance
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}