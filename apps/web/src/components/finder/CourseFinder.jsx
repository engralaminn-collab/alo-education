import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function CourseFinder() {
  const navigate = useNavigate();

  // Courses Tab State
  const [coursesTab, setCoursesTab] = useState({
    subject: '',
    studyLevel: '',
    country: '',
    intakes: [],
  });

  // Universities Tab State
  const [unisTab, setUnisTab] = useState({
    subject: '',
    universityName: '',
  });

  // Fetch universities and courses
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  // Extract unique subjects from courses
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(courses.map((c) => c.subject_area).filter(Boolean));
    return Array.from(uniqueSubjects).sort();
  }, [courses]);

  // Extract countries from universities
  const countries = useMemo(() => {
    const uniqueCountries = new Set(universities.map((u) => u.country).filter(Boolean));
    return Array.from(uniqueCountries).sort();
  }, [universities]);

  // Get unique intakes from 2026 Jan to 2026 Dec
  const intakeMonths = [
    { value: '2026-01', label: 'January 2026' },
    { value: '2026-02', label: 'February 2026' },
    { value: '2026-03', label: 'March 2026' },
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-12', label: 'December 2026' },
  ];

  const studyLevels = [
    { value: 'foundation', label: 'Foundation' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'mres', label: 'MRes' },
    { value: 'phd', label: 'PhD' },
  ];

  const handleSearchCourses = () => {
    navigate(createPageUrl('CourseFinderResults'), {
      state: {
        searchType: 'courses',
        subject: coursesTab.subject,
        studyLevel: coursesTab.studyLevel,
        country: coursesTab.country,
        intakes: coursesTab.intakes,
      },
    });
  };

  const handleSearchUniversities = () => {
    navigate(createPageUrl('CourseFinderResults'), {
      state: {
        searchType: 'universities',
        subject: unisTab.subject,
        universityName: unisTab.universityName,
      },
    });
  };

  const toggleIntake = (intakeValue) => {
    setCoursesTab((prev) => ({
      ...prev,
      intakes: prev.intakes.includes(intakeValue)
        ? prev.intakes.filter((i) => i !== intakeValue)
        : [...prev.intakes, intakeValue],
    }));
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="courses" className="text-base font-semibold">
            Courses
          </TabsTrigger>
          <TabsTrigger value="universities" className="text-base font-semibold">
            Universities
          </TabsTrigger>
        </TabsList>

        {/* COURSES TAB */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Subject / Course */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Subject / Course
              </label>
              <Select
                value={coursesTab.subject}
                onValueChange={(v) =>
                  setCoursesTab((prev) => ({ ...prev, subject: v }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select subject or course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Study Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Study Level
              </label>
              <Select
                value={coursesTab.studyLevel}
                onValueChange={(v) =>
                  setCoursesTab((prev) => ({ ...prev, studyLevel: v }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Levels</SelectItem>
                  {studyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination Country */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Destination Country
              </label>
              <Select
                value={coursesTab.country}
                onValueChange={(v) =>
                  setCoursesTab((prev) => ({ ...prev, country: v }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Intake */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Intake (Optional)
              </label>
              <div className="relative">
                <Select
                  value={coursesTab.intakes[0] || ''}
                  onValueChange={(v) => toggleIntake(v)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select intake months" />
                  </SelectTrigger>
                  <SelectContent>
                    {intakeMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {coursesTab.intakes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {coursesTab.intakes.map((intake) => (
                    <button
                      key={intake}
                      onClick={() => toggleIntake(intake)}
                      className="px-3 py-1 bg-education-blue text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {intakeMonths.find((m) => m.value === intake)?.label.split(' ')[0]} {intake.split('-')[1]}
                      <span className="ml-2 cursor-pointer">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSearchCourses}
            className="w-full h-12 bg-alo-orange hover:bg-orange-600 text-white font-bold text-base"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Courses
          </Button>
        </TabsContent>

        {/* UNIVERSITIES TAB */}
        <TabsContent value="universities" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* I'm looking for */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                I'm looking for
              </label>
              <Select
                value={unisTab.subject}
                onValueChange={(v) =>
                  setUnisTab((prev) => ({ ...prev, subject: v }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* I want to study in */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                I want to study in
              </label>
              <Select
                value={unisTab.universityName}
                onValueChange={(v) =>
                  setUnisTab((prev) => ({ ...prev, universityName: v }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Universities</SelectItem>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id}>
                      {uni.university_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSearchUniversities}
            className="w-full h-12 bg-alo-orange hover:bg-orange-600 text-white font-bold text-base"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Universities
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}