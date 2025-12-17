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
  const [subjectType, setSubjectType] = useState('all');
  const [courseType, setCourseType] = useState('all');
  const [destination, setDestination] = useState('all');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [selectedIntakes, setSelectedIntakes] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

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
      const matchesSubject = subjectType === 'all' || course.subject_area === subjectType;
      const matchesType = courseType === 'all' || course.level === courseType;
      const matchesDestination = destination === 'all' || course.country === destination;
      const matchesIntake = selectedIntakes.length === 0 || 
        selectedIntakes.some(intake => course.intake?.includes(intake.split(' ')[1]));
      
      return matchesSearch && matchesSubject && matchesType && matchesDestination && matchesIntake;
    } else {
      const matchesSubject = subjectType === 'all' || course.subject_area === subjectType;
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
      const matchesSubject = subjectType === 'all' || 
        uniCourses.some(c => c.subject_area === subjectType);
      
      return matchesSearch && matchesSubject && uni.status === 'active';
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
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by course name, university, or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-lg border-2"
                  />
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  {/* Subject Type */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      I'm looking for:
                    </label>
                    <Select value={subjectType} onValueChange={setSubjectType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select subject type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjectAreas.filter(s => s !== 'all').map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course Type */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      I'm planning to study:
                    </label>
                    <Select value={courseType} onValueChange={setCourseType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
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
                        <SelectItem value="all">All Countries</SelectItem>
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
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">
                    For the intake:
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {intakes.map(intake => (
                      <div key={intake} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
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
              </TabsContent>

              <TabsContent value="universities" className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by university name, city, or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-lg border-2"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Subject Type */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      I'm looking for:
                    </label>
                    <Select value={subjectType} onValueChange={setSubjectType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select subject type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjectAreas.filter(s => s !== 'all').map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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