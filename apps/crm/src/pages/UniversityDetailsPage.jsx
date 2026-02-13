import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, TrendingUp, Globe, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function UniversityDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const universityId = location.state?.universityId || new URLSearchParams(window.location.search).get('id');

  const { data: university, isLoading } = useQuery({
    queryKey: ['university-full-detail', universityId],
    queryFn: async () => {
      const unis = await base44.entities.University.list();
      return unis.find(u => u.id === universityId);
    },
    enabled: !!universityId
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['university-courses', universityId],
    queryFn: async () => {
      const cs = await base44.entities.Course.list();
      return cs.filter(c => c.university_id === universityId).slice(0, 6);
    },
    enabled: !!universityId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading university details...</p>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">University not found</p>
          <Button onClick={() => navigate(createPageUrl('Home'))}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-alo-orange hover:text-orange-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {university.cover_image && (
            <img 
              src={university.cover_image} 
              alt={university.university_name}
              className="w-full h-64 object-cover"
            />
          )}
          
          <div className="p-8">
            <div className="flex items-start gap-6 mb-6">
              {university.logo && (
                <img src={university.logo} alt={university.university_name} className="h-24 w-auto" />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{university.university_name}</h1>
                <div className="flex items-center gap-4 text-slate-600 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-5 h-5" />
                    {university.city}, {university.country}
                  </span>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {university.qs_ranking && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Star className="w-4 h-4 mr-1" />
                      QS Rank: #{university.qs_ranking}
                    </Badge>
                  )}
                  {university.acceptance_rate && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Acceptance: {university.acceptance_rate}%
                    </Badge>
                  )}
                  {university.student_population && (
                    <Badge className="bg-green-100 text-green-800">
                      {university.student_population.toLocaleString()} students
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {university.about && (
              <p className="text-slate-700 leading-relaxed text-lg">{university.about}</p>
            )}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {university.student_population && (
            <Card>
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm text-slate-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold">{university.student_population.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}

          {university.international_students_percent && (
            <Card>
              <CardContent className="p-6">
                <Globe className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-sm text-slate-600 mb-1">International Students</p>
                <p className="text-2xl font-bold">{university.international_students_percent}%</p>
              </CardContent>
            </Card>
          )}

          {university.acceptance_rate && (
            <Card>
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-slate-600 mb-1">Acceptance Rate</p>
                <p className="text-2xl font-bold">{university.acceptance_rate}%</p>
              </CardContent>
            </Card>
          )}

          {university.student_satisfaction_score && (
            <Card>
              <CardContent className="p-6">
                <Star className="w-8 h-8 text-orange-600 mb-2" />
                <p className="text-sm text-slate-600 mb-1">Student Satisfaction</p>
                <p className="text-2xl font-bold">{university.student_satisfaction_score}/100</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Featured Courses */}
        {courses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Featured Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <Card 
                  key={course.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(createPageUrl('CourseDetails') + `?id=${course.id}`)}
                >
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 hover:text-alo-orange transition-colors">
                      {course.course_title}
                    </h3>
                    <div className="space-y-3">
                      <Badge variant="outline">{course.level}</Badge>
                      <p className="text-sm text-slate-600">{course.subject_area}</p>
                      {course.tuition_fee_min && (
                        <p className="font-bold text-green-600">
                          ${course.tuition_fee_min.toLocaleString()}/year
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Card className="bg-gradient-to-r from-alo-orange to-orange-600">
          <CardContent className="p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Interested in studying here?</h2>
            <p className="mb-4">Our counselors can help guide you through the application process</p>
            <Button 
              className="bg-white text-alo-orange hover:bg-slate-100 font-bold"
              onClick={() => navigate(createPageUrl('Contact'))}
            >
              Book Free Counselling
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}