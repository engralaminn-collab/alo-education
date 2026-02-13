import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles, TrendingUp, BookOpen, DollarSign, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIRecommendationEngine({ studentId, onCourseSelect }) {
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedRanking, setSelectedRanking] = useState('all');
  const [loading, setLoading] = useState(false);

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-rec', studentId],
    queryFn: () => base44.entities.StudentProfile.list(),
    enabled: !!studentId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-ai-rec'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-ai-rec'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships-ai-rec'],
    queryFn: () => base44.entities.Scholarship.list(),
  });

  const universityMap = universities.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const student = studentProfile?.[0];
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this student profile and recommend the top 5 most suitable courses from the database. Consider their academic background, interests, and career goals.

Student Profile:
- Name: ${student?.first_name} ${student?.last_name}
- Preferred Countries: ${student?.preferred_countries?.join(', ') || 'Any'}
- Preferred Fields: ${student?.preferred_fields?.join(', ') || 'Any'}
- Preferred Level: ${student?.preferred_degree_level || 'Any'}
- Budget: $${student?.budget_max || 'Flexible'}/year
- IELTS Score: ${student?.english_proficiency?.overall_score || 'Not specified'}

Available Courses Data:
${JSON.stringify(courses.slice(0, 50), null, 2)}

Return a JSON object with recommendations array containing: courseId, reason, matchScore (1-100), marketTrend ("rising", "stable", "declining").`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  courseId: { type: "string" },
                  reason: { type: "string" },
                  matchScore: { type: "number" },
                  marketTrend: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: () => {
      toast.success('AI recommendations generated!');
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to generate recommendations');
      setLoading(false);
    }
  });

  const filteredCourses = useMemo(() => {
    const student = studentProfile?.[0];
    
    return courses
      .filter(c => {
        const tuition = c.tuition_fee_max || 0;
        const university = universityMap[c.university_id];
        const ranking = university?.qs_ranking || 999;
        
        const matchesPrice = tuition >= priceRange[0] && tuition <= priceRange[1];
        const matchesRanking = selectedRanking === 'all' || 
          (selectedRanking === 'top50' && ranking <= 50) ||
          (selectedRanking === 'top100' && ranking <= 100) ||
          (selectedRanking === 'top200' && ranking <= 200);
        
        const matchesPreferences = !student?.preferred_fields?.length || 
          student.preferred_fields.some(f => c.subject_area?.toLowerCase().includes(f.toLowerCase()));
        
        return matchesPrice && matchesRanking && matchesPreferences;
      })
      .sort((a, b) => {
        const univA = universityMap[a.university_id];
        const univB = universityMap[b.university_id];
        
        if (sortBy === 'price_low') return (a.tuition_fee_min || 0) - (b.tuition_fee_min || 0);
        if (sortBy === 'price_high') return (b.tuition_fee_max || 0) - (a.tuition_fee_max || 0);
        if (sortBy === 'ranking') return (univA?.qs_ranking || 999) - (univB?.qs_ranking || 999);
        if (sortBy === 'deadline') return new Date(a.application_deadline) - new Date(b.application_deadline);
        return 0;
      })
      .slice(0, 8);
  }, [courses, studentProfile, priceRange, selectedRanking, sortBy, universityMap]);

  return (
    <div className="space-y-6">
      {/* AI Recommendation Generator */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </div>
            <Button
              onClick={() => generateRecommendations.mutate()}
              disabled={loading || generateRecommendations.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Analyzing...' : 'Generate for You'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Our AI analyzes your profile, academic history, interests, and current market trends to suggest the most suitable courses.
          </p>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Filters & Sorting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sorting */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="price_low">Lowest Tuition Fee</SelectItem>
                <SelectItem value="price_high">Highest Tuition Fee</SelectItem>
                <SelectItem value="ranking">University Ranking (Best)</SelectItem>
                <SelectItem value="deadline">Application Deadline (Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* University Ranking Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">University Ranking</label>
            <Select value={selectedRanking} onValueChange={setSelectedRanking}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rankings</SelectItem>
                <SelectItem value="top50">Top 50 Universities</SelectItem>
                <SelectItem value="top100">Top 100 Universities</SelectItem>
                <SelectItem value="top200">Top 200 Universities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tuition Fee Range */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-700">Tuition Fee Range</label>
              <span className="text-sm text-slate-600">${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}</span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={100000}
              step={5000}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filtered Courses */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Recommended Courses ({filteredCourses.length})
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {filteredCourses.map((course, idx) => {
            const university = universityMap[course.university_id];
            const scholarshipAvailable = scholarships.some(s => s.university_id === course.university_id);
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h4 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                      {course.course_title}
                    </h4>
                    
                    <p className="text-sm text-slate-600 mb-3">
                      {university?.university_name}
                    </p>

                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="w-3 h-3" />
                        <span className="capitalize">{course.level}</span>
                      </div>
                      
                      {course.tuition_fee_max && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <DollarSign className="w-3 h-3" />
                          <span>${course.tuition_fee_max.toLocaleString()}/year</span>
                        </div>
                      )}
                      
                      {course.application_deadline && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-3 h-3" />
                          <span>Deadline: {course.application_deadline}</span>
                        </div>
                      )}
                      
                      {university?.qs_ranking && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Trophy className="w-3 h-3" />
                          <span>Ranked #{university.qs_ranking}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap mb-4">
                      {course.scholarship_available && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          Scholarship
                        </Badge>
                      )}
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {course.subject_area}
                      </Badge>
                    </div>

                    <Button
                      onClick={() => onCourseSelect?.(course)}
                      variant="outline"
                      className="w-full mt-auto text-alo-orange border-alo-orange hover:bg-orange-50"
                    >
                      View Details
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">No courses match your filters. Try adjusting your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}