import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

// Helper: Generate intakes 2026 Jan to Dec
const generateIntakes = () => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months.map(month => `2026-${month}`);
};

export default function CourseFinder() {
  const navigate = useNavigate();
  const allIntakes = generateIntakes();

  // Course Finder - COURSES Tab
  const [courseFilters, setCourseFilters] = useState({
    subject: '',
    level: '',
    country: '',
    intakes: []
  });

  // Course Finder - UNIVERSITIES Tab
  const [uniFilters, setUniFilters] = useState({
    subject: '',
    universityName: ''
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' })
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list()
  });

  const universityMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  const uniqueSubjects = [...new Set(courses.map(c => c.subject_area).filter(Boolean))];
  const uniqueCountries = [...new Set(courses.map(c => universityMap[c.university_id]?.country).filter(Boolean))];

  // Handle COURSES Tab Search
  const handleCoursesSearch = () => {
    navigate(createPageUrl('CourseFinderResults'), { 
      state: { 
        searchType: 'courses',
        ...courseFilters
      } 
    });
  };

  // Handle UNIVERSITIES Tab Search
  const handleUniversitiesSearch = () => {
    navigate(createPageUrl('CourseFinderResults'), { 
      state: { 
        searchType: 'universities',
        ...uniFilters
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-education-blue to-blue-900 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Course Finder</h1>
            <p className="text-xl text-white/90">Discover your perfect course from top universities worldwide</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <Card className="border-0 shadow-xl max-w-5xl mx-auto">
          <CardContent className="p-8">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="courses" className="text-lg">COURSES</TabsTrigger>
                <TabsTrigger value="universities" className="text-lg">UNIVERSITIES</TabsTrigger>
              </TabsList>

              {/* COURSES TAB */}
              <TabsContent value="courses" className="space-y-6 mt-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Subject / Course */}
                  <div>
                    <Label className="font-semibold text-slate-900 mb-2 block">Subject / Course</Label>
                    <Select value={courseFilters.subject} onValueChange={(v) => setCourseFilters({...courseFilters, subject: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueSubjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Study Level */}
                  <div>
                    <Label className="font-semibold text-slate-900 mb-2 block">Study Level</Label>
                    <Select value={courseFilters.level} onValueChange={(v) => setCourseFilters({...courseFilters, level: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Foundation">Foundation</SelectItem>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="MRes">MRes</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Destination Country */}
                  <div>
                    <Label className="font-semibold text-slate-900 mb-2 block">Destination Country</Label>
                    <Select value={courseFilters.country} onValueChange={(v) => setCourseFilters({...courseFilters, country: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCountries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Intake */}
                  <div>
                    <Label className="font-semibold text-slate-900 mb-2 block">Intake (Optional)</Label>
                    <Select 
                      value={courseFilters.intakes[0] || ''} 
                      onValueChange={(v) => setCourseFilters({...courseFilters, intakes: v ? [v] : []})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select intake" />
                      </SelectTrigger>
                      <SelectContent>
                        {allIntakes.map(intake => (
                          <SelectItem key={intake} value={intake}>{intake}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleCoursesSearch}
                  className="w-full h-12 bg-alo-orange hover:bg-orange-600 text-white text-lg font-bold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Courses
                </Button>
              </TabsContent>

              {/* UNIVERSITIES TAB */}
              <TabsContent value="universities" className="space-y-6 mt-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Looking For */}
                  <div>
                    <Label className="font-semibold text-slate-900 mb-2 block">I'm Looking For</Label>
                    <Select value={uniFilters.subject} onValueChange={(v) => setUniFilters({...uniFilters, subject: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueSubjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Want To Study In */}
                  <div>
                    <Label className="font-semibold text-slate-900 mb-2 block">I Want to Study In</Label>
                    <Select value={uniFilters.universityName} onValueChange={(v) => setUniFilters({...uniFilters, universityName: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map(uni => (
                          <SelectItem key={uni.id} value={uni.id}>{uni.university_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleUniversitiesSearch}
                  className="w-full h-12 bg-alo-orange hover:bg-orange-600 text-white text-lg font-bold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Universities
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}