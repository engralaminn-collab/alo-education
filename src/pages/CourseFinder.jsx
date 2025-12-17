import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, DollarSign, GraduationCap, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Footer from '@/components/landing/Footer';

export default function CourseFinder() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [studyLevel, setStudyLevel] = useState('');
  const [country, setCountry] = useState('');
  const [intake, setIntake] = useState('');
  const [englishTest, setEnglishTest] = useState('');
  const [tuitionMin, setTuitionMin] = useState('');
  const [tuitionMax, setTuitionMax] = useState('');
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-search'],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }, '-created_date', 500),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-search'],
    queryFn: () => base44.entities.University.filter({ status: 'active' }),
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges-list'],
    queryFn: () => base44.entities.Badge.list(),
  });

  const { data: courseBadges = [] } = useQuery({
    queryKey: ['course-badges'],
    queryFn: () => base44.entities.CourseBadge.list(),
  });

  const universityMap = universities.reduce((acc, uni) => {
    acc[uni.id] = uni;
    return acc;
  }, {});

  const courseBadgeMap = courseBadges.reduce((acc, cb) => {
    if (!acc[cb.course_id]) acc[cb.course_id] = [];
    acc[cb.course_id].push(cb.badge_id);
    return acc;
  }, {});

  const badgeMap = badges.reduce((acc, badge) => {
    acc[badge.id] = badge;
    return acc;
  }, {});

  const subjects = [...new Set(courses.map(c => c.subject_area).filter(Boolean))];
  const countries = [...new Set(courses.map(c => c.country).filter(Boolean))];
  const intakes = ['Jan', 'May', 'Sep', 'Open'];
  const studyLevels = ['Foundation', 'Undergraduate', 'Postgraduate', 'PhD'];

  const handleBadgeToggle = (badgeId) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId) ? prev.filter(id => id !== badgeId) : [...prev, badgeId]
    );
  };

  const filteredCourses = courses.filter(course => {
    const university = universityMap[course.university_id];
    const courseBadgeIds = courseBadgeMap[course.id] || [];

    const matchesSearch = !searchQuery || 
      course.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject_area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      university?.university_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = !subjectId || course.subject_area === subjectId;
    const matchesLevel = !studyLevel || course.level === studyLevel;
    const matchesCountry = !country || course.country === country;
    const matchesIntake = !intake || course.intake?.toLowerCase().includes(intake.toLowerCase());
    
    const matchesTuition = (!tuitionMin || (course.tuition_fee_min || 0) >= parseInt(tuitionMin)) &&
                          (!tuitionMax || (course.tuition_fee_max || 0) <= parseInt(tuitionMax));
    
    const matchesBadges = selectedBadges.length === 0 || 
      selectedBadges.some(badgeId => courseBadgeIds.includes(badgeId));

    return matchesSearch && matchesSubject && matchesLevel && matchesCountry && 
           matchesIntake && matchesTuition && matchesBadges;
  }).sort((a, b) => {
    if (sortBy === 'name') return (a.course_title || '').localeCompare(b.course_title || '');
    if (sortBy === 'tuition_low') return (a.tuition_fee_min || 0) - (b.tuition_fee_min || 0);
    if (sortBy === 'tuition_high') return (b.tuition_fee_min || 0) - (a.tuition_fee_min || 0);
    return 0;
  });

  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredCourses.length / pageSize);

  const badgeCounts = badges.map(badge => ({
    ...badge,
    count: courses.filter(c => (courseBadgeMap[c.id] || []).includes(badge.id)).length
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Search */}
      <section className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=400&fit=crop"
          alt="Students studying abroad"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.9), rgba(243, 112, 33, 0.85))' }} />
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find Your Perfect Course
              </h1>
              <p className="text-xl opacity-95 mb-8">
                Search from 1000+ courses at top universities worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Form & Results */}
      <div className="container mx-auto px-6 -mt-16 relative z-10">
        <Card className="bg-white shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={studyLevel} onValueChange={setStudyLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Study Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Levels</SelectItem>
                  {studyLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Destination Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Countries</SelectItem>
                  {countries.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={intake} onValueChange={setIntake}>
                <SelectTrigger>
                  <SelectValue placeholder="Intake (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Intakes</SelectItem>
                  {intakes.map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by course name, university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Filters</h3>

                {/* Badges */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Badges</h4>
                  <div className="space-y-2">
                    {badgeCounts.filter(b => b.count > 0).map(badge => (
                      <div key={badge.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={badge.id}
                          checked={selectedBadges.includes(badge.id)}
                          onCheckedChange={() => handleBadgeToggle(badge.id)}
                        />
                        <label htmlFor={badge.id} className="text-sm cursor-pointer">
                          {badge.name} ({badge.count})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tuition Range */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Tuition Fee</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={tuitionMin}
                      onChange={(e) => setTuitionMin(e.target.value)}
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={tuitionMax}
                      onChange={(e) => setTuitionMax(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setSubjectId('');
                    setStudyLevel('');
                    setCountry('');
                    setIntake('');
                    setTuitionMin('');
                    setTuitionMax('');
                    setSelectedBadges([]);
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600">
                Showing {paginatedCourses.length} of {filteredCourses.length} courses
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="tuition_low">Tuition: Low to High</SelectItem>
                  <SelectItem value="tuition_high">Tuition: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedCourses.map((course, idx) => {
                const university = universityMap[course.university_id];
                const badgeIds = courseBadgeMap[course.id] || [];
                const courseBadgesData = badgeIds.map(id => badgeMap[id]).filter(Boolean);

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                      <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          {university?.logo && (
                            <img src={university.logo} alt="" className="h-12 object-contain mb-4" />
                          )}
                          
                          <div className="mb-3 flex flex-wrap gap-2">
                            <Badge style={{ backgroundColor: '#0066CC', color: 'white' }}>
                              {course.level}
                            </Badge>
                            {courseBadgesData.slice(0, 2).map(badge => (
                              <Badge key={badge.id} variant="outline">
                                {badge.name}
                              </Badge>
                            ))}
                          </div>

                          <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: '#F37021' }}>
                            {course.course_title}
                          </h3>

                          {university && (
                            <p className="text-sm text-slate-600 mb-1">{university.university_name}</p>
                          )}

                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{course.country}</span>
                          </div>

                          {course.duration && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                              <Clock className="w-4 h-4" />
                              <span>Duration: {course.duration}</span>
                            </div>
                          )}

                          {(course.tuition_fee_min || course.tuition_fee_max) && (
                            <div className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: '#F37021' }}>
                              <DollarSign className="w-4 h-4" />
                              <span>
                                {course.tuition_fee_min && course.tuition_fee_max
                                  ? `${course.tuition_fee_min.toLocaleString()} - ${course.tuition_fee_max.toLocaleString()}`
                                  : course.tuition_fee_min
                                  ? `From ${course.tuition_fee_min.toLocaleString()}`
                                  : `Up to ${course.tuition_fee_max.toLocaleString()}`
                                } {course.currency || 'USD'}
                              </span>
                            </div>
                          )}

                          <Button className="w-full" style={{ backgroundColor: '#F37021', color: '#000000' }}>
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}