import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, Clock, DollarSign, Filter, X, ArrowRight, 
  GraduationCap, Building2, BookOpen, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import AIRecommendations from '@/components/recommendations/AIRecommendations';
import CompareCourses from '@/components/courses/CompareCourses';
import TrendingAnalysis from '@/components/discovery/TrendingAnalysis';
import { Slider } from "@/components/ui/slider";

const degreeLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'master', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'diploma', label: 'Diploma' },
];

const fieldsOfStudy = [
  { value: 'all', label: 'All Fields' },
  { value: 'business', label: 'Business' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'arts', label: 'Arts' },
  { value: 'law', label: 'Law' },
  { value: 'science', label: 'Science' },
  { value: 'social_sciences', label: 'Social Sciences' },
  { value: 'education', label: 'Education' },
  { value: 'hospitality', label: 'Hospitality' },
];

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('all');
  const [fieldOfStudy, setFieldOfStudy] = useState('all');
  const [scholarshipOnly, setScholarshipOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [countryFilter, setCountryFilter] = useState('all');
  const [tuitionRange, setTuitionRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('relevance');

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('degree')) setDegreeLevel(params.get('degree'));
    if (params.get('field')) setFieldOfStudy(params.get('field'));
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-courses'],
    queryFn: () => base44.entities.University.list(),
  });

  const universityMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject_area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDegree = degreeLevel === 'all' || course.level === degreeLevel;
    const matchesField = fieldOfStudy === 'all' || course.subject_area === fieldOfStudy;
    const matchesScholarship = !scholarshipOnly || course.scholarship_available;
    const matchesCountry = countryFilter === 'all' || course.country === countryFilter;
    const matchesTuition = !course.tuition_fee_min || 
      (course.tuition_fee_min >= tuitionRange[0] && course.tuition_fee_min <= tuitionRange[1]);
    
    return matchesSearch && matchesDegree && matchesField && matchesScholarship && 
           matchesCountry && matchesTuition;
  }).sort((a, b) => {
    if (sortBy === 'fees-low') return (a.tuition_fee_min || 0) - (b.tuition_fee_min || 0);
    if (sortBy === 'fees-high') return (b.tuition_fee_min || 0) - (a.tuition_fee_min || 0);
    if (sortBy === 'duration') return (a.duration || '').localeCompare(b.duration || '');
    return 0;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setDegreeLevel('all');
    setFieldOfStudy('all');
    setScholarshipOnly(false);
    setCountryFilter('all');
    setTuitionRange([0, 50000]);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Country</label>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
            <SelectItem value="United States">United States</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="Australia">Australia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Degree Level</label>
        <Select value={degreeLevel} onValueChange={setDegreeLevel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {degreeLevels.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Field of Study</label>
        <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldsOfStudy.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-4 block">
          Tuition Range: ${tuitionRange[0].toLocaleString()} - ${tuitionRange[1].toLocaleString()}
        </label>
        <Slider
          value={tuitionRange}
          onValueChange={setTuitionRange}
          max={50000}
          step={1000}
          className="mt-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox 
          id="scholarship" 
          checked={scholarshipOnly}
          onCheckedChange={setScholarshipOnly}
        />
        <label htmlFor="scholarship" className="text-sm text-slate-700 cursor-pointer">
          Scholarship Available
        </label>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-education-blue to-alo-orange py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" />
                ALO Education Course Finder
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Find Your Perfect Course
              </h1>
              <p className="text-xl text-slate-300">
                Explore {courses.length}+ programs from top universities worldwide with expert ALO Education guidance
              </p>
            </motion.div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white border-0 rounded-xl text-lg"
              />
            </div>
            <Select value={degreeLevel} onValueChange={setDegreeLevel}>
              <SelectTrigger className="w-full md:w-48 h-14 bg-white border-0 rounded-xl">
                <SelectValue placeholder="Degree Level" />
              </SelectTrigger>
              <SelectContent>
                {degreeLevels.map(d => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
              <SelectTrigger className="w-full md:w-48 h-14 bg-white border-0 rounded-xl">
                <SelectValue placeholder="Field of Study" />
              </SelectTrigger>
              <SelectContent>
                {fieldsOfStudy.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold text-slate-900 mb-6">Filters</h3>
              <FiltersContent />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            {/* Trending Analysis */}
            <div className="mb-8">
              <TrendingAnalysis type="courses" />
            </div>

            {/* AI Recommendations */}
            {user && studentProfile && (
              <div className="mb-8">
                <AIRecommendations 
                  studentProfile={studentProfile}
                  courses={courses}
                  universities={universities}
                />
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <p className="text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{filteredCourses.length}</span> courses
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="fees-low">Fees (Low to High)</SelectItem>
                    <SelectItem value="fees-high">Fees (High to Low)</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-4">
                  {filteredCourses.map((course, index) => {
                    const university = universityMap[course.university_id];
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`border-0 shadow-sm hover:shadow-lg transition-all duration-300 group ${
                          selectedForCompare.some(c => c.id === course.id) ? 'ring-2 ring-blue-500' : ''
                        }`}>
                          <CardContent className="p-6">
                            <div className="absolute top-3 right-3 z-10">
                              <input
                                type="checkbox"
                                checked={selectedForCompare.some(c => c.id === course.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedForCompare([...selectedForCompare, course]);
                                  } else {
                                    setSelectedForCompare(selectedForCompare.filter(c => c.id !== course.id));
                                  }
                                }}
                                className="w-5 h-5 rounded border-slate-300 text-blue-500 cursor-pointer"
                                title="Select for comparison"
                              />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <Badge className="bg-emerald-50 text-emerald-700 capitalize">
                                    {course.degree_level}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {course.field_of_study?.replace(/_/g, ' ')}
                                  </Badge>
                                  {course.scholarship_available && (
                                    <Badge className="bg-amber-50 text-amber-700">
                                      <Award className="w-3 h-3 mr-1" />
                                      Scholarship
                                    </Badge>
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                  {course.name}
                                </h3>
                                
                                {university && (
                                  <div className="flex items-center text-slate-500 mb-3">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    {university.name}
                                    <span className="mx-2">•</span>
                                    {university.city}, {university.country}
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                  {course.duration_months && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {course.duration_months} months
                                    </span>
                                  )}
                                  {course.tuition_fee && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      {course.tuition_fee.toLocaleString()} {course.currency || 'USD'}/year
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex md:flex-col gap-3">
                                <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`} className="flex-1 md:flex-none">
                                  <Button className="w-full bg-slate-900 hover:bg-slate-800">
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
                                </Link>
                                <Link to={createPageUrl('CourseMatcher')} className="flex-1 md:flex-none">
                                  <Button variant="outline" className="w-full">
                                    Check Eligibility
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <CompareCourses
        selectedCourses={selectedForCompare}
        universities={universities}
        onRemove={(id) => setSelectedForCompare(selectedForCompare.filter(c => c.id !== id))}
        onClear={() => setSelectedForCompare([])}
      />

      <Footer />
    </div>
  );
}