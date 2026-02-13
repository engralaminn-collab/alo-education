import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GitCompare, CheckCircle, XCircle, Clock, DollarSign, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseComparisonTool({ initialIds = [], onClose }) {
  const [selectedIds, setSelectedIds] = useState(initialIds);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-comparison'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-comparison'],
    queryFn: () => base44.entities.University.list(),
  });

  const selectedCourses = courses.filter(c => selectedIds.includes(c.id));

  const removeCourse = (id) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const addCourse = (id) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getUniversity = (uniId) => {
    return universities.find(u => u.id === uniId);
  };

  if (selectedCourses.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Select Courses to Compare</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {courses.slice(0, 20).map(course => {
                const uni = getUniversity(course.university_id);
                return (
                  <div
                    key={course.id}
                    onClick={() => addCourse(course.id)}
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-600 hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold mb-1">{course.course_title}</h4>
                    <p className="text-sm text-slate-600">{uni?.university_name}</p>
                    <Badge className="mt-2">{course.level}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 overflow-auto">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="w-6 h-6" style={{ color: '#F37021' }} />
              Course Comparison
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left font-semibold sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                    Criteria
                  </th>
                  {selectedCourses.map(course => {
                    const uni = getUniversity(course.university_id);
                    return (
                      <th key={course.id} className="p-4 text-center min-w-[250px]">
                        <div className="flex flex-col items-center gap-2">
                          <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`} className="font-semibold hover:text-blue-600">
                            {course.course_title}
                          </Link>
                          {uni && (
                            <p className="text-sm text-slate-600 font-normal">{uni.university_name}</p>
                          )}
                          <Badge>{course.level}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCourse(course.id)}
                            className="text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* University */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <BookOpen className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    University
                  </td>
                  {selectedCourses.map(course => {
                    const uni = getUniversity(course.university_id);
                    return (
                      <td key={course.id} className="p-4 text-center">
                        {uni ? (
                          <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`} className="hover:text-blue-600">
                            {uni.university_name}
                          </Link>
                        ) : 'N/A'}
                      </td>
                    );
                  })}
                </tr>

                {/* University Ranking */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <Award className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    University Ranking
                  </td>
                  {selectedCourses.map(course => {
                    const uni = getUniversity(course.university_id);
                    return (
                      <td key={course.id} className="p-4 text-center">
                        {uni?.ranking ? (
                          <span className="font-bold text-lg" style={{ color: '#0066CC' }}>#{uni.ranking}</span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Duration */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <Clock className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    Duration
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.duration || <span className="text-slate-400">N/A</span>}
                    </td>
                  ))}
                </tr>

                {/* Tuition Fee */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <DollarSign className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    Tuition Fee (Annual)
                  </td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.tuition_fee_min ? (
                        <div>
                          <span className="font-bold text-lg" style={{ color: '#0066CC' }}>
                            {course.tuition_fee_min.toLocaleString()}
                          </span>
                          {course.tuition_fee_max && course.tuition_fee_max !== course.tuition_fee_min && (
                            <span> - {course.tuition_fee_max.toLocaleString()}</span>
                          )}
                          <div className="text-xs text-slate-500">{course.currency || 'USD'}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Intake */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">Intake</td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.intake || 'Jan, Sep'}
                    </td>
                  ))}
                </tr>

                {/* IELTS Requirement */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">IELTS Requirement</td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.ielts_required ? (
                        <div>
                          <div className="font-semibold">Overall: {course.ielts_overall || 'N/A'}</div>
                          {course.ielts_min_each && (
                            <div className="text-sm text-slate-600">Each band: {course.ielts_min_each}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Not specified</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Entry Requirements */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">Entry Requirements</td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-sm">
                      {course.entry_requirements ? (
                        <div className="text-left max-w-xs mx-auto line-clamp-3">
                          {course.entry_requirements.substring(0, 100)}...
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Scholarships */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">Scholarships Available</td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.scholarship_available ? (
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-6 h-6 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Subject Area */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">Subject Area</td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      {course.subject_area || <span className="text-slate-400">N/A</span>}
                    </td>
                  ))}
                </tr>

                {/* Action */}
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-slate-50"></td>
                  {selectedCourses.map(course => (
                    <td key={course.id} className="p-4 text-center">
                      <div className="space-y-2">
                        <Link to={createPageUrl('CourseDetailsPage') + `?id=${course.id}`}>
                          <Button className="w-full" style={{ backgroundColor: '#0066CC' }}>
                            View Details
                          </Button>
                        </Link>
                        <Link to={createPageUrl('ApplicationForm')}>
                          <Button className="w-full" style={{ backgroundColor: '#F37021' }}>
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {selectedIds.length < 4 && (
            <div className="p-6 border-t bg-slate-50">
              <p className="text-center text-slate-600 mb-4">
                Add up to {4 - selectedIds.length} more {selectedIds.length < 3 ? 'courses' : 'course'}
              </p>
              <div className="grid md:grid-cols-4 gap-3">
                {courses.filter(c => !selectedIds.includes(c.id)).slice(0, 8).map(course => {
                  const uni = getUniversity(course.university_id);
                  return (
                    <button
                      key={course.id}
                      onClick={() => addCourse(course.id)}
                      className="border rounded-lg p-3 hover:border-blue-600 hover:shadow-md transition-all text-left"
                    >
                      <p className="font-semibold text-sm line-clamp-2">{course.course_title}</p>
                      <p className="text-xs text-slate-600 mt-1">{uni?.university_name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}