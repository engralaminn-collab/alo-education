import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Globe, DollarSign, FileText, Calendar,
  TrendingUp, ArrowRight, Home
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

export default function CourseFinderResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchState = location.state || {};

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const filteredResults = useMemo(() => {
    let results = [];

    if (searchState.searchType === 'courses') {
      results = courses.filter((course) => {
        const matchSubject = !searchState.subject || course.subject_area === searchState.subject;
        const matchLevel = !searchState.studyLevel || course.level.toLowerCase() === searchState.studyLevel;
        const matchCountry = !searchState.country || universities.find(u => u.id === course.university_id)?.country === searchState.country;
        const matchIntakes = !searchState.intakes?.length || 
          searchState.intakes.some(intake => course.intake?.includes(intake.split('-')[1]));

        return matchSubject && matchLevel && matchCountry && matchIntakes;
      });
    } else if (searchState.searchType === 'universities') {
      const selectedUni = universities.find(u => u.id === searchState.universityName);
      
      results = courses.filter((course) => {
        const matchSubject = !searchState.subject || course.subject_area === searchState.subject;
        const matchUni = !searchState.universityName || course.university_id === searchState.universityName;
        
        return matchSubject && matchUni;
      });
    }

    return results.map((course) => {
      const university = universities.find(u => u.id === course.university_id);
      return { course, university };
    });
  }, [courses, universities, searchState]);

  const handleCourseClick = (courseId) => {
    navigate(createPageUrl('CourseDetails'), { state: { courseId } });
  };

  const handleUniversityClick = (universityId) => {
    navigate(createPageUrl('UniversityDetails'), { state: { universityId } });
  };

  const handleApplyNow = (courseId) => {
    navigate(createPageUrl('ApplicationForm'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-education-blue to-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl('Home'))}
              className="text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">Course Search Results</h1>
          <p className="text-blue-100">
            Found {filteredResults.length} {filteredResults.length === 1 ? 'course' : 'courses'} matching your criteria
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        {filteredResults.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-600 text-lg mb-4">No courses found matching your criteria.</p>
              <Button
                onClick={() => navigate(-1)}
                className="bg-education-blue hover:bg-blue-700"
              >
                Refine Your Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredResults.map(({ course, university }) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div>
                      <div
                        onClick={() => handleCourseClick(course.id)}
                        className="cursor-pointer hover:text-education-blue transition-colors mb-2"
                      >
                        <h3 className="text-2xl font-bold text-slate-900">
                          {course.course_title}
                        </h3>
                      </div>

                      {university && (
                        <div
                          onClick={() => handleUniversityClick(university.id)}
                          className="cursor-pointer hover:text-education-blue transition-colors mb-4"
                        >
                          <p className="text-lg font-semibold text-education-blue">
                            {university.university_name}
                          </p>
                          <p className="text-slate-600">{university.country}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="outline">{course.subject_area}</Badge>
                        {course.scholarship_available && (
                          <Badge className="bg-green-100 text-green-800">
                            Scholarship Available
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Tuition Fee */}
                        {course.tuition_fee_min && (
                          <div className="flex items-start gap-3">
                            <DollarSign className="w-5 h-5 text-education-blue mt-1 shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">Tuition Fee</p>
                              <p className="font-semibold text-slate-900">
                                ${course.tuition_fee_min.toLocaleString()}
                                {course.tuition_fee_max && ` - $${course.tuition_fee_max.toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Intake */}
                        {course.intake && (
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-education-blue mt-1 shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">Intake</p>
                              <p className="font-semibold text-slate-900">{course.intake}</p>
                            </div>
                          </div>
                        )}

                        {/* Ranking */}
                        {university?.qs_ranking && (
                          <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-education-blue mt-1 shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">QS Ranking</p>
                              <p className="font-semibold text-slate-900">#{university.qs_ranking}</p>
                            </div>
                          </div>
                        )}

                        {/* IELTS */}
                        {course.ielts_overall && (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-education-blue mt-1 shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">IELTS</p>
                              <p className="font-semibold text-slate-900">{course.ielts_overall}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Apply Button */}
                      <Button
                        onClick={() => handleApplyNow(course.id)}
                        className="w-full h-11 bg-alo-orange hover:bg-orange-600 text-white font-bold"
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}