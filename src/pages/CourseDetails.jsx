import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, DollarSign, Clock, Award } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function CourseDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const courseId = location.state?.courseId || new URLSearchParams(window.location.search).get('id');

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.list();
      return courses.find(c => c.id === courseId);
    },
    enabled: !!courseId
  });

  const { data: university } = useQuery({
    queryKey: ['university-detail', course?.university_id],
    queryFn: async () => {
      const unis = await base44.entities.University.list();
      return unis.find(u => u.id === course.university_id);
    },
    enabled: !!course?.university_id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading course details...</p>
      </div>
    );
  }

  if (!course || !university) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Course not found</p>
          <Button onClick={() => navigate(createPageUrl('Home'))}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const handleApplyNow = () => {
    navigate(createPageUrl('ApplicationForm'));
  };

  const intakeList = course.intake?.split(',').map(i => i.trim()) || [];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-alo-orange hover:text-orange-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-alo-orange to-orange-600 p-8 text-white">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{course.course_title}</h1>
                <div className="flex items-center gap-2 text-orange-100">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{university.university_name}</span>
                </div>
              </div>
              {university.logo && (
                <img src={university.logo} alt={university.university_name} className="h-16 w-auto" />
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <Badge className="bg-white text-orange-600 font-semibold">{course.level}</Badge>
              {course.scholarship_available && (
                <Badge className="bg-green-500 font-semibold">Scholarships Available</Badge>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Quick Facts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <DollarSign className="w-10 h-10 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-600">Tuition Fee</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${course.tuition_fee_min?.toLocaleString()} - ${course.tuition_fee_max?.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{course.currency || 'USD'} per year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Clock className="w-10 h-10 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Application Deadline</p>
                      <p className="text-2xl font-bold text-slate-900">{course.application_deadline || 'Rolling'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Clock className="w-10 h-10 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Course Duration</p>
                      <p className="text-2xl font-bold text-slate-900">{course.duration || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Award className="w-10 h-10 text-orange-600" />
                    <div>
                      <p className="text-sm text-slate-600">Subject Area</p>
                      <p className="text-2xl font-bold text-slate-900">{course.subject_area || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Overview */}
            {course.overview && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Course Overview</h2>
                <p className="text-slate-700 leading-relaxed">{course.overview}</p>
              </div>
            )}

            {/* Entry Requirements */}
            {course.entry_requirements && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Entry Requirements</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-slate-700 leading-relaxed">{course.entry_requirements}</p>
                </div>
              </div>
            )}

            {/* English Proficiency */}
            {course.ielts_overall && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">English Language Requirements</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-slate-600 mb-2">IELTS Overall</p>
                      <p className="text-3xl font-bold text-blue-600">{course.ielts_overall}</p>
                    </CardContent>
                  </Card>
                  {course.ielts_min_each && (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-sm text-slate-600 mb-2">Minimum in Each Band</p>
                        <p className="text-3xl font-bold text-blue-600">{course.ielts_min_each}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Available Intakes */}
            {intakeList.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Intakes</h2>
                <div className="flex flex-wrap gap-3">
                  {intakeList.map(intake => (
                    <Badge key={intake} className="bg-purple-100 text-purple-800 text-base px-4 py-2">
                      {intake}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Scholarships */}
            {course.scholarship_available && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-green-900 mb-2">Scholarships Available</h3>
                    <p className="text-green-800">This course offers scholarship opportunities. Contact our counselors for more details.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <Button
              onClick={handleApplyNow}
              className="w-full h-14 bg-alo-orange hover:bg-orange-600 text-white text-lg font-bold"
            >
              Apply Now
              <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </Button>
          </div>
        </div>

        {/* University Info */}
        <Card>
          <CardHeader>
            <CardTitle>About {university.university_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">{university.about}</p>
            {university.website_url && (
              <Button
                variant="outline"
                onClick={() => window.open(university.website_url, '_blank')}
                className="border-alo-orange text-alo-orange hover:bg-orange-50"
              >
                Visit University Website
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}