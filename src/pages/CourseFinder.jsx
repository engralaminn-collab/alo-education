import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MapPin, DollarSign, Award, Building2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/landing/Footer';

const SUBJECT_AREAS = [
  'Business & Management', 'Computer Science & IT', 'Engineering', 'Medicine & Health',
  'Arts & Humanities', 'Law', 'Social Sciences', 'Natural Sciences', 'Education',
  'Architecture', 'Hospitality & Tourism', 'Media & Communications'
];

const STUDY_LEVELS = ['Foundation', 'Undergraduate', 'Postgraduate', 'MRes', 'PhD'];

const COUNTRIES = ['United Kingdom', 'Canada', 'Australia', 'United States', 'Germany', 'Ireland', 'New Zealand', 'Dubai'];

const INTAKE_MONTHS = [
  '2026 January', '2026 February', '2026 March', '2026 April', '2026 May', '2026 June',
  '2026 July', '2026 August', '2026 September', '2026 October', '2026 November', '2026 December'
];

export default function CourseFinder() {
  const [activeTab, setActiveTab] = useState('courses');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Courses tab filters
  const [subjectCourse, setSubjectCourse] = useState('');
  const [studyLevel, setStudyLevel] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [selectedIntakes, setSelectedIntakes] = useState([]);

  // Universities tab filters
  const [lookingFor, setLookingFor] = useState('');
  const [universityName, setUniversityName] = useState('');

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const handleIntakeToggle = (intake) => {
    setSelectedIntakes(prev =>
      prev.includes(intake) ? prev.filter(i => i !== intake) : [...prev, intake]
    );
  };

  const handleCourseSearch = () => {
    let results = courses.filter(course => {
      const matchesSubject = !subjectCourse || 
        course.subject_area?.toLowerCase().includes(subjectCourse.toLowerCase()) || 
        course.course_title?.toLowerCase().includes(subjectCourse.toLowerCase());
      const matchesLevel = !studyLevel || course.level?.toLowerCase() === studyLevel.toLowerCase();
      const matchesCountry = !destinationCountry || course.country?.toLowerCase() === destinationCountry.toLowerCase();
      const matchesIntake = selectedIntakes.length === 0 || 
        selectedIntakes.some(intake => course.intake?.toLowerCase().includes(intake.split(' ')[1].toLowerCase()));
      return matchesSubject && matchesLevel && matchesCountry && matchesIntake;
    });
    setSearchResults(results.map(course => ({ ...course, isCourse: true })));
    setShowResults(true);
  };

  const handleUniversitySearch = () => {
    let results = universities.filter(uni => {
      const matchesLookingFor = !lookingFor || uni.university_name?.toLowerCase().includes(lookingFor.toLowerCase());
      const matchesName = !universityName || uni.university_name?.toLowerCase().includes(universityName.toLowerCase());
      return matchesLookingFor && matchesName;
    });
    setSearchResults(results.map(uni => ({ ...uni, isUniversity: true })));
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Course Finder</h1>
            <p className="text-xl opacity-90">Find your perfect course or university</p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-5xl mx-auto shadow-xl">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full rounded-t-xl h-16 bg-slate-100">
                  <TabsTrigger 
                    value="courses" 
                    className="flex-1 text-lg font-semibold data-[state=active]:text-white"
                    style={{ backgroundColor: activeTab === 'courses' ? '#F37021' : 'transparent' }}
                  >
                    COURSES
                  </TabsTrigger>
                  <TabsTrigger 
                    value="universities" 
                    className="flex-1 text-lg font-semibold data-[state=active]:text-white"
                    style={{ backgroundColor: activeTab === 'universities' ? '#F37021' : 'transparent' }}
                  >
                    UNIVERSITIES
                  </TabsTrigger>
                </TabsList>

                <div className="p-8">
                  <TabsContent value="courses" className="mt-0 space-y-6">
                    <div>
                      <Label className="text-base mb-2 block">Subject / Course</Label>
                      <div className="flex gap-3">
                        <Select value={subjectCourse} onValueChange={setSubjectCourse}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECT_AREAS.map(subject => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or type course name..."
                          value={subjectCourse}
                          onChange={(e) => setSubjectCourse(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base mb-2 block">Study Level</Label>
                        <Select value={studyLevel} onValueChange={setStudyLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {STUDY_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base mb-2 block">Destination Country</Label>
                        <Select value={destinationCountry} onValueChange={setDestinationCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base mb-3 block">Intake (Optional - Select multiple)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {INTAKE_MONTHS.map(intake => (
                          <div key={intake} className="flex items-center gap-2">
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

                    <Button
                      onClick={handleCourseSearch}
                      className="w-full h-14 text-lg font-semibold"
                      style={{ backgroundColor: '#F37021' }}
                    >
                      <Search className="w-6 h-6 mr-2" />
                      Search Courses
                    </Button>
                  </TabsContent>

                  <TabsContent value="universities" className="mt-0 space-y-6">
                    <div>
                      <Label className="text-base mb-2 block">I'm looking for</Label>
                      <div className="flex gap-3">
                        <Select value={lookingFor} onValueChange={setLookingFor}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECT_AREAS.map(subject => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or type..."
                          value={lookingFor}
                          onChange={(e) => setLookingFor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-base mb-2 block">I want to study in</Label>
                      <div className="flex gap-3">
                        <Select value={universityName} onValueChange={setUniversityName}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select university" />
                          </SelectTrigger>
                          <SelectContent>
                            {universities.map(uni => (
                              <SelectItem key={uni.id} value={uni.university_name}>{uni.university_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or type university name..."
                          value={universityName}
                          onChange={(e) => setUniversityName(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleUniversitySearch}
                      className="w-full h-14 text-lg font-semibold"
                      style={{ backgroundColor: '#F37021' }}
                    >
                      <Search className="w-6 h-6 mr-2" />
                      Search Universities
                    </Button>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results - Always Show After Search */}
      {(showResults || searchResults.length > 0) && (
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6">
              {searchResults.length} Results Found
            </h2>

            {searchResults.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-slate-600">No results found. Try different filters.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, index) => {
                  const university = universities.find(u => u.id === result.university_id);
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {result.isUniversity ? (
                          <div className="grid md:grid-cols-4 gap-6 items-center">
                            <div className="md:col-span-2">
                              <Link to={createPageUrl('UniversityDetailsPage') + `?id=${result.id}`}>
                                <div className="flex items-center gap-4">
                                  {result.logo && (
                                    <div className="w-16 h-16 shrink-0">
                                      <img src={result.logo} alt={result.university_name} className="w-full h-full object-contain" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-bold text-lg hover:text-[#F37021]" style={{ color: '#0066CC' }}>
                                      {result.university_name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{result.city}, {result.country}</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                            <div className="text-center">
                              {result.ranking && (
                                <div>
                                  <p className="text-xs text-slate-500 mb-1">World Ranking</p>
                                  <p className="font-bold text-lg" style={{ color: '#F37021' }}>#{result.ranking}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <Link to={createPageUrl('UniversityDetailsPage') + `?id=${result.id}`}>
                                <Button style={{ backgroundColor: '#F37021' }}>View University</Button>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-2">
                              <Link to={createPageUrl('CourseDetailsPage') + `?id=${result.id}`}>
                                <h3 className="font-bold text-lg hover:text-[#F37021] mb-1" style={{ color: '#0066CC' }}>
                                  {result.course_title}
                                </h3>
                              </Link>
                              {university && (
                                <Link to={createPageUrl('UniversityDetailsPage') + `?id=${university.id}`}>
                                  <p className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    {university.university_name}
                                  </p>
                                </Link>
                              )}
                            </div>
                            <div className="text-center">
                              {result.tuition_fee_min && (
                                <div>
                                  <p className="text-xs text-slate-500">Tuition Fee</p>
                                  <p className="font-semibold text-slate-900">£{result.tuition_fee_min.toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <div>
                                <p className="text-xs text-slate-500">Intake</p>
                                <p className="font-semibold text-slate-900">{result.intake || 'N/A'}</p>
                              </div>
                              <div className="mt-2">
                                <p className="text-xs text-slate-500">Interview</p>
                                <p className="font-semibold text-slate-900">{result.interview_required ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                            <div className="text-center">
                              {university?.ranking && (
                                <div className="mb-3">
                                  <p className="text-xs text-slate-500">Ranking</p>
                                  <p className="font-bold" style={{ color: '#F37021' }}>#{university.ranking}</p>
                                </div>
                              )}
                              <Link to={createPageUrl('ApplicationForm')}>
                                <Button className="w-full" style={{ backgroundColor: '#F37021' }}>Apply Now</Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}