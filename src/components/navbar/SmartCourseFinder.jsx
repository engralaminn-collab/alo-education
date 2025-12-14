import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function SmartCourseFinder({ onClose }) {
  const [activeTab, setActiveTab] = useState('courses');
  const [filters, setFilters] = useState({
    subject: '',
    courseType: '',
    country: '',
    year: '2026',
    intake: ''
  });

  const subjects = [
    'Business & Management',
    'Engineering',
    'Computer Science & IT',
    'Medicine & Healthcare',
    'Arts & Design',
    'Law',
    'Science',
    'Social Sciences',
    'Education',
    'Hospitality & Tourism'
  ];

  const courseTypes = [
    'Undergraduate',
    'Postgraduate',
    'PhD',
    'Foundation',
    'Diploma',
    'Certificate'
  ];

  const countries = [
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Germany',
    'Ireland',
    'New Zealand',
    'Dubai (UAE)'
  ];

  const intakes = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.subject) params.set('field', filters.subject.toLowerCase());
    if (filters.courseType) params.set('degree', filters.courseType.toLowerCase());
    if (filters.country) params.set('country', filters.country.toLowerCase());
    if (filters.year) params.set('year', filters.year);
    if (filters.intake) params.set('intake', filters.intake.toLowerCase());

    const page = activeTab === 'courses' ? 'Courses' : 'Universities';
    window.location.href = createPageUrl(page) + '?' + params.toString();
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-2xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="courses" className="text-base font-semibold">
            COURSES
          </TabsTrigger>
          <TabsTrigger value="universities" className="text-base font-semibold">
            UNIVERSITIES
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              I'm looking for:
            </label>
            <Select value={filters.subject} onValueChange={(v) => setFilters({...filters, subject: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject type" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              I'm planning to study:
            </label>
            <Select value={filters.courseType} onValueChange={(v) => setFilters({...filters, courseType: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select course type" />
              </SelectTrigger>
              <SelectContent>
                {courseTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              I want to study in:
            </label>
            <Select value={filters.country} onValueChange={(v) => setFilters({...filters, country: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Year:
              </label>
              <Select value={filters.year} onValueChange={(v) => setFilters({...filters, year: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Intake:
              </label>
              <Select value={filters.intake} onValueChange={(v) => setFilters({...filters, intake: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intake" />
                </SelectTrigger>
                <SelectContent>
                  {intakes.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleSearch}
            className="w-full h-12 text-lg font-semibold text-white"
            style={{ backgroundColor: 'var(--alo-orange)' }}
          >
            <Search className="w-5 h-5 mr-2" />
            Search Courses
          </Button>
        </TabsContent>

        <TabsContent value="universities" className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              I'm looking for:
            </label>
            <Select value={filters.subject} onValueChange={(v) => setFilters({...filters, subject: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject type" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              I want to study in:
            </label>
            <Select value={filters.country} onValueChange={(v) => setFilters({...filters, country: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Year:
              </label>
              <Select value={filters.year} onValueChange={(v) => setFilters({...filters, year: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Intake:
              </label>
              <Select value={filters.intake} onValueChange={(v) => setFilters({...filters, intake: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intake" />
                </SelectTrigger>
                <SelectContent>
                  {intakes.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleSearch}
            className="w-full h-12 text-lg font-semibold text-white"
            style={{ backgroundColor: 'var(--alo-orange)' }}
          >
            <Search className="w-5 h-5 mr-2" />
            Search Universities
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}