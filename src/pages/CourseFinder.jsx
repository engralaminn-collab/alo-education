import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MapPin, Clock, DollarSign, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function CourseFinder() {
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectType, setSubjectType] = useState('');
  const [courseType, setCourseType] = useState('all');
  const [destination, setDestination] = useState('all');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [selectedIntakes, setSelectedIntakes] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [tuitionRange, setTuitionRange] = useState('all');
  const [scholarshipOnly, setScholarshipOnly] = useState(false);
  const [rankingFilter, setRankingFilter] = useState('all');
  const [populationRange, setPopulationRange] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [universityType, setUniversityType] = useState('all');
  const [researchFocus, setResearchFocus] = useState('all');
  const [accommodationType, setAccommodationType] = useState('all');
  const [newlyEstablished, setNewlyEstablished] = useState(false);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const universityMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  const countries = ['all', ...new Set(courses.map(c => c.country).filter(Boolean))];
  const subjectAreas = ['all', ...new Set(courses.map(c => c.subject_area).filter(Boolean))];

  const intakes = [
    '2026 Jan', '2026 Feb', '2026 Mar', '2026 Apr', '2026 May', '2026 Jun',
    '2026 Jul', '2026 Aug', '2026 Sep', '2026 Oct', '2026 Nov', '2026 Dec'
  ];

  const handleIntakeToggle = (intake) => {
    setSelectedIntakes(prev => 
      prev.includes(intake) ? prev.filter(i => i !== intake) : [...prev, intake]
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery || 
      course.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject_area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      universityMap[course.university_id]?.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      universityMap[course.university_id]?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'courses') {
      const matchesSubject = !subjectType || course.subject_area?.toLowerCase().includes(subjectType.toLowerCase());
      const matchesType = courseType === 'all' || course.level === courseType;
      const matchesDestination = destination === 'all' || course.country === destination;
      const matchesIntake = selectedIntakes.length === 0 || 
        selectedIntakes.some(intake => course.intake?.includes(intake.split(' ')[1]));
      
      // Tuition range filter
      let matchesTuition = true;
      if (tuitionRange !== 'all' && course.tuition_fee_min) {
        const fee = course.tuition_fee_min;
        if (tuitionRange === '0-10k') matchesTuition = fee < 10000;
        else if (tuitionRange === '10k-20k') matchesTuition = fee >= 10000 && fee < 20000;
        else if (tuitionRange === '20k-30k') matchesTuition = fee >= 20000 && fee < 30000;
        else if (tuitionRange === '30k-40k') matchesTuition = fee >= 30000 && fee < 40000;
        else if (tuitionRange === '40k+') matchesTuition = fee >= 40000;
      }
      
      // Scholarship filter
      const matchesScholarship = !scholarshipOnly || course.scholarship_available === true;
      
      return matchesSearch && matchesSubject && matchesType && matchesDestination && matchesIntake && matchesTuition && matchesScholarship;
    } else {
      const matchesSubject = !subjectType || course.subject_area?.toLowerCase().includes(subjectType.toLowerCase());
      const matchesUniversity = selectedUniversity === 'all' || course.university_id === selectedUniversity;
      
      return matchesSearch && matchesSubject && matchesUniversity;
    }
  }).sort((a, b) => {
    if (sortBy === 'name') return (a.course_title || '').localeCompare(b.course_title || '');
    if (sortBy === 'fee_low') return (a.tuition_fee_min || 0) - (b.tuition_fee_min || 0);
    if (sortBy === 'fee_high') return (b.tuition_fee_min || 0) - (a.tuition_fee_min || 0);
    return 0;
  });

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = !searchQuery ||
      uni.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.country?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'universities') {
      const uniCourses = courses.filter(c => c.university_id === uni.id);
      const matchesSubject = !subjectType || 
        uniCourses.some(c => c.subject_area?.toLowerCase().includes(subjectType.toLowerCase()));
      
      // Ranking filter
      let matchesRanking = true;
      if (rankingFilter !== 'all' && uni.ranking) {
        if (rankingFilter === 'top100') matchesRanking = uni.ranking <= 100;
        else if (rankingFilter === 'top200') matchesRanking = uni.ranking <= 200;
        else if (rankingFilter === 'top500') matchesRanking = uni.ranking <= 500;
      }
      
      // Population filter
      let matchesPopulation = true;
      if (populationRange !== 'all' && uni.student_population) {
        const pop = uni.student_population;
        if (populationRange === 'small') matchesPopulation = pop < 10000;
        else if (populationRange === 'medium') matchesPopulation = pop >= 10000 && pop < 30000;
        else if (populationRange === 'large') matchesPopulation = pop >= 30000;
      }
      
      // Region filter
      const countryToRegion = {
        'United States': 'North America',
        'Canada': 'North America',
        'Mexico': 'North America',
        'United Kingdom': 'Europe',
        'Germany': 'Europe',
        'France': 'Europe',
        'Ireland': 'Europe',
        'Netherlands': 'Europe',
        'Spain': 'Europe',
        'Italy': 'Europe',
        'Australia': 'Oceania',
        'New Zealand': 'Oceania',
        'China': 'Asia',
        'Japan': 'Asia',
        'Singapore': 'Asia',
        'Dubai': 'Middle East',
        'UAE': 'Middle East'
      };
      
      let matchesRegion = true;
      if (regionFilter !== 'all') {
        const uniRegion = countryToRegion[uni.country];
        matchesRegion = uniRegion === regionFilter;
      }
      
      // University type filter (assuming we add this to entity later)
      const matchesType = universityType === 'all' || uni.university_type === universityType;
      
      // Research focus filter (assuming we add this to entity later)
      const matchesFocus = researchFocus === 'all' || uni.research_focus === researchFocus;
      
      // Accommodation filter (assuming we add this to entity later)
      const matchesAccommodation = accommodationType === 'all' || 
        uni.accommodation_types?.includes(accommodationType);
      
      // Newly established filter (universities established in last 20 years)
      let matchesNewlyEstablished = true;
      if (newlyEstablished && uni.established_year) {
        const currentYear = new Date().getFullYear();
        matchesNewlyEstablished = (currentYear - uni.established_year) <= 20;
      }
      
      return matchesSearch && matchesSubject && matchesRanking && matchesPopulation && 
             matchesRegion && matchesType && matchesFocus && matchesAccommodation && 
             matchesNewlyEstablished && uni.status === 'active';
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=400&fit=crop"
          alt="Students with landmarks"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.9), rgba(243, 112, 33, 0.85))' }} />
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Your Dream of Studying Abroad Starts Here
              </h1>
              <p className="text-xl opacity-95 leading-relaxed">
                ALO Education provides expert counselling, university admissions, and visa support for students worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-6 h-14 bg-slate-100">
                <TabsTrigger value="courses" className="flex-1 text-lg font-semibold data-[state=active]:bg-white">
                  COURSES
                </TabsTrigger>
                <TabsTrigger value="universities" className="flex-1 text-lg font-semibold data-[state=active]:bg-white">
                  UNIVERSITIES
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-6">
                <div className="bg-white rounded-lg p-6 border-2 border-slate-200">
                  <div className="grid md:grid-cols-4 gap-4">
                    {/* Subject Type */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        I'm looking for:
                      </label>
                      <Input
                        placeholder="Type subject name (e.g., Business)"
                        value={subjectType}
                        onChange={(e) => setSubjectType(e.target.value)}
                        className="h-12"
                      />
                    </div>

                    {/* Course Level */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        I'm planning to study:
                      </label>
                      <Select value={courseType} onValueChange={setCourseType}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select level type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                          <SelectItem value="Foundation">Foundation</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        I want to study in:
                      </label>
                      <Select value={destination} onValueChange={setDestination}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.filter(c => c !== 'all').map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                      <Button className="w-full h-12 font-bold" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Intake Selection */}
                  <div className="mt-6">
                    <label className="text-sm font-medium text-slate-700 mb-3 block">
                      For the intake:
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {intakes.map(intake => (
                        <div key={intake} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                          <Checkbox
                            id={intake}
                            checked={selectedIntakes.includes(intake)}
                            onCheckedChange={() => handleIntakeToggle(intake)}
                          />
                          <label htmlFor={intake} className="text-sm cursor-pointer">
                            {intake}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Tuition Fee Range:
                      </label>
                      <Select value={tuitionRange} onValueChange={setTuitionRange}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Ranges" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ranges</SelectItem>
                          <SelectItem value="0-10k">Under $10,000</SelectItem>
                          <SelectItem value="10k-20k">$10,000 - $20,000</SelectItem>
                          <SelectItem value="20k-30k">$20,000 - $30,000</SelectItem>
                          <SelectItem value="30k-40k">$30,000 - $40,000</SelectItem>
                          <SelectItem value="40k+">$40,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer w-full">
                        <Checkbox
                          id="scholarship"
                          checked={scholarshipOnly}
                          onCheckedChange={setScholarshipOnly}
                        />
                        <label htmlFor="scholarship" className="text-sm cursor-pointer font-medium">
                          Only show courses with scholarships
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="universities" className="space-y-6">
                <div className="bg-white rounded-lg p-6 border-2 border-slate-200">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Subject Type */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        I'm looking for:
                      </label>
                      <Input
                        placeholder="Type subject name (e.g., Business)"
                        value={subjectType}
                        onChange={(e) => setSubjectType(e.target.value)}
                        className="h-12"
                      />
                    </div>

                    {/* Universities */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        I want to study in:
                      </label>
                      <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Universities</SelectItem>
                          {universities.filter(u => u.status === 'active').map(uni => (
                            <SelectItem key={uni.id} value={uni.id}>{uni.university_name || uni.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                      <Button className="w-full h-12 font-bold" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* University Filters */}
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        World Ranking:
                      </label>
                      <Select value={rankingFilter} onValueChange={setRankingFilter}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Rankings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Rankings</SelectItem>
                          <SelectItem value="top100">Top 100</SelectItem>
                          <SelectItem value="top200">Top 200</SelectItem>
                          <SelectItem value="top500">Top 500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Student Population:
                      </label>
                      <Select value={populationRange} onValueChange={setPopulationRange}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Sizes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sizes</SelectItem>
                          <SelectItem value="small">Small (Under 10,000)</SelectItem>
                          <SelectItem value="medium">Medium (10,000 - 30,000)</SelectItem>
                          <SelectItem value="large">Large (30,000+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Region:
                      </label>
                      <Select value={regionFilter} onValueChange={setRegionFilter}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          <SelectItem value="North America">North America</SelectItem>
                          <SelectItem value="Europe">Europe</SelectItem>
                          <SelectItem value="Asia">Asia</SelectItem>
                          <SelectItem value="Oceania">Oceania</SelectItem>
                          <SelectItem value="Middle East">Middle East</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        University Type:
                      </label>
                      <Select value={universityType} onValueChange={setUniversityType}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Research Focus:
                      </label>
                      <Select value={researchFocus} onValueChange={setResearchFocus}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Research Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Research Types</SelectItem>
                          <SelectItem value="research-intensive">Research Intensive</SelectItem>
                          <SelectItem value="teaching-focused">Teaching Focused</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Accommodation:
                      </label>
                      <Select value={accommodationType} onValueChange={setAccommodationType}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="on-campus">On-Campus Housing</SelectItem>
                          <SelectItem value="off-campus">Off-Campus Assistance</SelectItem>
                          <SelectItem value="homestay">Homestay Programs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Additional Checkboxes */}
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer w-fit">
                      <Checkbox
                        id="newly-established"
                        checked={newlyEstablished}
                        onCheckedChange={setNewlyEstablished}
                      />
                      <label htmlFor="newly-established" className="text-sm cursor-pointer font-medium">
                        Show only newly established universities (Last 20 years)
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold">{activeTab === 'courses' ? filteredCourses.length : filteredUniversities.length}</span> results
              </p>
              {activeTab === 'courses' && filteredCourses.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="fee_low">Fee: Low to High</SelectItem>
                      <SelectItem value="fee_high">Fee: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeTab === 'courses' && filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search criteria</p>
          </div>
        ) : activeTab === 'universities' && filteredUniversities.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No universities found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search criteria</p>
          </div>
        ) : activeTab === 'universities' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((uni, idx) => (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="alo-card h-full">
                  <CardContent className="p-6">
                    <h3 className="alo-card-title text-lg mb-3">
                      {uni.university_name || uni.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-600 mb-4">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{uni.city}, {uni.country}</span>
                    </div>
                    <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                      <Button className="alo-btn-primary w-full">
                        View University
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => {
              const university = universityMap[course.university_id];
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="alo-card h-full flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      {/* Course Type Badge */}
                      <div className="mb-3">
                        <Badge style={{ backgroundColor: 'var(--alo-blue)', color: 'white' }}>
                          {course.level}
                        </Badge>
                      </div>

                      {/* Course Title */}
                      <h3 className="alo-card-title text-lg mb-3 line-clamp-2">
                        {course.course_title}
                      </h3>

                      {/* University */}
                      {university && (
                        <div className="flex items-start gap-2 text-slate-600 mb-2">
                          <GraduationCap className="w-4 h-4 mt-0.5 shrink-0" />
                          <span className="text-sm line-clamp-1">{university.university_name || university.name}</span>
                        </div>
                      )}

                      {/* Country/City */}
                      <div className="flex items-center gap-2 text-slate-600 mb-3">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="text-sm">
                          {course.country}{university?.city ? `, ${university.city}` : ''}
                        </span>
                      </div>

                      {/* Intake */}
                      {course.intake && (
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span className="text-sm">Intake: {course.intake}</span>
                        </div>
                      )}

                      {/* Tuition Range */}
                      {(course.tuition_fee_min || course.tuition_fee_max) && (
                        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--alo-orange)' }}>
                          <DollarSign className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-semibold">
                            {course.tuition_fee_min && course.tuition_fee_max
                              ? `${course.tuition_fee_min.toLocaleString()} - ${course.tuition_fee_max.toLocaleString()}`
                              : course.tuition_fee_min
                              ? `From ${course.tuition_fee_min.toLocaleString()}`
                              : `Up to ${course.tuition_fee_max.toLocaleString()}`
                            } {course.currency || 'USD'}
                          </span>
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex gap-2 mt-auto pt-4">
                        <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`} className="flex-1">
                          <Button className="alo-btn-primary w-full">
                            View Course
                          </Button>
                        </Link>
                        <Link to={createPageUrl('Contact')} className="flex-1">
                          <Button variant="outline" className="w-full" style={{ borderColor: 'var(--alo-blue)', color: 'var(--alo-blue)' }}>
                            Book Counselling
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
      </section>

      <Footer />
    </div>
  );
}