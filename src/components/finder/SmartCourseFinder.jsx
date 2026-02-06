import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SmartCourseFinder({ variant = 'default' }) {
  const navigate = useNavigate();
  const [coursesTab, setCoursesTab] = useState({
    subject: '',
    level: '',
    country: '',
    intake: []
  });
  const [universitiesTab, setUniversitiesTab] = useState({
    subject: '',
    university: ''
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-finder'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-finder'],
    queryFn: () => base44.entities.University.list()
  });

  const subjects = [...new Set(courses.map(c => c.subject_area).filter(Boolean))];
  const studyLevels = ['Foundation', 'Undergraduate', 'Postgraduate', 'MRes', 'PhD'];
  const countries = [...new Set(courses.map(c => c.country).filter(Boolean))];
  
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, i).toLocaleString('default', { month: 'short' });
    return `${month} 2026`;
  });

  const handleSearchCourses = () => {
    navigate(createPageUrl('CourseFinderResults'), {
      state: {
        subject: coursesTab.subject,
        level: coursesTab.level,
        country: coursesTab.country,
        intake: coursesTab.intake,
        searchType: 'courses'
      }
    });
  };

  const handleSearchUniversities = () => {
    navigate(createPageUrl('CourseFinderResults'), {
      state: {
        subject: universitiesTab.subject,
        universityId: universitiesTab.university,
        searchType: 'universities'
      }
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 max-w-2xl ${variant === 'compact' ? 'mx-auto' : ''}`}>
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="universities">Universities</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject/Course</label>
                <Select value={coursesTab.subject} onValueChange={(val) => setCoursesTab({...coursesTab, subject: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Study Level</label>
                <Select value={coursesTab.level} onValueChange={(val) => setCoursesTab({...coursesTab, level: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {studyLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Destination Country</label>
                <Select value={coursesTab.country} onValueChange={(val) => setCoursesTab({...coursesTab, country: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Intake (Optional)</label>
                <Select value={coursesTab.intake[0] || ''} onValueChange={(val) => setCoursesTab({...coursesTab, intake: [val]})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intake" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearchCourses} className="w-full bg-alo-orange hover:bg-orange-600 h-10">
              <Search className="w-4 h-4 mr-2" />
              Search Courses
            </Button>
          </TabsContent>

          <TabsContent value="universities" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">I'm looking for</label>
                <Select value={universitiesTab.subject} onValueChange={(val) => setUniversitiesTab({...universitiesTab, subject: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">I want to study in</label>
                <Select value={universitiesTab.university} onValueChange={(val) => setUniversitiesTab({...universitiesTab, university: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.university_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearchUniversities} className="w-full bg-alo-orange hover:bg-orange-600 h-10">
              <Search className="w-4 h-4 mr-2" />
              Search Universities
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Find Your Perfect Course</h2>
      <p className="text-slate-600 mb-8">Search thousands of courses and universities worldwide</p>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="courses" className="text-base">Courses</TabsTrigger>
          <TabsTrigger value="universities" className="text-base">Universities</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-900">Subject/Course</label>
              <Select value={coursesTab.subject} onValueChange={(val) => setCoursesTab({...coursesTab, subject: val})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-900">Study Level</label>
              <Select value={coursesTab.level} onValueChange={(val) => setCoursesTab({...coursesTab, level: val})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {studyLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-900">Destination Country</label>
              <Select value={coursesTab.country} onValueChange={(val) => setCoursesTab({...coursesTab, country: val})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-900">Intake (Optional)</label>
              <Select value={coursesTab.intake[0] || ''} onValueChange={(val) => setCoursesTab({...coursesTab, intake: [val]})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select intake" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearchCourses} className="w-full h-12 bg-alo-orange hover:bg-orange-600 text-white text-base font-semibold">
            <Search className="w-5 h-5 mr-2" />
            Search Courses
          </Button>
        </TabsContent>

        <TabsContent value="universities" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-900">I'm looking for</label>
              <Select value={universitiesTab.subject} onValueChange={(val) => setUniversitiesTab({...universitiesTab, subject: val})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-3 block text-slate-900">I want to study in</label>
              <Select value={universitiesTab.university} onValueChange={(val) => setUniversitiesTab({...universitiesTab, university: val})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.university_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearchUniversities} className="w-full h-12 bg-alo-orange hover:bg-orange-600 text-white text-base font-semibold">
            <Search className="w-5 h-5 mr-2" />
            Search Universities
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}