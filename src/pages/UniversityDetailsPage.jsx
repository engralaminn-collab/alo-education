import React from 'react';
<<<<<<< HEAD
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, MapPin, Globe, Award, FileText, 
  BookOpen, ExternalLink, Calendar, Users, Star,
  DollarSign, CheckCircle, Briefcase, TrendingUp, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';
import UniversityFavoriteButton from '@/components/universities/UniversityFavoriteButton';
import { GitCompare, Bell } from 'lucide-react';
import CompareModal from '@/components/comparison/CompareModal';
import AIUniversitySummary from '@/components/universities/AIUniversitySummary';
import PopularCourses from '@/components/universities/PopularCourses';
import StudentReviews from '@/components/universities/StudentReviews';
import UniversityComparison from '@/components/universities/UniversityComparison';
import AIApplicationAssistant from '@/components/applications/AIApplicationAssistant';

export default function UniversityDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const universityId = urlParams.get('id');
  const [showCompareModal, setShowCompareModal] = React.useState(false);
  const [selectedForCompare, setSelectedForCompare] = React.useState([]);
  const [showComparison, setShowComparison] = React.useState(false);
  const [compareIds, setCompareIds] = React.useState([]);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: university, isLoading } = useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      const unis = await base44.entities.University.filter({ id: universityId });
      return unis[0];
    },
    enabled: !!universityId,
  });

  // Generate default next intake if not specified
  const nextIntake = university?.intakes || 'January, September';

  const { data: courses = [] } = useQuery({
    queryKey: ['university-courses', universityId],
    queryFn: () => base44.entities.Course.filter({ university_id: universityId, status: 'open' }),
    enabled: !!universityId,
=======
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
>>>>>>> last/main
  });

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading university details...</p>
        </div>
=======
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading university details...</p>
>>>>>>> last/main
      </div>
    );
  }

  if (!university) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">University not found</h2>
          <Link to={createPageUrl('Universities')}>
            <Button>Browse Universities</Button>
          </Link>
=======
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">University not found</p>
          <Button onClick={() => navigate(createPageUrl('Home'))}>Back to Home</Button>
>>>>>>> last/main
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative h-80 overflow-hidden">
        <img
          src={university.cover_image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200'}
          alt={university.university_name || university.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11, 94, 215, 0.9), rgba(11, 94, 215, 0.6))' }} />
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-8">
            <div className="flex items-start gap-6">
              {university.logo && (
                <img
                  src={university.logo}
                  alt="Logo"
                  className="w-20 h-20 bg-white rounded-xl p-2 shadow-lg"
                />
              )}
              <div className="flex-1 text-white">
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {university.university_name || university.name}
                  </h1>
                  <UniversityFavoriteButton universityId={university.id} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{university.city}, {university.country}</span>
                  </div>
                  {university.ranking && (
                    <Badge className="bg-white/20 text-white border-0">
                      <Star className="w-4 h-4 mr-1" />
                      World Ranking #{university.ranking}
=======
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
>>>>>>> last/main
                    </Badge>
                  )}
                </div>
              </div>
            </div>
<<<<<<< HEAD
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start mb-6 flex-wrap">
                <TabsTrigger value="about">Overview</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="why">Why Choose</TabsTrigger>
                <TabsTrigger value="courses">Popular Courses</TabsTrigger>
                <TabsTrigger value="requirements">Entry Requirements</TabsTrigger>
                <TabsTrigger value="fees">Tuition Fees</TabsTrigger>
                <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
                <TabsTrigger value="career">Career Opportunities</TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <div className="space-y-6">
                  <AIUniversitySummary university={university} />
                  
                  <Card className="border-2" style={{ borderColor: '#0066CC' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
                        <GraduationCap className="w-5 h-5" />
                        University Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {university.about ? (
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {university.about}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">
                          {university.university_name} is a prestigious institution offering world-class education to international students. 
                          The university is known for its excellent academic programs, research opportunities, and supportive environment for international students.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <StudentReviews university={university} />

                  {studentProfile && (
                    <AIApplicationAssistant 
                      studentProfile={studentProfile}
                      universityId={universityId}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="location">
                <Card className="border-2" style={{ borderColor: '#0066CC' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
                      <MapPin className="w-5 h-5" />
                      Location & City Advantage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <MapPin className="w-8 h-8" style={{ color: '#0066CC' }} />
                      <div>
                        <p className="font-semibold text-slate-900">{university.city}, {university.country}</p>
                        <p className="text-sm text-slate-600">University Location</p>
                      </div>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <h3 className="font-bold text-lg mb-3" style={{ color: '#0066CC' }}>City Advantages</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                          <span className="text-slate-700">Vibrant student community with diverse cultural experiences</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                          <span className="text-slate-700">Excellent public transportation and connectivity</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                          <span className="text-slate-700">Rich employment opportunities for graduates</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                          <span className="text-slate-700">Safe and welcoming environment for international students</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="why">
                <Card className="border-2" style={{ borderColor: '#0066CC' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
                      <Star className="w-5 h-5" />
                      Why Choose This University
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <Award className="w-6 h-6 flex-shrink-0" style={{ color: '#F37021' }} />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Academic Excellence</h4>
                          <p className="text-sm text-slate-600">Globally recognized degrees with high academic standards</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <Globe className="w-6 h-6 flex-shrink-0" style={{ color: '#F37021' }} />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">International Community</h4>
                          <p className="text-sm text-slate-600">Diverse student body from over 100 countries</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <Briefcase className="w-6 h-6 flex-shrink-0" style={{ color: '#F37021' }} />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Career Support</h4>
                          <p className="text-sm text-slate-600">Excellent placement services and industry connections</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <BookOpen className="w-6 h-6 flex-shrink-0" style={{ color: '#F37021' }} />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Research Opportunities</h4>
                          <p className="text-sm text-slate-600">World-class research facilities and funding</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements">
                <Card className="border-2" style={{ borderColor: '#0066CC' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
                      <FileText className="w-5 h-5" />
                      Entry Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-4" style={{ color: '#0066CC' }}>Academic Requirements</h3>
                      {university.entry_requirements_summary ? (
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {university.entry_requirements_summary}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-semibold text-slate-900 mb-2">Undergraduate Programs</h4>
                            <ul className="space-y-2 text-slate-700">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                                <span>HSC/A-Level or equivalent qualification</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                                <span>Foundation program completion accepted</span>
                              </li>
                            </ul>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-semibold text-slate-900 mb-2">Postgraduate Programs</h4>
                            <ul className="space-y-2 text-slate-700">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                                <span>Bachelor degree from recognized institution</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                                <span>Minimum 2:2 or equivalent GPA</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-4" style={{ color: '#0066CC' }}>English Language Tests</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border-2 rounded-lg" style={{ borderColor: '#0066CC' }}>
                          <h4 className="font-semibold mb-2" style={{ color: '#F37021' }}>IELTS</h4>
                          <p className="text-sm text-slate-700">Overall 6.0-6.5 (UG)</p>
                          <p className="text-sm text-slate-700">Overall 6.5-7.0 (PG)</p>
                        </div>
                        <div className="p-4 border-2 rounded-lg" style={{ borderColor: '#0066CC' }}>
                          <h4 className="font-semibold mb-2" style={{ color: '#F37021' }}>OIETC / ELLT</h4>
                          <p className="text-sm text-slate-700">Accepted for pathway programs</p>
                          <p className="text-sm text-slate-700">Check course requirements</p>
                        </div>
                        <div className="p-4 border-2 rounded-lg" style={{ borderColor: '#0066CC' }}>
                          <h4 className="font-semibold mb-2" style={{ color: '#F37021' }}>Duolingo</h4>
                          <p className="text-sm text-slate-700">Score 95-110 accepted</p>
                          <p className="text-sm text-slate-700">Varies by program</p>
                        </div>
                        <div className="p-4 border-2 rounded-lg" style={{ borderColor: '#0066CC' }}>
                          <h4 className="font-semibold mb-2" style={{ color: '#F37021' }}>MOI</h4>
                          <p className="text-sm text-slate-700">Medium of Instruction accepted</p>
                          <p className="text-sm text-slate-700">For eligible students</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fees">
                <Card className="border-2" style={{ borderColor: '#0066CC' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
                      <DollarSign className="w-5 h-5" />
                      Tuition Fees (Indicative)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
                        <h3 className="font-bold text-xl mb-2" style={{ color: '#0066CC' }}>Undergraduate</h3>
                        <p className="text-3xl font-bold mb-2" style={{ color: '#F37021' }}>
                          £{university.country === 'United Kingdom' ? '15,000 - 30,000' : '12,000 - 25,000'}
                        </p>
                        <p className="text-sm text-slate-600">per year (varies by program)</p>
                      </div>
                      <div className="p-6 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
                        <h3 className="font-bold text-xl mb-2" style={{ color: '#0066CC' }}>Postgraduate</h3>
                        <p className="text-3xl font-bold mb-2" style={{ color: '#F37021' }}>
                          £{university.country === 'United Kingdom' ? '16,000 - 35,000' : '13,000 - 30,000'}
                        </p>
                        <p className="text-sm text-slate-600">per year (varies by program)</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-900">
                        <strong>Note:</strong> Fees vary by program and subject area. Contact us for exact fees for your chosen course.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scholarships">
                <Card className="border-2" style={{ borderColor: '#0066CC' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
                      <Award className="w-5 h-5" />
                      Scholarships for Bangladeshi Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {university.scholarships_summary ? (
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {university.scholarships_summary}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-6 border-2 rounded-lg" style={{ borderColor: '#F37021' }}>
                          <div className="flex items-center gap-3 mb-4">
                            <Award className="w-8 h-8" style={{ color: '#F37021' }} />
                            <div>
                              <h3 className="font-bold text-lg" style={{ color: '#0066CC' }}>Merit-Based Scholarships</h3>
                              <p className="text-sm text-slate-600">Up to £5,000 per year</p>
                            </div>
                          </div>
                          <p className="text-slate-700">Available for students with excellent academic records</p>
                        </div>

                        <div className="p-6 border-2 rounded-lg" style={{ borderColor: '#0066CC' }}>
                          <div className="flex items-center gap-3 mb-4">
                            <Award className="w-8 h-8" style={{ color: '#0066CC' }} />
                            <div>
                              <h3 className="font-bold text-lg" style={{ color: '#0066CC' }}>International Student Scholarships</h3>
                              <p className="text-sm text-slate-600">£2,000 - £3,000 per year</p>
                            </div>
                          </div>
                          <p className="text-slate-700">Automatic consideration upon application</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-900">
                            <strong>Contact ALO Education</strong> for personalized scholarship guidance and application support.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="career">
                <Card className="border-2" style={{ borderColor: '#0066CC' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
                      <Briefcase className="w-5 h-5" />
                      Career & Graduate Route Opportunity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-4" style={{ color: '#0066CC' }}>Graduate Opportunities</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5" style={{ color: '#F37021' }} />
                            <h4 className="font-semibold text-slate-900">High Employment Rate</h4>
                          </div>
                          <p className="text-sm text-slate-700">90%+ graduates employed within 6 months</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5" style={{ color: '#F37021' }} />
                            <h4 className="font-semibold text-slate-900">Industry Connections</h4>
                          </div>
                          <p className="text-sm text-slate-700">Strong partnerships with leading employers</p>
                        </div>
                      </div>
                    </div>

                    {university.country === 'United Kingdom' && (
                      <div className="p-6 rounded-lg" style={{ backgroundColor: '#0066CC15' }}>
                        <h3 className="font-bold text-xl mb-3" style={{ color: '#0066CC' }}>UK Graduate Route Visa</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                            <span className="text-slate-700">2-year post-study work visa (3 years for PhD)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                            <span className="text-slate-700">Work in any job at any skill level</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                            <span className="text-slate-700">No job offer required to apply</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#0066CC' }} />
                            <span className="text-slate-700">Switch to Skilled Worker visa later</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-lg mb-3" style={{ color: '#0066CC' }}>Career Support Services</h3>
                      <div className="space-y-2">
                        {[
                          'Dedicated careers guidance team',
                          'Regular career fairs and employer events',
                          'CV and interview preparation workshops',
                          'Internship and placement opportunities',
                          'Alumni networking events'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" style={{ color: '#0066CC' }} />
                            <span className="text-slate-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses">
                <div className="space-y-6">
                  <Card className="border-2" style={{ borderColor: '#0066CC' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ color: '#F37021' }}>
                        <BookOpen className="w-5 h-5" />
                        Popular Courses for International Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {courses.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">Course information will be available soon</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {courses.slice(0, 6).map(course => (
                            <div key={course.id} className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow" style={{ borderColor: '#0066CC' }}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <Badge className="mb-2" style={{ backgroundColor: '#0066CC', color: 'white' }}>
                                    {course.level}
                                  </Badge>
                                  <h3 className="text-lg font-bold mb-2" style={{ color: '#F37021' }}>
                                    {course.course_title}
                                  </h3>
                                  {course.subject_area && (
                                    <p className="text-sm text-slate-600 mb-3">{course.subject_area}</p>
                                  )}
                                  <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                                    {course.duration && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" style={{ color: '#0066CC' }} />
                                        {course.duration}
                                      </span>
                                    )}
                                    {course.intake && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" style={{ color: '#0066CC' }} />
                                        {course.intake}
                                      </span>
                                    )}
                                    {course.tuition_fee_min && (
                                      <span className="font-semibold" style={{ color: '#F37021' }}>
                                        From £{course.tuition_fee_min.toLocaleString()}/year
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                                  <Button style={{ backgroundColor: '#F37021', color: '#000000' }} className="font-semibold">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <PopularCourses universityId={universityId} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* Quick Stats */}
              <Card className="alo-card">
                <CardHeader>
                  <CardTitle className="alo-card-title">Quick Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {university.student_population && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <p className="text-sm text-slate-500">Students</p>
                        <p className="font-semibold text-slate-900">
                          {university.student_population.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                    <div>
                      <p className="text-sm text-slate-500">Next Intakes</p>
                      <p className="font-semibold text-slate-900">{nextIntake}</p>
                    </div>
                  </div>

                  {university.international_students_percent && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 mt-0.5" style={{ color: 'var(--alo-orange)' }} />
                      <div>
                        <p className="text-sm text-slate-500">International Students</p>
                        <p className="font-semibold text-slate-900">
                          {university.international_students_percent}%
                        </p>
                      </div>
                    </div>
                  )}

                  {university.website_url && (
                    <a
                      href={university.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium hover:underline"
                      style={{ color: 'var(--alo-blue)' }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Official Website
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Compare CTA */}
              <Card className="alo-card border-2" style={{ borderColor: '#F37021' }}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#0066CC' }}>Compare Universities</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Compare this university with others side-by-side
                  </p>
                  <Button 
                    onClick={() => {
                      setCompareIds([universityId]);
                      setShowComparison(true);
                    }}
                    className="w-full"
                    style={{ backgroundColor: '#F37021', color: 'white' }}
                  >
                    Start Comparison
                  </Button>
                </CardContent>
              </Card>

              {/* Compare & Deadline */}
              <Button
                variant="outline"
                className="w-full font-semibold py-6"
                style={{ borderColor: '#F37021', color: '#F37021' }}
                onClick={() => {
                  setSelectedForCompare([university]);
                  setShowCompareModal(true);
                }}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Add to Compare
              </Button>

              {university.application_deadline && (
                <Card className="bg-red-50 border-2 border-red-200">
                  <CardContent className="p-4 text-center">
                    <Bell className="w-5 h-5 text-red-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-red-900">Application Deadline</p>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      {university.application_deadline}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <Card style={{ backgroundColor: '#0066CC' }} className="text-white border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-white" />
                  <h3 className="text-2xl font-bold mb-3">Ready to Apply?</h3>
                  <p className="text-white/90 mb-6 text-lg">
                    Get personalized guidance from our expert counselors
                  </p>
                  <Link to={createPageUrl('Contact')}>
                    <Button className="w-full mb-3 font-bold h-12 text-lg" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                      Apply Now
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Contact')}>
                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-12">
                      Book Free Consultation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showComparison && compareIds.length > 0 && (
        <UniversityComparison 
          universityIds={compareIds}
          onClose={() => setShowComparison(false)}
        />
      )}

      <CompareModal
        items={selectedForCompare}
        type="university"
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        universities={[]}
      />

=======

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
>>>>>>> last/main
      <Footer />
    </div>
  );
}