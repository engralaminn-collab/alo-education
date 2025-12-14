import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, DollarSign, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function CourseFinder() {
  const [keyword, setKeyword] = useState('');
  const [courseType, setCourseType] = useState('all');
  const [destination, setDestination] = useState('all');

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

  const filteredCourses = courses.filter(course => {
    const matchesKeyword = !keyword || 
      course.course_title?.toLowerCase().includes(keyword.toLowerCase()) ||
      course.subject_area?.toLowerCase().includes(keyword.toLowerCase());
    
    const matchesType = courseType === 'all' || course.level === courseType;
    
    const matchesDestination = destination === 'all' || course.country === destination;

    return matchesKeyword && matchesType && matchesDestination;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section style={{ background: 'var(--alo-blue)' }} className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Course Finder
            </h1>
            <p className="text-xl opacity-90">
              Search and discover your perfect course from {courses.length}+ programs worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Keyword Search */}
              <div className="md:col-span-1">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Course Title / Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="e.g., Business, Engineering..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Course Type */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Course Type
                </label>
                <Select value={courseType} onValueChange={setCourseType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destination */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Destination (Optional)
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
            </div>

            {(keyword || courseType !== 'all' || destination !== 'all') && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold">{filteredCourses.length}</span> results
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setKeyword('');
                    setCourseType('all');
                    setDestination('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
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
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search criteria</p>
            <Button
              onClick={() => {
                setKeyword('');
                setCourseType('all');
                setDestination('all');
              }}
            >
              Clear Filters
            </Button>
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