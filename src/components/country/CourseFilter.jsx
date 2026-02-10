import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Search, MapPin, DollarSign, ArrowRight, BookOpen, GitCompare, Calendar, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CourseFilter({ courses = [], country }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [budgetRange, setBudgetRange] = useState([0, 50000]);
  const [filterIntake, setFilterIntake] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Get unique values
  const subjects = ['all', ...new Set(courses.map(c => c.subject_area).filter(Boolean))];
  const cities = ['all', ...new Set(courses.map(c => c.city).filter(Boolean))];
  const levels = ['all', 'Undergraduate', 'Postgraduate', 'PhD', 'Foundation'];
  const intakes = ['all', ...new Set(courses.flatMap(c => c.intake?.split(',').map(i => i.trim()) || []).filter(Boolean))];
  const durations = ['all', ...new Set(courses.map(c => c.duration).filter(Boolean))];

  // Filter courses
  let filtered = courses.filter(course => {
    const matchesSearch = course.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.subject_area?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const matchesSubject = filterSubject === 'all' || course.subject_area === filterSubject;
    const matchesCity = filterCity === 'all' || course.city === filterCity;
    const matchesBudget = !course.tuition_fee_min || 
                          (course.tuition_fee_min >= budgetRange[0] && course.tuition_fee_min <= budgetRange[1]);
    const matchesIntake = filterIntake === 'all' || course.intake?.toLowerCase().includes(filterIntake.toLowerCase());
    const matchesDuration = filterDuration === 'all' || course.duration === filterDuration;
    
    return matchesSearch && matchesLevel && matchesSubject && matchesCity && matchesBudget && matchesIntake && matchesDuration;
  });

  const handleCourseSelect = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : prev.length < 4 ? [...prev, courseId] : prev
    );
  };

  const handleCompare = () => {
    if (selectedCourses.length >= 2) {
      navigate(createPageUrl('CompareCourses') + `?ids=${selectedCourses.join(',')}`);
    }
  };

  return (
    <section className="bg-slate-50 py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-2">Popular Courses</h2>
            <p className="text-slate-600 text-lg">
              Discover {courses.length}+ courses across various disciplines
            </p>
          </div>
          <Link to={createPageUrl('Courses') + `?country=${country}`}>
            <Button variant="outline" size="lg">
              Browse All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filter & Search Courses
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Degree Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Subject Area" />
              </SelectTrigger>
              <SelectContent>
                {subjects.slice(0, 20).map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cities.slice(0, 20).map(city => (
                  <SelectItem key={city} value={city}>
                    {city === 'all' ? 'All Cities' : city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterIntake} onValueChange={setFilterIntake}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Intake Month" />
              </SelectTrigger>
              <SelectContent>
                {intakes.map(intake => (
                  <SelectItem key={intake} value={intake}>
                    {intake === 'all' ? 'All Intakes' : intake}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDuration} onValueChange={setFilterDuration}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map(duration => (
                  <SelectItem key={duration} value={duration}>
                    {duration === 'all' ? 'All Durations' : duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="lg:col-span-3">
              <label className="text-sm text-slate-600 mb-2 block flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget: {budgetRange[0].toLocaleString()} - {budgetRange[1].toLocaleString()} / year
              </label>
              <Slider
                value={budgetRange}
                onValueChange={setBudgetRange}
                max={50000}
                step={1000}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> courses
            </span>
            <div className="flex gap-2">
              {selectedCourses.length > 0 && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={handleCompare}
                  disabled={selectedCourses.length < 2}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare ({selectedCourses.length})
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterLevel('all');
                  setFilterSubject('all');
                  setFilterCity('all');
                  setBudgetRange([0, 50000]);
                  setFilterIntake('all');
                  setFilterDuration('all');
                  setSelectedCourses([]);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 9).map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all h-full group relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* Level Badge */}
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {course.level}
                    </Badge>
                    
                    {/* Compare Checkbox */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => handleCourseSelect(course.id)}
                        disabled={!selectedCourses.includes(course.id) && selectedCourses.length >= 4}
                      />
                      <label className="text-xs text-slate-600 cursor-pointer">
                        Compare
                      </label>
                    </div>
                  </div>

                  <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.course_title}
                    </h3>

                    {/* Subject */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.subject_area}</span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold">{course.duration}</span>
                      </div>
                      {course.intake && (
                        <div className="flex items-center justify-between">
                          <span>Intake:</span>
                          <span className="font-semibold">{course.intake}</span>
                        </div>
                      )}
                    </div>

                    {/* Tuition Fee */}
                    {course.tuition_fee_min && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl mb-4">
                        <p className="text-xs text-slate-600 mb-1">Tuition Fee</p>
                        <p className="text-xl font-bold text-blue-600">
                          {course.currency === 'GBP' ? '£' : '$'}
                          {course.tuition_fee_min.toLocaleString()}
                          <span className="text-sm font-normal text-slate-600">/year</span>
                        </p>
                      </div>
                    )}

                    {/* Apply Button */}
                    <Button className="w-full" size="sm">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No courses match your criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setFilterLevel('all');
                setFilterSubject('all');
                setFilterCity('all');
                setBudgetRange([0, 50000]);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {filtered.length > 9 && (
          <div className="text-center mt-10">
            <Link to={createPageUrl('Courses') + `?country=${country}`}>
              <Button size="lg">
                View All {filtered.length} Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}