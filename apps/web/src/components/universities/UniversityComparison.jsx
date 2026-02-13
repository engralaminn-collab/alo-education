import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { GitCompare, X, Star, MapPin, Users, Globe, DollarSign, Calendar, Award, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UniversityComparison({ universityIds, onClose }) {
  const { data: universities = [] } = useQuery({
    queryKey: ['comparison-universities', universityIds],
    queryFn: async () => {
      const unis = await Promise.all(
        universityIds.map(id => 
          base44.entities.University.filter({ id }).then(result => result[0])
        )
      );
      return unis.filter(Boolean);
    },
    enabled: universityIds.length > 0,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['comparison-courses', universityIds],
    queryFn: async () => {
      const courses = await Promise.all(
        universityIds.map(id => 
          base44.entities.Course.filter({ university_id: id, status: 'open' }).then(result => result.slice(0, 5))
        )
      );
      return courses;
    },
    enabled: universityIds.length > 0,
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['comparison-reviews', universities.map(u => u?.university_name || u?.name)],
    queryFn: async () => {
      const reviews = await Promise.all(
        universities.map(uni => 
          base44.entities.Testimonial.filter({ 
            status: 'approved',
            university: uni?.university_name || uni?.name
          }).then(result => result.length)
        )
      );
      return reviews;
    },
    enabled: universities.length > 0,
  });

  if (universities.length === 0) {
    return null;
  }

  const criteria = [
    {
      label: 'Location',
      icon: MapPin,
      getValue: (uni) => `${uni.city}, ${uni.country}`,
    },
    {
      label: 'World Ranking',
      icon: Star,
      getValue: (uni) => uni.ranking ? `#${uni.ranking}` : 'Not ranked',
      compare: (a, b) => (a.ranking || 999999) - (b.ranking || 999999),
    },
    {
      label: 'Student Population',
      icon: Users,
      getValue: (uni) => uni.student_population ? uni.student_population.toLocaleString() : 'N/A',
    },
    {
      label: 'International Students',
      icon: Globe,
      getValue: (uni) => uni.international_students_percent ? `${uni.international_students_percent}%` : 'N/A',
    },
    {
      label: 'Acceptance Rate',
      icon: CheckCircle,
      getValue: (uni) => uni.acceptance_rate ? `${uni.acceptance_rate}%` : 'N/A',
      compare: (a, b) => (b.acceptance_rate || 0) - (a.acceptance_rate || 0), // Higher is better for students
    },
    {
      label: 'Available Intakes',
      icon: Calendar,
      getValue: (uni) => uni.intakes || 'Contact university',
    },
  ];

  const getBestValue = (criterion, universities) => {
    if (!criterion.compare) return null;
    const sorted = [...universities].sort(criterion.compare);
    return sorted[0]?.id;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" style={{ color: '#0066CC' }} />
              University Comparison
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-4 font-semibold text-slate-900 w-48 sticky left-0 bg-white z-10">
                  Criteria
                </th>
                {universities.map((uni, idx) => (
                  <th key={uni.id} className="p-4 min-w-[280px]">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl mx-auto mb-3 bg-slate-100 flex items-center justify-center overflow-hidden">
                        {uni.logo ? (
                          <img src={uni.logo} alt={uni.university_name || uni.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Award className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-2">
                        {uni.university_name || uni.name}
                      </h3>
                      <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, criterionIdx) => {
                const bestUniId = getBestValue(criterion, universities);
                return (
                  <tr key={criterionIdx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <criterion.icon className="w-4 h-4" style={{ color: '#F37021' }} />
                        {criterion.label}
                      </div>
                    </td>
                    {universities.map((uni) => {
                      const isBest = bestUniId === uni.id;
                      return (
                        <td key={uni.id} className="p-4 text-center">
                          <span className={`${isBest ? 'font-semibold text-green-700 bg-green-50 px-2 py-1 rounded' : 'text-slate-700'}`}>
                            {criterion.getValue(uni)}
                            {isBest && ' ⭐'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Popular Courses */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" style={{ color: '#F37021' }} />
                    Popular Courses
                  </div>
                </td>
                {allCourses.map((courses, idx) => (
                  <td key={idx} className="p-4">
                    <div className="space-y-1 text-sm text-left">
                      {courses.length > 0 ? (
                        courses.slice(0, 3).map((course, courseIdx) => (
                          <div key={courseIdx} className="text-slate-700">
                            • {course.course_title}
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 text-center">No courses listed</div>
                      )}
                      {courses.length > 3 && (
                        <div className="text-slate-400 text-xs">+{courses.length - 3} more</div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Student Reviews */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" style={{ color: '#F37021' }} />
                    Student Reviews
                  </div>
                </td>
                {allReviews.map((count, idx) => (
                  <td key={idx} className="p-4 text-center">
                    <span className="text-slate-700">
                      {count > 0 ? `${count} review${count !== 1 ? 's' : ''}` : 'No reviews yet'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Entry Requirements Summary */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: '#F37021' }} />
                    Entry Requirements
                  </div>
                </td>
                {universities.map((uni) => (
                  <td key={uni.id} className="p-4">
                    <div className="text-sm text-slate-700 text-left">
                      {uni.entry_requirements_summary ? (
                        <div className="line-clamp-3">{uni.entry_requirements_summary}</div>
                      ) : (
                        <div className="text-slate-400 text-center">Not available</div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-center">
          <p className="text-sm text-slate-600 mb-3">
            Ready to apply? Get personalized guidance from our expert counselors
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button className="text-white" style={{ backgroundColor: '#F37021' }}>
              Book Free Consultation
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}