import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, ExternalLink, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function EligibilityChecker({ studentProfile, courses, universities }) {
  const eligibleCourses = useMemo(() => {
    if (!studentProfile || !courses.length) return [];

    const results = [];
    const preferences = studentProfile.admission_preferences || {};
    const education = studentProfile.education_history?.[0] || {};
    const englishTest = studentProfile.english_proficiency || {};

    courses.forEach(course => {
      const university = universities.find(u => u.id === course.university_id);
      if (!university) return;

      let matchScore = 0;
      const matchReasons = [];
      const warnings = [];

      // Study level match
      if (preferences.study_level && course.level?.includes(preferences.study_level)) {
        matchScore += 30;
        matchReasons.push('Study level matches');
      }

      // Subject area match
      if (preferences.study_area && course.subject_area?.toLowerCase().includes(preferences.study_area.toLowerCase())) {
        matchScore += 25;
        matchReasons.push('Subject area matches');
      }

      // Country match
      if (preferences.study_destination && course.country?.toLowerCase().includes(preferences.study_destination.toLowerCase())) {
        matchScore += 20;
        matchReasons.push('Preferred country');
      }

      // English proficiency check
      if (course.ielts_required && englishTest.has_test) {
        if (englishTest.overall_score >= (course.ielts_overall || 6.0)) {
          matchScore += 15;
          matchReasons.push('IELTS requirement met');
        } else {
          warnings.push(`IELTS ${course.ielts_overall} required (you have ${englishTest.overall_score})`);
        }
      }

      // Budget consideration
      if (course.tuition_fee_max) {
        matchScore += 10;
        matchReasons.push('Tuition info available');
      }

      if (matchScore >= 40) {
        results.push({
          course,
          university,
          matchScore,
          matchReasons,
          warnings,
        });
      }
    });

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }, [studentProfile, courses, universities]);

  if (!studentProfile || eligibleCourses.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Your Eligible Programs
        </CardTitle>
        <p className="text-sm text-slate-600">
          Based on your profile, here are courses you qualify for
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {eligibleCourses.map((item, index) => (
          <motion.div
            key={item.course.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">
                  {item.course.course_title}
                </h4>
                <p className="text-sm text-slate-600 mb-2">
                  {item.university.university_name} • {item.course.country}
                </p>
              </div>
              <Badge className="bg-emerald-500 text-white">
                {item.matchScore}% Match
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {item.matchReasons.map((reason, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle className="w-3 h-3" />
                  {reason}
                </div>
              ))}
            </div>

            {item.warnings.length > 0 && (
              <div className="mb-3 space-y-1">
                {item.warnings.map((warning, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="w-3 h-3" />
                    {warning}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-600">
                <span className="font-semibold">Tuition:</span> ${item.course.tuition_fee_min?.toLocaleString()} - ${item.course.tuition_fee_max?.toLocaleString()}
              </div>
              {item.course.scholarship_available && (
                <Badge variant="outline" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Scholarship
                </Badge>
              )}
              <Link to={createPageUrl('CourseDetailsPage') + `?id=${item.course.id}`} className="ml-auto">
                <Button size="sm" variant="outline">
                  View Details
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}

        <Link to={createPageUrl('CourseMatcher')} className="block">
          <Button variant="outline" className="w-full">
            Find More Courses
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}