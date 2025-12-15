import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, GraduationCap, Building2 } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

const subjects = [
  'Business', 'Engineering', 'Computer Science', 'Medicine', 'Arts', 
  'Law', 'Science', 'Social Sciences', 'Education', 'Hospitality'
];

const courseTypes = [
  'Foundation', 'Undergraduate', 'Postgraduate', 'PhD', 'Diploma', 'Certificate'
];

const countries = [
  'United Kingdom', 'Australia', 'Canada', 'Ireland', 
  'New Zealand', 'United States', 'Dubai'
];

const intakes = [
  '2026 Jan', '2026 Feb', '2026 Mar', '2026 Apr', '2026 May', '2026 Jun',
  '2026 Jul', '2026 Aug', '2026 Sep', '2026 Oct', '2026 Nov', '2026 Dec'
];

export default function CourseFinder() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  
  // Course search state
  const [subject, setSubject] = useState('');
  const [courseType, setCourseType] = useState('');
  const [country, setCountry] = useState('');
  const [selectedIntakes, setSelectedIntakes] = useState([]);
  
  // University search state
  const [uniSubject, setUniSubject] = useState('');
  const [university, setUniversity] = useState('');

  const handleCourseSearch = () => {
    const params = new URLSearchParams();
    if (subject) params.set('field', subject.toLowerCase());
    if (courseType) params.set('degree', courseType.toLowerCase());
    if (country) params.set('country', country.toLowerCase());
    navigate(createPageUrl('Courses') + '?' + params.toString());
  };

  const handleUniversitySearch = () => {
    const params = new URLSearchParams();
    if (uniSubject) params.set('q', uniSubject);
    if (university) params.set('q', university);
    navigate(createPageUrl('Universities') + '?' + params.toString());
  };

  const toggleIntake = (intake) => {
    setSelectedIntakes(prev => 
      prev.includes(intake) 
        ? prev.filter(i => i !== intake)
        : [...prev, intake]
    );
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>
              Your Dream of Studying Abroad Starts Here
            </h2>
            <p className="text-xl text-slate-600">
              ALO Education provides expert counselling, university admissions, and visa support for students worldwide.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="courses" className="text-lg data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  COURSES
                </TabsTrigger>
                <TabsTrigger value="universities" className="text-lg data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                  <Building2 className="w-5 h-5 mr-2" />
                  UNIVERSITIES
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>
                    I'm looking for:
                  </label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select subject type" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>
                    I'm planning to study:
                  </label>
                  <Select value={courseType} onValueChange={setCourseType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseTypes.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>
                    I want to study in:
                  </label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--alo-blue)' }}>
                    For the intake: (Select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {intakes.map(intake => (
                      <div key={intake} className="flex items-center space-x-2">
                        <Checkbox 
                          id={intake}
                          checked={selectedIntakes.includes(intake)}
                          onCheckedChange={() => toggleIntake(intake)}
                        />
                        <label
                          htmlFor={intake}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {intake}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleCourseSearch}
                  className="w-full h-14 text-lg font-semibold hover:opacity-90"
                  style={{ backgroundColor: 'var(--alo-orange)', color: '#000000' }}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Courses
                </Button>
              </TabsContent>

              <TabsContent value="universities" className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>
                    I'm looking for:
                  </label>
                  <Select value={uniSubject} onValueChange={setUniSubject}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select subject type" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--alo-blue)' }}>
                    I want to study in:
                  </label>
                  <Input
                    placeholder="Enter university name or location"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="h-12"
                  />
                </div>

                <Button 
                  onClick={handleUniversitySearch}
                  className="w-full h-14 text-lg font-semibold hover:opacity-90"
                  style={{ backgroundColor: 'var(--alo-orange)', color: '#000000' }}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Universities
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}