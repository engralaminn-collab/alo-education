import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Star, TrendingUp, DollarSign, MapPin, Award, 
  BookOpen, Target, Sparkles, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopMatches({ studentProfile }) {
  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['all-universities'],
    queryFn: () => base44.entities.University.filter({ status: 'active' }),
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => base44.entities.Scholarship.filter({ status: 'active' }),
  });

  // Create university map for quick lookup
  const universityMap = useMemo(() => {
    const map = {};
    universities.forEach(uni => map[uni.id] = uni);
    return map;
  }, [universities]);

  // Calculate match score for a course
  const calculateMatchScore = (course) => {
    let score = 0;
    let reasons = [];

    const university = universityMap[course.university_id];
    if (!university) return { score: 0, reasons: [] };

    // 1. Academic Performance Match (30 points)
    if (studentProfile?.english_proficiency?.overall_score && course.ielts_overall) {
      const ieltsScore = studentProfile.english_proficiency.overall_score;
      if (ieltsScore >= course.ielts_overall) {
        score += 30;
        reasons.push(`✓ Meets IELTS requirement (${course.ielts_overall})`);
      } else if (ieltsScore >= course.ielts_overall - 0.5) {
        score += 20;
        reasons.push(`Close to IELTS requirement (${course.ielts_overall})`);
      }
    }

    // Check education level match
    if (studentProfile?.admission_preferences?.study_level === course.level) {
      score += 10;
      reasons.push(`✓ Matches preferred study level (${course.level})`);
    }

    // 2. Field of Study Match (25 points)
    const preferredField = studentProfile?.admission_preferences?.study_area?.toLowerCase();
    const courseSubject = course.subject_area?.toLowerCase();
    const courseTitle = course.course_title?.toLowerCase();

    if (preferredField && (courseSubject?.includes(preferredField) || courseTitle?.includes(preferredField))) {
      score += 25;
      reasons.push(`✓ Perfect field match: ${course.subject_area}`);
    } else if (preferredField && courseSubject) {
      // Partial match
      const fieldKeywords = preferredField.split(' ');
      if (fieldKeywords.some(keyword => courseSubject.includes(keyword) || courseTitle?.includes(keyword))) {
        score += 15;
        reasons.push(`Related to ${studentProfile.admission_preferences.study_area}`);
      }
    }

    // 3. Budget Match (20 points)
    const hasFunding = studentProfile?.funding_information?.funding_status;
    const tuitionFee = course.tuition_fee_min || course.tuition_fee_max || 0;
    
    if (course.scholarship_available) {
      score += 10;
      reasons.push(`💰 Scholarship available`);
    }

    if (hasFunding === 'Scholarship' && course.scholarship_available) {
      score += 10;
      reasons.push(`✓ Matches scholarship preference`);
    } else if (hasFunding === 'Self-Funded' && tuitionFee > 0 && tuitionFee < 30000) {
      score += 10;
      reasons.push(`✓ Affordable tuition range`);
    }

    // 4. Location Match (15 points)
    const preferredDestination = studentProfile?.admission_preferences?.study_destination;
    const courseCountry = course.country || university.country;

    if (preferredDestination && courseCountry?.toLowerCase().includes(preferredDestination.toLowerCase())) {
      score += 15;
      reasons.push(`✓ Preferred destination: ${courseCountry}`);
    } else if (courseCountry) {
      score += 5;
    }

    // 5. University Quality (10 points)
    if (university.ranking && university.ranking <= 500) {
      score += 10;
      reasons.push(`⭐ Top ${university.ranking} ranked university`);
    } else if (university.qs_ranking && university.qs_ranking <= 500) {
      score += 8;
      reasons.push(`⭐ QS Ranked #${university.qs_ranking}`);
    }

    // Bonus: Featured courses
    if (course.is_featured) {
      score += 5;
      reasons.push(`✨ Featured course`);
    }

    // Bonus: International student friendly
    if (university.international_students_percent > 20) {
      score += 5;
      reasons.push(`🌍 ${university.international_students_percent}% international students`);
    }

    return { score, reasons, university };
  };

  // Get top matches
  const topMatches = useMemo(() => {
    if (!studentProfile || courses.length === 0) return [];

    const scoredCourses = courses
      .map(course => ({
        course,
        ...calculateMatchScore(course)
      }))
      .filter(match => match.score > 30) // Only show reasonable matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return scoredCourses;
  }, [courses, universities, studentProfile, scholarships]);

  if (!studentProfile || topMatches.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--alo-blue)' }}>
            <Target className="w-5 h-5" />
            Top Matches For You
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">
            Complete your profile to get personalized course recommendations!
          </p>
          <Link to={createPageUrl('MyProfile')}>
            <Button style={{ backgroundColor: 'var(--alo-orange)' }} className="text-white">
              Complete Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--alo-blue)' }}>
            <Target className="w-5 h-5" />
            Top Matches For You
          </CardTitle>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Based on your profile, preferences, and academic background
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topMatches.map((match, index) => (
            <motion.div
              key={match.course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 hover:shadow-md transition-all" style={{ borderColor: index === 0 ? 'var(--alo-orange)' : '#e5e7eb' }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Match Score Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge 
                          className="text-white font-semibold"
                          style={{ 
                            backgroundColor: match.score >= 80 ? '#10b981' : match.score >= 60 ? '#f59e0b' : '#3b82f6' 
                          }}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {match.score}% Match
                        </Badge>
                        {index === 0 && (
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Best Match
                          </Badge>
                        )}
                      </div>

                      {/* Course Info */}
                      <h3 className="font-bold text-slate-900 mb-1">
                        {match.course.course_title}
                      </h3>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        {match.university?.university_name}
                      </p>

                      {/* Quick Details */}
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {match.course.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {match.university?.city}, {match.university?.country}
                        </span>
                        {(match.course.tuition_fee_min || match.course.tuition_fee_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${match.course.tuition_fee_min?.toLocaleString() || match.course.tuition_fee_max?.toLocaleString()}
                          </span>
                        )}
                        {match.course.scholarship_available && (
                          <span className="flex items-center gap-1 text-amber-600 font-medium">
                            <Award className="w-3 h-3" />
                            Scholarship
                          </span>
                        )}
                      </div>

                      {/* Match Reasons */}
                      <div className="space-y-1">
                        {match.reasons.slice(0, 3).map((reason, i) => (
                          <p key={i} className="text-xs text-slate-600 flex items-start gap-1">
                            <span className="text-green-600 shrink-0">•</span>
                            {reason}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link to={createPageUrl('CourseDetailsPage') + `?id=${match.course.id}`}>
                      <Button 
                        size="sm"
                        className="shrink-0"
                        style={{ backgroundColor: 'var(--alo-blue)' }}
                      >
                        View
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* View More Button */}
          <Link to={createPageUrl('CourseMatcher')}>
            <Button variant="outline" className="w-full">
              View All Matches
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}