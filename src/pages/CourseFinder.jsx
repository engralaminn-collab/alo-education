import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Search, Filter, X, Building2, Clock, DollarSign, 
  Calendar, MapPin, Award, Sparkles, BookOpen, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';
import AIUniversityRecommendations from '@/components/courses/AIUniversityRecommendations';

export default function CourseFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    subject_area: '',
    country: '',
    duration_min: '',
    duration_max: '',
    tuition_min: 0,
    tuition_max: 100000,
    start_date: '',
    scholarship: false
  });
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' })
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (user) {
        const profiles = await base44.entities.StudentProfile.filter({ email: user.email });
        return profiles[0];
      }
      return null;
    }
  });

  const universityMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  // AI-powered course recommendations based on user profile and interactions
  const getAIRecommendations = () => {
    if (!userProfile) return courses.slice(0, 3);
    
    return courses.map(course => {
      let aiScore = 50; // Base score
      
      // Match preferred fields
      if (userProfile.preferred_fields?.includes(course.subject_area)) {
        aiScore += 20;
      }
      
      // Match degree level
      if (userProfile.preferred_degree_level === course.level) {
        aiScore += 15;
      }
      
      // Match country preference
      const uni = universityMap[course.university_id];
      if (uni && userProfile.preferred_countries?.includes(uni.country)) {
        aiScore += 15;
      }
      
      // Budget match
      if (userProfile.budget_max && course.tuition_fee_min && course.tuition_fee_min <= userProfile.budget_max) {
        aiScore += 10;
      }
      
      return { ...course, aiScore };
    }).sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);
  };

  // Advanced filtering
  const filteredCourses = courses.filter(course => {
    // Search query
    if (searchQuery && !course.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !course.subject_area?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Level filter
    if (filters.level && course.level !== filters.level) {
      return false;
    }
    
    // Subject area filter
    if (filters.subject_area && course.subject_area !== filters.subject_area) {
      return false;
    }
    
    // Country filter
    const uni = universityMap[course.university_id];
    if (filters.country && uni?.country !== filters.country) {
      return false;
    }
    
    // Duration filter (parse duration string like "2 years" or "18 months")
    if (filters.duration_min || filters.duration_max) {
      const durationMatch = course.duration?.match(/(\d+)\s*(year|month)/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        const months = unit === 'year' ? value * 12 : value;
        
        if (filters.duration_min && months < parseInt(filters.duration_min)) return false;
        if (filters.duration_max && months > parseInt(filters.duration_max)) return false;
      }
    }
    
    // Tuition filter
    if (course.tuition_fee_min) {
      if (course.tuition_fee_min < filters.tuition_min) return false;
      if (course.tuition_fee_min > filters.tuition_max) return false;
    }
    
    // Scholarship filter
    if (filters.scholarship && !course.scholarship_available) {
      return false;
    }
    
    // Start date/intake filter
    if (filters.start_date && course.intake && !course.intake.includes(filters.start_date)) {
      return false;
    }
    
    return true;
  });

  // Sorting
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'tuition_low') {
      return (a.tuition_fee_min || 0) - (b.tuition_fee_min || 0);
    }
    if (sortBy === 'tuition_high') {
      return (b.tuition_fee_min || 0) - (a.tuition_fee_min || 0);
    }
    if (sortBy === 'duration') {
      const aDur = a.duration?.match(/(\d+)/)?.[1] || 0;
      const bDur = b.duration?.match(/(\d+)/)?.[1] || 0;
      return aDur - bDur;
    }
    return 0; // relevance (default)
  });

  const clearFilters = () => {
    setFilters({
      level: '',
      subject_area: '',
      country: '',
      duration_min: '',
      duration_max: '',
      tuition_min: 0,
      tuition_max: 100000,
      start_date: '',
      scholarship: false
    });
    setSearchQuery('');
  };

  const aiRecommendations = getAIRecommendations();
  const uniqueSubjects = [...new Set(courses.map(c => c.subject_area).filter(Boolean))];
  const uniqueCountries = [...new Set(courses.map(c => universityMap[c.university_id]?.country).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Course
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover courses from top universities worldwide with AI-powered recommendations
            </p>
            
            {/* Search */}
            <div className="bg-white rounded-xl p-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <Input
                placeholder="Search courses by name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 text-slate-900"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        {/* AI University Recommendations */}
        <AIUniversityRecommendations
          studentProfile={userProfile}
          searchCriteria={{
            country: filters.country,
            subject: filters.subject_area,
            level: filters.level,
            tuition_max: filters.tuition_max,
            duration: filters.duration_max ? `${filters.duration_max} months` : null,
          }}
          courses={filteredCourses}
          universities={universities}
        />

        {/* AI Course Recommendations */}
        {userProfile && showAIRecommendations && aiRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-education-blue/5 to-alo-orange/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-alo-orange" />
                  <h2 className="text-xl font-bold text-slate-900">AI-Powered Recommendations for You</h2>
                </div>
                <p className="text-slate-600 mb-4">Based on your profile and preferences</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {aiRecommendations.map((course) => (
                    <Link key={course.id} to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                      <Card className="hover:shadow-lg transition-all border-education-blue/20">
                        <CardContent className="p-4">
                          <Badge className="bg-alo-orange text-white mb-2">
                            {course.aiScore}% Match
                          </Badge>
                          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{course.course_title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-1">
                            {universityMap[course.university_id]?.university_name}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-alo-orange" />
                    Filters
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Degree Level */}
                  <div>
                    <Label className="text-slate-700 mb-2 block">Degree Level</Label>
                    <Select value={filters.level} onValueChange={(v) => setFilters({...filters, level: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>All levels</SelectItem>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Foundation">Foundation</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject Area */}
                  <div>
                    <Label className="text-slate-700 mb-2 block">Subject Area</Label>
                    <Select value={filters.subject_area} onValueChange={(v) => setFilters({...filters, subject_area: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>All subjects</SelectItem>
                        {uniqueSubjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Country */}
                  <div>
                    <Label className="text-slate-700 mb-2 block">Country</Label>
                    <Select value={filters.country} onValueChange={(v) => setFilters({...filters, country: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>All countries</SelectItem>
                        {uniqueCountries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div>
                    <Label className="text-slate-700 mb-2 block">Duration (months)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.duration_min}
                        onChange={(e) => setFilters({...filters, duration_min: e.target.value})}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.duration_max}
                        onChange={(e) => setFilters({...filters, duration_max: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Tuition Fee Range */}
                  <div>
                    <Label className="text-slate-700 mb-2 block">
                      Tuition Fee (USD): ${filters.tuition_min.toLocaleString()} - ${filters.tuition_max.toLocaleString()}
                    </Label>
                    <Slider
                      min={0}
                      max={100000}
                      step={1000}
                      value={[filters.tuition_min, filters.tuition_max]}
                      onValueChange={([min, max]) => setFilters({...filters, tuition_min: min, tuition_max: max})}
                      className="mt-2"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label className="text-slate-700 mb-2 block">Intake</Label>
                    <Select value={filters.start_date} onValueChange={(v) => setFilters({...filters, start_date: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All intakes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>All intakes</SelectItem>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="February">February</SelectItem>
                        <SelectItem value="September">September</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scholarship Available */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="scholarship"
                      checked={filters.scholarship}
                      onChange={(e) => setFilters({...filters, scholarship: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-education-blue focus:ring-education-blue"
                    />
                    <Label htmlFor="scholarship" className="cursor-pointer">
                      Scholarship Available
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{sortedCourses.length} Courses Found</h2>
                <p className="text-slate-500">Explore courses that match your criteria</p>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="tuition_low">Tuition: Low to High</SelectItem>
                  <SelectItem value="tuition_high">Tuition: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-education-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading courses...</p>
              </div>
            ) : sortedCourses.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses found</h3>
                  <p className="text-slate-500 mb-4">Try adjusting your filters or search query</p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedCourses.map((course) => {
                  const university = universityMap[course.university_id];
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge className="bg-education-blue/10 text-education-blue">
                                  {course.level}
                                </Badge>
                                <Badge variant="outline">
                                  {course.subject_area}
                                </Badge>
                                {course.scholarship_available && (
                                  <Badge className="bg-sunshine text-white">
                                    <Award className="w-3 h-3 mr-1" />
                                    Scholarship
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2">{course.course_title}</h3>
                              {university && (
                                <p className="text-slate-500 flex items-center gap-1 mb-3">
                                  <Building2 className="w-4 h-4" />
                                  {university.university_name} • {university.city}, {university.country}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                {course.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {course.duration}
                                  </span>
                                )}
                                {course.tuition_fee_min && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    ${course.tuition_fee_min.toLocaleString()} - ${course.tuition_fee_max?.toLocaleString() || 'N/A'}
                                  </span>
                                )}
                                {course.intake && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {course.intake}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                              <Button className="bg-gradient-brand hover:opacity-90 text-white">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}