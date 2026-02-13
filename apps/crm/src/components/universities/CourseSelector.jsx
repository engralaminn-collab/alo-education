import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from 'lucide-react';

export default function CourseSelector({ courses, universities, selected, onSelect, onRemove }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const filtered = courses.filter(c => {
    const matchesSearch = c.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || c.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const courseLevelOptions = ['Undergraduate', 'Postgraduate', 'Foundation', 'PhD', 'Diploma', 'Certificate'];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge
          className={`cursor-pointer ${filterLevel === 'all' ? 'bg-education-blue text-white' : 'bg-slate-100'}`}
          onClick={() => setFilterLevel('all')}
        >
          All Levels
        </Badge>
        {courseLevelOptions.map(level => (
          <Badge
            key={level}
            className={`cursor-pointer ${filterLevel === level ? 'bg-education-blue text-white' : 'bg-slate-100'}`}
            onClick={() => setFilterLevel(level)}
          >
            {level}
          </Badge>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Selected Courses */}
        <Card className="border-2 border-education-blue bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3">
              Selected Courses ({selected.length})
            </h3>
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {selected.length === 0 ? (
                  <p className="text-sm text-slate-500">Select courses to compare</p>
                ) : (
                  selected.map(course => {
                    const uni = universities.find(u => u.id === course.university_id);
                    return (
                      <div key={course.id} className="p-2 bg-white rounded border border-education-blue">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{course.course_title}</p>
                            <p className="text-xs text-slate-500">{uni?.university_name}</p>
                            <Badge className="mt-1 text-xs">{course.level}</Badge>
                          </div>
                          <button
                            onClick={() => onRemove(course.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Available Courses */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Available Courses</h3>
            <ScrollArea className="h-48">
              <div className="space-y-2 pr-4">
                {filtered.length === 0 ? (
                  <p className="text-sm text-slate-500">No courses found</p>
                ) : (
                  filtered
                    .filter(c => !selected.find(s => s.id === c.id))
                    .map(course => {
                      const uni = universities.find(u => u.id === course.university_id);
                      return (
                        <button
                          key={course.id}
                          onClick={() => onSelect(course)}
                          className="w-full text-left p-2 rounded border border-slate-200 hover:border-education-blue hover:bg-blue-50 transition-all cursor-pointer"
                        >
                          <p className="text-sm font-medium text-slate-900 truncate">{course.course_title}</p>
                          <p className="text-xs text-slate-500">{uni?.university_name}</p>
                          <Badge className="mt-1 text-xs">{course.level}</Badge>
                        </button>
                      );
                    })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}