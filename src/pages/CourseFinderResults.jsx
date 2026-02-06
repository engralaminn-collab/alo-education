import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowRight, MapPin, DollarSign, Star, Search } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function CourseFinderResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const state = location.state || {};
  const { subject, level, country, intake, searchType, universityId } = state;

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-results'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-results'],
    queryFn: () => base44.entities.University.list()
  });

  const filteredResults = useMemo(() => {
    let results = courses;

    if (searchType === 'courses') {
      if (subject) results = results.filter(c => c.subject_area === subject);
      if (level) results = results.filter(c => c.level === level);
      if (country) results = results.filter(c => c.country === country);
      if (intake && intake.length > 0) {
        results = results.filter(c => intake.some(i => c.intake?.includes(i)));
      }
    } else if (searchType === 'universities') {
      if (universityId) {
        results = results.filter(c => c.university_id === universityId);
      }
      if (subject) {
        results = results.filter(c => c.subject_area === subject);
      }
    }

    if (searchTerm) {
      results = results.filter(c =>
        c.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        universities.find(u => u.id === c.university_id)?.university_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return results;
  }, [courses, universities, subject, level, country, intake, universityId, searchType, searchTerm]);

  const handleCourseClick = (course) => {
    navigate(createPageUrl('CourseDetails'), { state: { courseId: course.id } });
  };

  const handleUniversityClick = (universityId) => {
    navigate(createPageUrl('UniversityDetails'), { state: { universityId } });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {searchType === 'courses' ? 'Find Courses' : 'Find Universities'}
          </h1>
          <p className="text-slate-600">
            {filteredResults.length} results found
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search courses or universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12"
            />
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 text-lg mb-4">No courses found matching your criteria</p>
              <Button
                onClick={() => navigate(createPageUrl('Home'))}
                className="bg-alo-orange hover:bg-orange-600"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredResults.map(course => {
              const university = universities.find(u => u.id === course.university_id);
              const hasInterview = course.entry_requirements?.toLowerCase().includes('interview');

              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-4 gap-6 items-start">
                      <div className="md:col-span-2">
                        <button
                          onClick={() => handleCourseClick(course)}
                          className="text-lg font-bold text-alo-orange hover:underline mb-2 text-left"
                        >
                          {course.course_title}
                        </button>
                        <button
                          onClick={() => handleUniversityClick(university?.id)}
                          className="flex items-center gap-2 text-slate-600 hover:text-alo-orange transition-colors mb-3"
                        >
                          <MapPin className="w-4 h-4" />
                          {university?.university_name}
                        </button>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-blue-50">
                            {course.level}
                          </Badge>
                          {university?.qs_ranking && (
                            <Badge variant="outline" className="bg-purple-50">
                              <Star className="w-3 h-3 mr-1" />
                              QS #{university.qs_ranking}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {course.intake || 'Multiple Intakes'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {course.tuition_fee_min && (
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Tuition Fee</p>
                            <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                              <DollarSign className="w-5 h-5" />
                              {course.tuition_fee_min.toLocaleString()}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-slate-600 mb-1">Interview Required</p>
                          <Badge className={hasInterview ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                            {hasInterview ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <Button
                          onClick={() => handleCourseClick(course)}
                          className="w-full bg-alo-orange hover:bg-orange-600 text-white font-semibold"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}