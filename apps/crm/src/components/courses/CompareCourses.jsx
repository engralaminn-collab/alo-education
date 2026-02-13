import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  X, Clock, DollarSign, Award, Building2, ArrowRight, 
  BookOpen, CheckCircle, Calendar, Globe
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

  const getUniversity = (uniId) => universities.find(u => u.id === uniId);

  if (selectedCourses.length === 0) return null;

  return (
    <>
      {/* Floating Compare Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-900">
                  {selectedCourses.length} {selectedCourses.length === 1 ? 'Course' : 'Courses'} Selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedCourses.slice(0, 3).map(course => (
                  <Badge key={course.id} variant="outline" className="flex items-center gap-1">
                    {course.course_title.slice(0, 20)}...
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
                  className="bg-blue-600 hover:bg-blue-700"
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
                    const uni = getUniversity(course.university_id);
                    return (
                      <th key={course.id} className="p-4 text-center min-w-[200px]">
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-900 text-sm">{course.course_title}</h4>
                          <div className="text-xs text-slate-500">
                            {uni?.university_name || uni?.name}
                          </div>
                          <Badge className="capitalize">{course.level}</Badge>
                          <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                            <Button size="sm" variant="outline" className="text-xs w-full">
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
                {/* University */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      University
                    </div>
                  </td>
                  {selectedCourses.map(course => {
                    const uni = getUniversity(course.university_id);
                    return (
                      <td key={course.id} className="p-4 text-center">
                        <div className="text-sm">
                          <div className="font-semibold">{uni?.university_name || uni?.name}</div>
                          <div className="text-xs text-slate-500">{uni?.city}, {uni?.country}</div>
                        </div>
                      </td>
                    );
                  })}
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
                      <Badge variant="outline">{course.duration || 'N/A'}</Badge>
                    </td>
                  ))}
                </tr>

                {/* Tuition Fees */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      Tuition Fees
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.tuition_fee_min ? (
                        <div className="text-sm">
                          <div className="font-semibold text-emerald-600">
                            {course.currency || 'USD'} {course.tuition_fee_min.toLocaleString()}
                            {course.tuition_fee_max && course.tuition_fee_max !== course.tuition_fee_min && 
                              ` - ${course.tuition_fee_max.toLocaleString()}`
                            }
                          </div>
                          <div className="text-xs text-slate-500">per year</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Contact for fees</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Subject Area */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      Subject Area
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      <Badge variant="outline" className="capitalize">
                        {course.subject_area || 'N/A'}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Intake */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      Intake
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      <div className="text-sm text-slate-600">
                        {course.intake || 'Contact for dates'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Entry Requirements */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Entry Requirements
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4">
                      <div className="text-xs text-slate-600 text-left">
                        {course.entry_requirements || 'Contact for details'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* IELTS */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      IELTS Required
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.ielts_required ? (
                        <div className="text-sm">
                          <Badge className="bg-blue-100 text-blue-700">
                            {course.ielts_overall || 'Required'}
                          </Badge>
                          {course.ielts_min_each && (
                            <div className="text-xs text-slate-500 mt-1">
                              Min each: {course.ielts_min_each}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Not specified</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Scholarship */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      Scholarship
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.scholarship_available ? (
                        <Badge className="bg-amber-100 text-amber-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <span className="text-slate-400">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Overview */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      Overview
                    </div>
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4">
                      <div className="text-xs text-slate-600 text-left max-h-24 overflow-y-auto">
                        {course.overview?.slice(0, 150) || 'No overview available'}
                        {course.overview?.length > 150 && '...'}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center mt-6 pt-6 border-t gap-3">
            <Button variant="outline" onClick={() => setShowComparison(false)}>
              Close
            </Button>
            <Link to={createPageUrl('Contact')}>
              <Button className="bg-blue-600 hover:bg-blue-700">
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