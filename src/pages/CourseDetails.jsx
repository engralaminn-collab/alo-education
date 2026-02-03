import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, DollarSign, Award, Calendar, Building2, 
  GraduationCap, Globe, BookOpen, ArrowRight, CheckCircle,
  MapPin, Users, Star, GitCompare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import CompareUniversities from '@/components/universities/CompareUniversities';
import { toast } from 'sonner';

export default function CourseDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [selectedForComparison, setSelectedForComparison] = useState([]);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: university } = useQuery({
    queryKey: ['university', course?.university_id],
    queryFn: async () => {
      const unis = await base44.entities.University.filter({ id: course.university_id });
      return unis[0];
    },
    enabled: !!course?.university_id,
  });

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-96 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course not found</h2>
          <Link to={createPageUrl('Courses')}>
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-emerald-500 text-white capitalize">
                {course.level}
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 capitalize">
                {course.subject_area?.replace(/_/g, ' ')}
              </Badge>
              {course.scholarship_available && (
                <Badge className="bg-amber-500 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  Scholarship Available
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {course.course_title}
            </h1>
            
            {university && (
              <div className="flex items-center gap-3 text-white/80 mb-6">
                <Building2 className="w-5 h-5" />
                <span className="text-lg">{university.university_name}</span>
                <span className="mx-2">•</span>
                <MapPin className="w-5 h-5" />
                <span>{university.city}, {university.country}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6 text-white/80">
              {course.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
              )}
              {(course.tuition_fee_min || course.tuition_fee_max) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>
                    {course.tuition_fee_min && course.tuition_fee_max 
                      ? `${course.tuition_fee_min.toLocaleString()}-${course.tuition_fee_max.toLocaleString()}`
                      : (course.tuition_fee_min || course.tuition_fee_max).toLocaleString()
                    } {course.currency || 'USD'}/year
                  </span>
                </div>
              )}
              {university?.ranking && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>World Rank #{university.ranking}</span>
                </div>
              )}
            </div>

            {university && (
              <Button
                onClick={() => {
                  if (selectedForComparison.find(u => u.id === university.id)) {
                    setSelectedForComparison(selectedForComparison.filter(u => u.id !== university.id));
                  } else {
                    if (selectedForComparison.length >= 4) {
                      toast.error('Maximum 4 universities for comparison');
                      return;
                    }
                    setSelectedForComparison([...selectedForComparison, university]);
                  }
                }}
                variant="outline"
                className="mt-6 border-white/30 text-white hover:bg-white/10"
              >
                <GitCompare className="w-4 h-4 mr-2" />
                {selectedForComparison.find(u => u.id === university.id) ? 'Remove from Compare' : 'Add to Compare'}
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Program Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {course.overview || `This ${course.level}'s program in ${course.subject_area?.replace(/_/g, ' ')} at ${university?.university_name || 'the university'} offers a comprehensive curriculum designed to prepare students for successful careers in their chosen field.`}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Entry Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {course.entry_requirements ? (
                  <div className="text-slate-600 leading-relaxed">
                    <p>{course.entry_requirements}</p>
                    {course.ielts_required && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          English Language Requirements
                        </h4>
                        <p className="text-sm text-slate-600">
                          IELTS Overall: {course.ielts_overall || 'N/A'}
                          {course.ielts_min_each && ` (min ${course.ielts_min_each} in each band)`}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-600">Contact the university for detailed entry requirements</p>
                )}
              </CardContent>
            </Card>

            {/* University Info */}
            {university && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>About {university.university_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {university.about || `${university.university_name} is located in ${university.city}, ${university.country}.`}
                  </p>
                  <Link to={createPageUrl('UniversityDetails') + `?id=${university.id}`}>
                    <Button variant="outline">
                      View University Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Facts */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Key Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium">{course.duration || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Tuition Fee</span>
                  <span className="font-medium">
                    {course.tuition_fee_min && course.tuition_fee_max
                      ? `${course.currency || 'USD'} ${course.tuition_fee_min.toLocaleString()}-${course.tuition_fee_max.toLocaleString()}/year`
                      : 'Contact for fees'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Degree Level</span>
                  <span className="font-medium capitalize">{course.level}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Field</span>
                  <span className="font-medium capitalize">{course.subject_area?.replace(/_/g, ' ')}</span>
                </div>
                {course.intake && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500">Next Intake</span>
                    <span className="font-medium">{course.intake}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Apply CTA */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
              <CardContent className="p-6 text-center">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Interested in this course?</h3>
                <p className="text-white/80 mb-6 text-sm">
                  Check your eligibility and get personalized guidance
                </p>
                <div className="space-y-3">
                  <Link to={createPageUrl('CourseMatcher')} className="block">
                    <Button className="w-full bg-white text-emerald-600 hover:bg-slate-100">
                      Check Eligibility
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Contact') + `?course=${course.id}`} className="block">
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                      Get Expert Advice
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Scholarship Info */}
            {course.scholarship_available && (
              <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Scholarships Available</h4>
                      <p className="text-sm text-slate-600">
                        This program offers scholarship opportunities. Contact us to learn more about eligibility and application process.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <CompareUniversities
        selectedUniversities={selectedForComparison}
        onRemove={(id) => setSelectedForComparison(selectedForComparison.filter(u => u.id !== id))}
        onClear={() => setSelectedForComparison([])}
      />
    </div>
  );
}