import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, DollarSign, Award, Users, BookOpen, MapPin, Star, ExternalLink } from 'lucide-react';

export default function ComparisonDisplay({ universities, courses, scholarships }) {
  if (universities.length === 0) {
    return (
      <Card className="border-0 shadow-sm text-center py-12">
        <p className="text-slate-500">Select universities to begin comparison</p>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="rankings">Rankings</TabsTrigger>
        <TabsTrigger value="courses">Courses & Fees</TabsTrigger>
        <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${universities.length}, 1fr)` }}>
            {universities.map(uni => (
              <Card key={uni.id} className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-education-blue">{uni.university_name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{uni.city}, {uni.country}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Stats */}
                  <div className="space-y-3">
                    {uni.ranking && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Global Ranking</span>
                        <Badge className="bg-blue-100 text-blue-800">#{uni.ranking}</Badge>
                      </div>
                    )}
                    {uni.student_population && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Student Population</span>
                        <span className="text-sm font-semibold">{uni.student_population.toLocaleString()}</span>
                      </div>
                    )}
                    {uni.international_students_percent && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">International Students</span>
                        <span className="text-sm font-semibold">{uni.international_students_percent}%</span>
                      </div>
                    )}
                    {uni.acceptance_rate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Acceptance Rate</span>
                        <span className="text-sm font-semibold">{uni.acceptance_rate}%</span>
                      </div>
                    )}
                  </div>

                  {/* About */}
                  {uni.about && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-slate-600 line-clamp-3">{uni.about}</p>
                    </div>
                  )}

                  {/* Link */}
                  {uni.website_url && (
                    <a href={uni.website_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full text-xs gap-1">
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Rankings Tab */}
      <TabsContent value="rankings" className="space-y-6">
        <div className="overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${universities.length}, 1fr)` }}>
            {universities.map(uni => (
              <Card key={uni.id} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm">{uni.university_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">QS World Ranking</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      {uni.qs_ranking ? `#${uni.qs_ranking}` : 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Times Higher Education</p>
                    <Badge className="bg-purple-100 text-purple-800">
                      {uni.times_ranking ? `#${uni.times_ranking}` : 'N/A'}
                    </Badge>
                  </div>
                  
                  {uni.program_rankings && Object.keys(uni.program_rankings).length > 0 && (
                    <div className="pt-3 border-t space-y-2">
                      <p className="text-xs font-semibold text-slate-900">Subject Rankings:</p>
                      {Object.entries(uni.program_rankings).map(([subject, rank]) => 
                        rank && (
                          <div key={subject} className="flex justify-between text-xs">
                            <span className="text-slate-600 capitalize">{subject.replace(/_/g, ' ')}</span>
                            <span className="font-semibold">#{rank}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Courses & Fees Tab */}
      <TabsContent value="courses" className="space-y-6">
        <div className="overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${universities.length}, 1fr)` }}>
            {universities.map(uni => {
              const uniCourses = courses.filter(c => c.university_id === uni.id);
              return (
                <Card key={uni.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm">{uni.university_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {uni.intakes && (
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Intakes</p>
                        <p className="text-sm font-semibold">{uni.intakes}</p>
                      </div>
                    )}
                    
                    {uniCourses.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-900 mb-2">Courses</p>
                        <div className="space-y-2">
                          {uniCourses.slice(0, 3).map(course => (
                            <div key={course.id} className="text-xs border-l-2 border-education-blue pl-2">
                              <p className="font-medium text-slate-900 truncate">{course.course_title}</p>
                              {course.tuition_fee_min && (
                                <p className="text-slate-600">
                                  ${course.tuition_fee_min.toLocaleString()} - ${course.tuition_fee_max?.toLocaleString()}
                                </p>
                              )}
                            </div>
                          ))}
                          {uniCourses.length > 3 && (
                            <p className="text-xs text-slate-500">+{uniCourses.length - 3} more courses</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </TabsContent>

      {/* Scholarships Tab */}
      <TabsContent value="scholarships" className="space-y-6">
        <div className="overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${universities.length}, 1fr)` }}>
            {universities.map(uni => {
              const uniScholarships = scholarships.filter(s => s.university_id === uni.id);
              return (
                <Card key={uni.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm">{uni.university_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {uniScholarships.length === 0 ? (
                      <p className="text-xs text-slate-500">No scholarships found</p>
                    ) : (
                      <div className="space-y-3">
                        {uniScholarships.slice(0, 3).map(sch => (
                          <div key={sch.id} className="border-l-2 border-alo-orange pl-2">
                            <p className="text-xs font-semibold text-slate-900 truncate">{sch.scholarship_name}</p>
                            <Badge className="mt-1 text-xs bg-orange-100 text-orange-800">
                              {sch.amount_type}
                            </Badge>
                            <p className="text-xs text-slate-600 mt-1">
                              {sch.amount} {sch.currency}
                            </p>
                          </div>
                        ))}
                        {uniScholarships.length > 3 && (
                          <p className="text-xs text-slate-500">+{uniScholarships.length - 3} more scholarships</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}