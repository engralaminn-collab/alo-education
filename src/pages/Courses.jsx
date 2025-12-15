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
import { Slider } from "@/components/ui/slider";
import { 
  Search, Clock, DollarSign, Filter, X, ArrowRight, 
  GraduationCap, Building2, BookOpen, Award, ArrowUpDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import AIRecommendations from '@/components/recommendations/AIRecommendations';
import SaveCourseButton from '@/components/courses/SaveCourseButton';

const degreeLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'phd', label: 'PhD' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' },
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
  const [sortBy, setSortBy] = useState('relevance');
  const [tuitionRange, setTuitionRange] = useState([0, 100000]);
  const [rankingFilter, setRankingFilter] = useState('all');
  const [selectedCountries, setSelectedCountries] = useState([]);

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
    const university = universityMap[course.university_id];
    
    const matchesSearch = course.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.subject_area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDegree = degreeLevel === 'all' || course.level?.toLowerCase() === degreeLevel.toLowerCase();
    const matchesField = fieldOfStudy === 'all' || 
                        course.subject_area?.toLowerCase().includes(fieldOfStudy.toLowerCase());
    const matchesScholarship = !scholarshipOnly || course.scholarship_available;
    
    // Tuition range filter
    const courseFee = course.tuition_fee_min || course.tuition_fee_max || 0;
    const matchesTuition = courseFee >= tuitionRange[0] && courseFee <= tuitionRange[1];
    
    // Ranking filter
    const matchesRanking = rankingFilter === 'all' || 
                          (rankingFilter === 'top100' && university?.ranking <= 100) ||
                          (rankingFilter === 'top500' && university?.ranking <= 500);
    
    // Country filter
    const matchesCountry = selectedCountries.length === 0 || 
                          selectedCountries.includes(course.country);
    
    return matchesSearch && matchesDegree && matchesField && 
           matchesScholarship && matchesTuition && matchesRanking && matchesCountry;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const uniA = universityMap[a.university_id];
    const uniB = universityMap[b.university_id];
    
    switch(sortBy) {
      case 'ranking':
        return (uniA?.ranking || 999) - (uniB?.ranking || 999);
      case 'tuition_low':
        return (a.tuition_fee_min || 0) - (b.tuition_fee_min || 0);
      case 'tuition_high':
        return (b.tuition_fee_max || 0) - (a.tuition_fee_max || 0);
      case 'name':
        return (a.course_title || '').localeCompare(b.course_title || '');
      default:
        return 0;
    }
  });

  // Get unique countries
  const countries = [...new Set(courses.map(c => c.country).filter(Boolean))].sort();

  const clearFilters = () => {
    setSearchQuery('');
    setDegreeLevel('all');
    setFieldOfStudy('all');
    setScholarshipOnly(false);
    setTuitionRange([0, 100000]);
    setRankingFilter('all');
    setSelectedCountries([]);
    setSortBy('relevance');
  };

  const toggleCountry = (country) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const FiltersContent = () => (
    <div className="space-y-6">
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
        <label className="text-sm font-medium text-slate-700 mb-2 block">University Ranking</label>
        <Select value={rankingFilter} onValueChange={setRankingFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rankings</SelectItem>
            <SelectItem value="top100">Top 100</SelectItem>
            <SelectItem value="top500">Top 500</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Tuition Fee Range (USD)
        </label>
        <div className="px-2 py-4">
          <Slider
            min={0}
            max={100000}
            step={1000}
            value={tuitionRange}
            onValueChange={setTuitionRange}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>${tuitionRange[0].toLocaleString()}</span>
            <span>${tuitionRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Country</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {countries.map(country => (
            <div key={country} className="flex items-center gap-2">
              <Checkbox 
                id={`country-${country}`}
                checked={selectedCountries.includes(country)}
                onCheckedChange={() => toggleCountry(country)}
              />
              <label htmlFor={`country-${country}`} className="text-sm text-slate-700 cursor-pointer">
                {country}
              </label>
            </div>
          ))}
        </div>
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
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Your Perfect Course
            </h1>
            <p className="text-xl text-slate-300">
              Explore {courses.length}+ programs from top universities worldwide
            </p>
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
            {/* AI Recommendations */}
            {user && studentProfile && (
              <div className="mb-8">
                <AIRecommendations 
                  studentProfile={studentProfile}
                  courses={courses}
                  universities={universities}
                  applications={[]}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-slate-600">
                Showing <span className="font-semibold text-slate-900">{sortedCourses.length}</span> courses
              </p>
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="ranking">University Ranking</SelectItem>
                    <SelectItem value="tuition_low">Tuition: Low to High</SelectItem>
                    <SelectItem value="tuition_high">Tuition: High to Low</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
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
                  {sortedCourses.map((course, index) => {
                    const university = universityMap[course.university_id];
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <Badge className="bg-emerald-50 text-emerald-700 capitalize">
                                    {course.level}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {course.subject_area}
                                  </Badge>
                                  {course.scholarship_available && (
                                    <Badge className="bg-amber-50 text-amber-700">
                                      <Award className="w-3 h-3 mr-1" />
                                      Scholarship
                                    </Badge>
                                  )}
                                  {university?.ranking && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                      #{university.ranking} Ranked
                                    </Badge>
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                  {course.course_title}
                                </h3>
                                
                                {university && (
                                  <div className="flex items-center text-slate-500 mb-3">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    {university.university_name}
                                    <span className="mx-2">•</span>
                                    {university.city}, {university.country}
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                  {course.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {course.duration}
                                    </span>
                                  )}
                                  {(course.tuition_fee_min || course.tuition_fee_max) && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      {course.tuition_fee_min && course.tuition_fee_max
                                        ? `${course.tuition_fee_min.toLocaleString()} - ${course.tuition_fee_max.toLocaleString()}`
                                        : (course.tuition_fee_min || course.tuition_fee_max).toLocaleString()
                                      } {course.currency || 'USD'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-3">
                                <SaveCourseButton 
                                  courseId={course.id} 
                                  studentId={studentProfile?.id}
                                />
                                <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                                  <Button className="bg-slate-900 hover:bg-slate-800">
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-2" />
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

      <Footer />
    </div>
  );
}