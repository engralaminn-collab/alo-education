import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Clock, DollarSign, Award, ArrowRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function PremiumCourseGrid({ courses = [], title = "Popular Courses" }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || course.subject_area === subjectFilter;
    const matchesDegree = degreeFilter === 'all' || course.level === degreeFilter;
    const matchesBudget = budgetFilter === 'all' || 
      (budgetFilter === 'low' && (course.tuition_fee_min || 0) < 15000) ||
      (budgetFilter === 'medium' && (course.tuition_fee_min || 0) >= 15000 && (course.tuition_fee_min || 0) < 25000) ||
      (budgetFilter === 'high' && (course.tuition_fee_min || 0) >= 25000);
    
    return matchesSearch && matchesSubject && matchesDegree && matchesBudget;
  });

  const subjects = [...new Set(courses.map(c => c.subject_area).filter(Boolean))];

  return (
    <section className="bg-slate-50 py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-blue-600">{title}</h2>
          <Link to={createPageUrl('Courses')}>
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              View All Courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-8 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={degreeFilter} onValueChange={setDegreeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Degree Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="low">&lt; £15,000</SelectItem>
                  <SelectItem value="medium">£15,000 - £25,000</SelectItem>
                  <SelectItem value="high">&gt; £25,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.slice(0, 8).map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all h-full group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-blue-600 text-white capitalize">{course.level}</Badge>
                    {course.scholarship_available && (
                      <Badge className="bg-amber-100 text-amber-700">
                        <Award className="w-3 h-3 mr-1" />
                        Scholarship
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-orange-600 mb-3 text-lg min-h-[3.5rem] line-clamp-2 group-hover:text-orange-700 transition-colors">
                    {course.course_title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{course.duration || '1-3 years'}</span>
                    </p>
                    {course.tuition_fee_min && (
                      <p className="flex items-center gap-2 font-semibold text-blue-600">
                        <DollarSign className="w-4 h-4" />
                        From £{course.tuition_fee_min.toLocaleString()}/year
                      </p>
                    )}
                  </div>
                  
                  <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white group-hover:shadow-lg transition-all">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No courses match your filters</p>
          </div>
        )}
      </div>
    </section>
  );
}