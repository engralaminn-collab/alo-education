import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, MapPin, Clock, DollarSign, BookOpen, 
  FileText, Award, Globe, Calendar, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';
import AIApplicationAssistant from '@/components/applications/AIApplicationAssistant';
import SimilarCourses from '@/components/courses/SimilarCourses';
import WhyThisCourse from '@/components/courses/WhyThisCourse';
import FavoriteButton from '@/components/courses/FavoriteButton';
import { GitCompare, Bell } from 'lucide-react';
import CompareModal from '@/components/comparison/CompareModal';

export default function CourseDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [showCompareModal, setShowCompareModal] = React.useState(false);
  const [selectedForCompare, setSelectedForCompare] = React.useState([]);

  const { data: course, isLoading } = useQuery({
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

  // Set page title for SEO
  React.useEffect(() => {
    if (course && university) {
      document.title = `${course.course_title} - ${university.university_name || university.name} | ALO Education`;
    }
  }, [course, university]);

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-similar'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses-for-similar'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: user } = useQuery({
    queryKey: ['current-user-course-details'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-course', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course not found</h2>
          <Link to={createPageUrl('CourseFinder')}>
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section - SEO Enabled */}
      <section style={{ background: 'var(--alo-blue)' }} className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* University Logo */}
            {university?.logo && (
              <div className="mb-6">
                <img src={university.logo} alt={university.university_name} className="h-16 w-auto bg-white rounded-lg p-2" />
              </div>
            )}

            {/* Course Name (H1) */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {course.course_title}
            </h1>

            {/* Campus City & Location */}
            {university && (
              <Link to={createPageUrl('UniversityDetailsPage') + `?id=${university.id}`} className="hover:underline">
                <p className="text-xl text-white/90 mb-2">
                  {university.university_name || university.name}
                  {university.city && ` - ${university.city}`}
                </p>
              </Link>
            )}

            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>
                  {university?.city && `${university.city} | `}
                  {course.country}
                </span>
              </div>

              {/* National/World Ranking */}
              {(university?.ranking || university?.qs_ranking) && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>World Rank: #{university.ranking || university.qs_ranking}</span>
                </div>
              )}

              {/* University Website */}
              {university?.website_url && (
                <a href={university.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  University Website
                </a>
              )}
            </div>

            {/* Feedback Link & Last Updated */}
            <div className="flex items-center gap-6 text-xs text-white/60">
              <Link to={createPageUrl('Contact')} className="hover:underline">
                Report an Issue / Feedback
              </Link>
              <span>Last Updated: {new Date(course.updated_date || course.created_date).toLocaleDateString()}</span>
            </div>

            {/* Level Badge & Favorite */}
            <div className="flex items-center gap-3 mt-4">
              <Badge style={{ backgroundColor: 'var(--alo-orange)', color: 'white' }} className="text-sm px-4 py-1">
                {course.level}
              </Badge>
              <FavoriteButton courseId={course.id} size="sm" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Why This Course AI Section */}
            {studentProfile && (
              <WhyThisCourse 
                course={course}
                university={university}
                studentProfile={studentProfile}
              />
            )}

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Entry Requirements</TabsTrigger>
                <TabsTrigger value="ielts">IELTS Requirements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {studentProfile && (
                  <div className="mb-6">
                    <AIApplicationAssistant 
                      studentProfile={studentProfile}
                      universityId={course.university_id}
                      courseId={courseId}
                    />
                  </div>
                )}

                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Course Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate max-w-none">
                      {course.overview ? (
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {course.overview}
                        </p>
                      ) : (
                        <p className="text-slate-500 italic">No overview available</p>
                      )}
                    </div>

                    {course.subject_area && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">Subject Area</h4>
                        <p className="text-slate-700">{course.subject_area}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements">
                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Entry Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.entry_requirements ? (
                      <div className="prose prose-slate max-w-none">
                        <div 
                          className="text-slate-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: course.entry_requirements.replace(/\n/g, '<br/>') }}
                        />
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">Entry requirements information not available</p>
                    )}

                    {/* Pathway Section */}
                    {course.pathway_info && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold text-slate-900 mb-3">Pathway Programs Available</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div 
                            className="text-slate-700 text-sm"
                            dangerouslySetInnerHTML={{ __html: course.pathway_info.replace(/\n/g, '<br/>') }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ielts">
                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Test Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* English Tests */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-4">English Language Tests</h4>

                      {course.ielts_required ? (
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-600 mb-3">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">IELTS</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {course.ielts_overall && (
                                <div>
                                  <p className="text-sm text-slate-500">Overall Score</p>
                                  <p className="text-xl font-bold" style={{ color: 'var(--alo-blue)' }}>
                                    {course.ielts_overall}
                                  </p>
                                </div>
                              )}

                              {course.ielts_min_each && (
                                <div>
                                  <p className="text-sm text-slate-500">Minimum Each Band</p>
                                  <p className="text-xl font-bold text-slate-900">
                                    {course.ielts_min_each}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                              Other accepted tests: TOEFL, PTE, Duolingo English Test. Contact us for specific score requirements.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-slate-50 rounded-lg">
                          <Globe className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm">English test requirements not specified</p>
                        </div>
                      )}
                    </div>

                    {/* Standardized Tests (if any) */}
                    {course.standardized_tests && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Standardized Tests</h4>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-slate-700 whitespace-pre-line">{course.standardized_tests}</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> Test scores are typically valid for 2 years from the test date. Requirements may vary - verify with the university.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* Quick Facts */}
              <Card className="alo-card">
                <CardHeader>
                  <CardTitle className="alo-card-title">Quick Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <p className="text-sm text-slate-500">Duration</p>
                        <p className="font-semibold text-slate-900">{course.duration}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                    <div>
                      <p className="text-sm text-slate-500">Intake</p>
                      <p className="font-semibold text-slate-900">{course.intake || 'January, September'}</p>
                    </div>
                  </div>

                  {(course.tuition_fee_min || course.tuition_fee_max) && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <p className="text-sm text-slate-500">Tuition Fee</p>
                        <p className="font-semibold text-slate-900">
                          {course.tuition_fee_min && course.tuition_fee_max
                            ? `${course.tuition_fee_min.toLocaleString()} - ${course.tuition_fee_max.toLocaleString()}`
                            : course.tuition_fee_min
                            ? `From ${course.tuition_fee_min.toLocaleString()}`
                            : `Up to ${course.tuition_fee_max.toLocaleString()}`
                          } {course.currency || 'USD'}
                        </p>
                      </div>
                    </div>
                  )}

                  {course.scholarship_available && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <Award className="w-5 h-5" />
                        <span className="font-semibold">Scholarships Available</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fixed CTA Buttons */}
              <div className="space-y-3 sticky top-6">
                <Link to={createPageUrl('ApplicationForm')}>
                  <Button 
                    className="w-full font-bold text-lg py-6"
                    style={{ backgroundColor: 'var(--alo-orange)', color: '#000000' }}
                  >
                    APPLY NOW
                  </Button>
                </Link>

                <Link to={createPageUrl('Contact')}>
                  <Button 
                    variant="outline" 
                    className="w-full font-semibold py-6"
                    style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}
                  >
                    Request Counselling
                  </Button>
                </Link>

                <FavoriteButton courseId={course.id} />

                <Button
                  variant="outline"
                  className="w-full font-semibold py-6"
                  style={{ borderColor: '#F37021', color: '#F37021' }}
                  onClick={() => {
                    setSelectedForCompare([course]);
                    setShowCompareModal(true);
                  }}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Add to Compare
                </Button>

                {course.application_deadline && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <Bell className="w-5 h-5 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-red-900">Application Deadline</p>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      {course.application_deadline}
                    </p>
                  </div>
                )}

                <div className="bg-slate-100 rounded-lg p-4 text-center text-xs text-slate-600">
                  <p className="mb-2">
                    <strong>Note:</strong> "Apply Now" requires portal registration and complete Form B submission.
                  </p>
                  <p>
                    Counselling booking and enquiry forms use the same public entry (Form A).
                  </p>
                </div>
                </div>

                <CompareModal
                items={selectedForCompare}
                type="course"
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                universities={[university]}
                />

              {/* University Link */}
              {university && (
                <Link to={createPageUrl('UniversityDetailsPage') + `?id=${university.id}`}>
                  <Card className="alo-card hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-500 mb-1">Offered by</p>
                      <p className="font-semibold" style={{ color: 'var(--alo-blue)' }}>
                        {university.university_name || university.name}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">View university details →</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Similar Courses */}
        <div className="container mx-auto px-6 pb-16">
          <SimilarCourses 
            currentCourse={course}
            allCourses={allCourses}
            universities={universities}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}