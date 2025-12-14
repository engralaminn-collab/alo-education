import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  X, Clock, DollarSign, GraduationCap, Building2, 
  ArrowRight, Award, BookOpen, Calendar, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CompareCourses({ 
  selectedCourses = [], 
  universities = [],
  onRemove,
  onClear 
}) {
  const [showComparison, setShowComparison] = useState(false);

  const getUniversity = (courseId) => {
    const course = selectedCourses.find(c => c.id === courseId);
    return universities.find(u => u.id === course?.university_id);
  };

  if (selectedCourses.length === 0) return null;

  return (
    <>
      {/* Floating Compare Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-slate-900">
                  {selectedCourses.length} {selectedCourses.length === 1 ? 'Course' : 'Courses'} Selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedCourses.slice(0, 3).map(course => (
                  <Badge key={course.id} variant="outline" className="flex items-center gap-1">
                    {course.name.split(' ').slice(0, 2).join(' ')}...
                    <button
                      onClick={() => onRemove(course.id)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedCourses.length > 3 && (
                  <Badge variant="outline">+{selectedCourses.length - 3} more</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowComparison(true)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={selectedCourses.length < 2}
                >
                  Compare Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Course Comparison</DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-4 font-semibold text-slate-600 bg-slate-50 sticky left-0 z-10">
                    Criteria
                  </th>
                  {selectedCourses.map(course => {
                    const university = getUniversity(course.id);
                    return (
                      <th key={course.id} className="p-4 text-center min-w-[220px]">
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-900">{course.name}</h4>
                          {university && (
                            <div className="text-sm text-slate-500">
                              {university.name}
                            </div>
                          )}
                          <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Degree Level */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-500" />
                      Degree Level
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      <Badge className="bg-emerald-100 text-emerald-700 capitalize">
                        {course.degree_level}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Field of Study */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      Field of Study
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      <Badge variant="outline" className="capitalize">
                        {course.field_of_study?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Duration */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      Duration
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.duration_months ? (
                        <div className="text-sm">
                          <div className="font-semibold">{course.duration_months} months</div>
                          <div className="text-xs text-slate-500">
                            {Math.floor(course.duration_months / 12)} year{Math.floor(course.duration_months / 12) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Tuition Fee */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Tuition Fee
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.tuition_fee ? (
                        <div className="text-sm">
                          <div className="font-semibold text-green-600">
                            {course.currency || 'USD'} {course.tuition_fee.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500">per year</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Contact for fees</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* University */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-500" />
                      University
                    </div>
                  </td>
                  {selectedCourses.map(course => {
                    const university = getUniversity(course.id);
                    return (
                      <td key={course.id} className="p-4 text-center">
                        {university ? (
                          <div className="text-sm">
                            <div className="font-semibold">{university.name}</div>
                            <div className="text-xs text-slate-500">
                              {university.city}, {university.country}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Scholarship */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      Scholarship Available
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.scholarship_available ? (
                        <Badge className="bg-amber-100 text-amber-700">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">
                          No
                        </Badge>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Entry Requirements - Min GPA */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      Minimum GPA
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.requirements?.min_gpa ? (
                        <Badge variant="outline">{course.requirements.min_gpa}</Badge>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* IELTS Requirement */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-red-500" />
                      IELTS Score
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.requirements?.ielts_score ? (
                        <Badge className="bg-red-100 text-red-700">
                          {course.requirements.ielts_score}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Intake Dates */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Intake Dates
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {course.intake_dates?.slice(0, 3).map((date, i) => (
                          <Badge key={i} className="bg-blue-100 text-blue-700 text-xs">
                            {date}
                          </Badge>
                        )) || <span className="text-slate-400">N/A</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => setShowComparison(false)}>
              Close
            </Button>
            <Link to={createPageUrl('Contact')}>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                Get Expert Guidance
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}