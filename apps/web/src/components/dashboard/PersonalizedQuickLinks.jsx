import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Award, GraduationCap, Users, TrendingUp, ExternalLink } from 'lucide-react';

export default function PersonalizedQuickLinks({ studentProfile }) {
  const { data: scholarships = [] } = useQuery({
    queryKey: ['personalized-scholarships', studentProfile?.id],
    queryFn: () => base44.entities.Scholarship.filter({ status: 'active' }),
    enabled: !!studentProfile?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['personalized-courses', studentProfile?.id],
    queryFn: () => base44.entities.Course.filter({ status: 'open' }),
    enabled: !!studentProfile?.id,
  });

  const { data: alumni = [] } = useQuery({
    queryKey: ['personalized-alumni', studentProfile?.id],
    queryFn: () => base44.entities.Alumni.filter({ status: 'active' }),
    enabled: !!studentProfile?.id,
  });

  // Filter personalized content based on student profile
  const personalizedScholarships = scholarships.filter(s => {
    if (!studentProfile?.admission_preferences?.study_destination) return false;
    const country = studentProfile.admission_preferences.study_destination.toLowerCase();
    return s.country?.toLowerCase().includes(country);
  }).slice(0, 3);

  const personalizedCourses = courses.filter(c => {
    if (!studentProfile?.admission_preferences?.study_area) return false;
    const studyArea = studentProfile.admission_preferences.study_area?.toLowerCase();
    return c.subject_area?.toLowerCase().includes(studyArea) || 
           c.course_title?.toLowerCase().includes(studyArea);
  }).slice(0, 3);

  const personalizedAlumni = alumni.filter(a => {
    if (!studentProfile?.admission_preferences?.study_area) return false;
    const studyArea = studentProfile.admission_preferences.study_area?.toLowerCase();
    return a.subject_area?.toLowerCase().includes(studyArea);
  }).slice(0, 3);

  if (!studentProfile) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Personalized for You
        </CardTitle>
        <p className="text-slate-500 text-sm">Based on your profile and interests</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scholarships */}
        {personalizedScholarships.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-slate-900">Scholarships for You</h4>
            </div>
            <div className="space-y-2">
              {personalizedScholarships.map(s => (
                <div key={s.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-900 text-sm mb-1">{s.scholarship_name}</h5>
                      <p className="text-xs text-slate-600">{s.country}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 text-xs">
                      {s.amount_type?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Link to={createPageUrl('Scholarships')} className="block mt-2">
              <Button variant="link" size="sm" className="text-amber-600 p-0 h-auto">
                View all scholarships <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Courses */}
        {personalizedCourses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-slate-900">Relevant Courses</h4>
            </div>
            <div className="space-y-2">
              {personalizedCourses.map(c => (
                <Link key={c.id} to={createPageUrl('CourseDetails') + `?id=${c.id}`}>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                    <h5 className="font-medium text-slate-900 text-sm mb-1">{c.course_title}</h5>
                    <p className="text-xs text-slate-600">{c.subject_area} • {c.level}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link to={createPageUrl('Courses')} className="block mt-2">
              <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                Explore more courses <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Alumni */}
        {personalizedAlumni.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-purple-500" />
              <h4 className="font-semibold text-slate-900">Connect with Alumni</h4>
            </div>
            <div className="space-y-2">
              {personalizedAlumni.map(a => (
                <div key={a.id} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-semibold">
                      {a.first_name?.[0]}{a.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-900 text-sm">{a.first_name} {a.last_name}</h5>
                      <p className="text-xs text-slate-600">{a.subject_area}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to={createPageUrl('AlumniNetwork')} className="block mt-2">
              <Button variant="link" size="sm" className="text-purple-600 p-0 h-auto">
                View all alumni <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Empty State */}
        {personalizedScholarships.length === 0 && personalizedCourses.length === 0 && personalizedAlumni.length === 0 && (
          <div className="text-center py-6">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-900 mb-1">Complete your profile</h4>
            <p className="text-slate-500 text-sm mb-4">
              Add your study preferences to see personalized recommendations
            </p>
            <Link to={createPageUrl('MyProfile')}>
              <Button size="sm">Update Profile</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}