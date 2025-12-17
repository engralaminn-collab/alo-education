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
import ApplyModal from '@/components/courses/ApplyModal';

export default function CourseDetailsPage() {
  const [showApplyModal, setShowApplyModal] = React.useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

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
      {/* Hero */}
      <section style={{ background: 'var(--alo-blue)' }} className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <Badge style={{ backgroundColor: 'var(--alo-orange)', color: 'white' }}>
                {course.level}
              </Badge>
              <FavoriteButton courseId={course.id} size="sm" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {course.course_title}
            </h1>
            {university && (
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>{university.university_name || university.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{course.country}{university.city ? `, ${university.city}` : ''}</span>
                </div>
              </div>
            )}
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
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="english">English Tests</TabsTrigger>
                <TabsTrigger value="fees">Fees & Intakes</TabsTrigger>
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
                        <div className="text-slate-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: course.overview }} />
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

                    {course.modules && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">Course Modules</h4>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: course.modules }} />
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
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Academic Requirements</h4>
                        {course.entry_requirements ? (
                          <div className="prose prose-slate max-w-none">
                            <div className="text-slate-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: course.entry_requirements }} />
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">Academic requirements information not available</p>
                        )}
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">English Language Requirements</h4>
                        <div className="space-y-2">
                          {course.ielts_overall && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-slate-700">IELTS: {course.ielts_overall} overall{course.ielts_min_each && ` (min ${course.ielts_min_each} each)`}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-slate-700">PTE, TOEFL, Duolingo equivalents accepted</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-slate-700">Medium of Instruction (MOI) may be accepted</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">Documents Required</h4>
                        <ul className="space-y-1 text-sm text-slate-700">
                          <li>• Academic transcripts & certificates</li>
                          <li>• English test scores (IELTS/PTE/TOEFL/Duolingo/MOI)</li>
                          <li>• Passport copy</li>
                          <li>• Statement of Purpose (SOP)</li>
                          <li>• Letters of Recommendation (if required)</li>
                          <li>• CV/Resume</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="english">
                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      English Language Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {course.ielts_overall && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-3">IELTS</h4>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-700">Overall Score Required:</span>
                            <span className="text-2xl font-bold" style={{ color: '#0066CC' }}>
                              {course.ielts_overall}
                            </span>
                          </div>
                          {course.ielts_min_each && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-700">Minimum Each Band:</span>
                              <span className="text-xl font-bold text-slate-900">
                                {course.ielts_min_each}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-2">PTE Academic</h4>
                          <p className="text-sm text-slate-600">Equivalent scores accepted</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-2">TOEFL</h4>
                          <p className="text-sm text-slate-600">Equivalent scores accepted</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-2">Duolingo</h4>
                          <p className="text-sm text-slate-600">Accepted as alternative</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-2">MOI (Medium of Instruction)</h4>
                          <p className="text-sm text-green-700 font-medium">May be accepted - contact us</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-2">OIETC</h4>
                          <p className="text-sm text-slate-600">Accepted for select universities</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-2">LanguageCert</h4>
                          <p className="text-sm text-slate-600">International ESOL accepted</p>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <strong>Note:</strong> English test scores are typically valid for 2 years from the test date. Contact ALO Education for MOI eligibility assessment.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fees">
                <Card className="alo-card">
                  <CardHeader>
                    <CardTitle className="alo-card-title flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Fees & Intakes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">Tuition Fee</h4>
                        <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                          {course.tuition_fee_min && course.tuition_fee_max
                            ? `${course.tuition_fee_min.toLocaleString()} - ${course.tuition_fee_max.toLocaleString()}`
                            : course.tuition_fee_min
                            ? course.tuition_fee_min.toLocaleString()
                            : 'Contact us'
                          }
                        </p>
                        <p className="text-sm text-slate-600">{course.currency || 'USD'} per year</p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">Application Fee</h4>
                        <p className="text-3xl font-bold text-slate-900">
                          {course.application_fee || '0'}
                        </p>
                        <p className="text-sm text-slate-600">{course.currency || 'USD'}</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">Duration</h4>
                        <p className="text-2xl font-bold" style={{ color: '#F37021' }}>
                          {course.duration || 'Contact us'}
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">Intakes</h4>
                        <p className="text-2xl font-bold text-green-700">
                          {course.intake || 'Contact us'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
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

                  {course.intake && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <p className="text-sm text-slate-500">Intake</p>
                        <p className="font-semibold text-slate-900">{course.intake}</p>
                      </div>
                    </div>
                  )}

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

              <Card style={{ backgroundColor: 'var(--alo-blue)' }} className="text-white border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-3">Ready to Apply?</h3>
                  <p className="text-white/90 mb-4">
                    Submit your application now or talk to our counselors
                  </p>
                  <div className="space-y-3">
                    <Button 
                      className="w-full font-bold"
                      style={{ backgroundColor: '#F37021', color: '#000000' }}
                      onClick={() => setShowApplyModal(true)}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      className="w-full"
                      style={{ backgroundColor: '#25D366', color: 'white' }}
                      onClick={() => {
                        const message = `Hi ALO Education, I'm interested in ${course.course_title}. Please guide me.`;
                        window.open(`https://wa.me/8801805020101?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      Chat on WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>

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

        <SimilarCourses 
          currentCourse={course}
          allCourses={allCourses}
          universities={universities}
        />
      </div>

      <ApplyModal 
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        course={course}
        university={university}
      />

      <Footer />
    </div>
  );
}