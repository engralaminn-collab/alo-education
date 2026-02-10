import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AICourseManager({ studentId, selectedCourseIds }) {
  const [categorization, setCategorization] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [conflicts, setConflicts] = useState(null);

  // Auto-categorize courses
  const categorize = useMutation({
    mutationFn: async ({ courseId, runAll }) => {
      const { data } = await base44.functions.invoke('autoCategorizeCourses', {
        course_id: courseId,
        run_for_all: runAll
      });
      return data;
    },
    onSuccess: (data) => {
      setCategorization(data);
      toast.success(`${data.categorized_count} courses categorized`);
    }
  });

  // Get course recommendations
  const recommend = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('recommendCoursesToStudent', {
        student_id: studentId
      });
      return data;
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast.success(`${data.total_recommended} courses recommended`);
    }
  });

  // Detect conflicts
  const detectConflicts = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('detectCourseConflicts', {
        student_id: studentId,
        course_ids: selectedCourseIds
      });
      return data;
    },
    onSuccess: (data) => {
      setConflicts(data);
      toast.success('Conflict analysis complete');
    }
  });

  return (
    <div className="space-y-6">
      {/* Course Categorization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            AI Course Categorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              AI automatically categorizes courses based on descriptions, prerequisites, and content analysis.
            </p>
            <Button
              onClick={() => categorize.mutate({ runAll: true })}
              disabled={categorize.isPending}
              className="bg-indigo-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {categorize.isPending ? 'Categorizing...' : 'Categorize All Courses'}
            </Button>

            {categorization && (
              <div className="mt-4 space-y-3">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="font-semibold text-indigo-900">
                    ✓ {categorization.categorized_count} courses categorized
                  </p>
                </div>

                {categorization.courses?.slice(0, 5).map((course, i) => (
                  <div key={i} className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">{course.course_title}</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500">{course.categories.primary_category}</Badge>
                        {course.categories.subcategories?.slice(0, 2).map((sub, j) => (
                          <Badge key={j} variant="outline">{sub}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600">
                        Difficulty: <strong>{course.categories.difficulty_level}</strong>
                      </p>
                      {course.categories.career_paths?.length > 0 && (
                        <p className="text-xs text-slate-500">
                          Careers: {course.categories.career_paths.slice(0, 3).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Recommendations */}
      {studentId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              AI Course Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                AI recommends courses based on student profile, goals, academic background, and past interactions.
              </p>
              <Button
                onClick={() => recommend.mutate()}
                disabled={recommend.isPending}
                className="bg-green-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {recommend.isPending ? 'Analyzing...' : 'Get Recommendations'}
              </Button>

              {recommendations && (
                <div className="mt-4 space-y-3">
                  {recommendations.recommendations?.slice(0, 5).map((rec, i) => (
                    <div key={i} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold">{rec.course_title}</h5>
                        <Badge className="bg-green-500">{rec.match_score}% match</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{rec.reasoning}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-medium text-slate-600">Career Fit:</p>
                          <p className="text-slate-700">{rec.career_alignment}</p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-600">Financial Fit:</p>
                          <p className="text-slate-700">{rec.financial_fit}</p>
                        </div>
                      </div>
                      {rec.concerns?.length > 0 && (
                        <div className="mt-2 bg-yellow-50 p-2 rounded">
                          <p className="text-xs font-medium text-yellow-800">Considerations:</p>
                          <ul className="text-xs text-yellow-700 space-y-1 mt-1">
                            {rec.concerns.map((concern, j) => (
                              <li key={j}>• {concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflict Detection */}
      {studentId && selectedCourseIds?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              AI Conflict Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                AI identifies conflicts, overlaps, and compatibility issues between selected courses.
              </p>
              <Button
                onClick={() => detectConflicts.mutate()}
                disabled={detectConflicts.isPending || !selectedCourseIds?.length}
                className="bg-orange-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {detectConflicts.isPending ? 'Analyzing...' : 'Check for Conflicts'}
              </Button>

              {conflicts?.analysis && (
                <div className="mt-4 space-y-4">
                  {/* Overall Assessment */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Overall Assessment:</p>
                    <p className="text-sm text-slate-700">{conflicts.analysis.overall_assessment}</p>
                  </div>

                  {/* Conflicts */}
                  {conflicts.analysis.conflicts?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-red-900 mb-2">⚠️ Conflicts Found</h5>
                      {conflicts.analysis.conflicts.map((conflict, i) => (
                        <div key={i} className={`border-l-4 p-3 rounded-r-lg mb-2 ${
                          conflict.severity === 'critical' ? 'border-red-500 bg-red-50' :
                          conflict.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                          'border-yellow-500 bg-yellow-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={conflict.severity === 'critical' ? 'destructive' : 'default'}>
                              {conflict.severity}
                            </Badge>
                            <span className="text-sm font-medium">{conflict.conflict_type}</span>
                          </div>
                          <p className="text-sm text-slate-700 mb-1">{conflict.description}</p>
                          <p className="text-xs text-slate-600">→ {conflict.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Overlaps */}
                  {conflicts.analysis.overlaps?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-orange-900 mb-2">📊 Content Overlaps</h5>
                      {conflicts.analysis.overlaps.map((overlap, i) => (
                        <div key={i} className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-2">
                          <p className="font-medium text-sm mb-1">
                            {overlap.overlap_percentage}% overlap
                          </p>
                          <p className="text-xs text-slate-600 mb-1">
                            Topics: {overlap.overlapping_topics?.join(', ')}
                          </p>
                          <p className="text-xs text-orange-800">→ {overlap.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Complementary Pairs */}
                  {conflicts.analysis.complementary_pairs?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-green-900 mb-2">✨ Complementary Courses</h5>
                      {conflicts.analysis.complementary_pairs.map((pair, i) => (
                        <div key={i} className="bg-green-50 border border-green-200 p-3 rounded-lg mb-2">
                          <p className="text-sm font-medium text-green-900 mb-1">
                            {pair.synergy_description}
                          </p>
                          <p className="text-xs text-green-700">{pair.combined_benefit}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommended Portfolio */}
                  {conflicts.analysis.recommended_portfolio?.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2">💡 Recommended Portfolio:</p>
                      <ul className="space-y-1">
                        {conflicts.analysis.recommended_portfolio.map((course, i) => (
                          <li key={i} className="text-sm text-blue-800 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}