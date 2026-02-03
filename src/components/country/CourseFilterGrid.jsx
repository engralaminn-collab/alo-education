import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search, DollarSign, Clock, Award, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseFilterGrid({ courses = [], country }) {
  const [filters, setFilters] = useState({
    search: '',
    subject: 'all',
    level: 'all',
    city: 'all',
    budget: [0, 50000]
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_title?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSubject = filters.subject === 'all' || course.subject_area === filters.subject;
    const matchesLevel = filters.level === 'all' || course.level === filters.level;
    const matchesBudget = !course.tuition_fee_min || 
      (course.tuition_fee_min >= filters.budget[0] && course.tuition_fee_min <= filters.budget[1]);
    
    return matchesSearch && matchesSubject && matchesLevel && matchesBudget;
  });

  // Extract unique subjects and cities
  const subjects = [...new Set(courses.map(c => c.subject_area).filter(Boolean))];
  const cities = [...new Set(courses.map(c => c.city).filter(Boolean))];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">
            Popular Courses in {country}
          </h2>
          <p className="text-xl text-slate-600">Find the perfect program for your career goals</p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-xl border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Search Course</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="e.g., Computer Science"
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Subject Area</Label>
                <Select value={filters.subject} onValueChange={(v) => setFilters({...filters, subject: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Degree Level</Label>
                <Select value={filters.level} onValueChange={(v) => setFilters({...filters, level: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">
                  Budget: ${filters.budget[0].toLocaleString()} - ${filters.budget[1].toLocaleString()}
                </Label>
                <Slider
                  value={filters.budget}
                  onValueChange={(v) => setFilters({...filters, budget: v})}
                  max={50000}
                  step={1000}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-bold text-blue-600">{filteredCourses.length}</span> courses
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFilters({ search: '', subject: 'all', level: 'all', city: 'all', budget: [0, 50000] })}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.slice(0, 12).map((course) => (
            <Card key={course.id} className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all">
              <CardContent className="p-5">
                {/* Course Title */}
                <h3 className="font-bold text-orange-600 mb-3 text-lg min-h-[3.5rem] line-clamp-2">
                  {course.course_title}
                </h3>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge className="bg-blue-600 text-white capitalize">{course.level}</Badge>
                  <Badge variant="outline" className="capitalize text-xs">
                    {course.subject_area}
                  </Badge>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>{course.duration || '1-3 years'}</span>
                </div>

                {/* Fees */}
                {course.tuition_fee_min && (
                  <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-blue-600">
                      From £{course.tuition_fee_min.toLocaleString()}/year
                    </span>
                  </div>
                )}

                {/* Scholarship Badge */}
                {course.scholarship_available && (
                  <Badge className="bg-amber-100 text-amber-700 mb-4">
                    <Award className="w-3 h-3 mr-1" />
                    Scholarship Available
                  </Badge>
                )}

                {/* CTA */}
                <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Courses */}
        <div className="text-center mt-12">
          <Link to={createPageUrl('Courses') + `?country=${country}`}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View All {courses.length}+ Courses
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}