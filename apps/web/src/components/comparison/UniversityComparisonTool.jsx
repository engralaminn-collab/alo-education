import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GitCompare, CheckCircle, XCircle, MapPin, Globe, DollarSign, Users, Award, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UniversityComparisonTool({ initialIds = [], onClose }) {
  const [selectedIds, setSelectedIds] = useState(initialIds);

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-comparison'],
    queryFn: () => base44.entities.University.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-comparison'],
    queryFn: () => base44.entities.Course.list(),
  });

  const selectedUniversities = universities.filter(u => selectedIds.includes(u.id));

  const removeUniversity = (id) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const addUniversity = (id) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getUniversityCourses = (uniId) => {
    return courses.filter(c => c.university_id === uniId);
  };

  if (selectedUniversities.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Select Universities to Compare</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {universities.slice(0, 20).map(uni => (
                <div
                  key={uni.id}
                  onClick={() => addUniversity(uni.id)}
                  className="border rounded-lg p-4 cursor-pointer hover:border-blue-600 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    {uni.logo && <img src={uni.logo} alt="" className="w-12 h-12 object-contain" />}
                    <div>
                      <h4 className="font-semibold">{uni.university_name}</h4>
                      <p className="text-sm text-slate-600">{uni.city}, {uni.country}</p>
                    </div>
                  </div>
                </div>
              ))}
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
              University Comparison
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
                  {selectedUniversities.map(uni => (
                    <th key={uni.id} className="p-4 text-center min-w-[250px]">
                      <div className="flex flex-col items-center gap-2">
                        {uni.logo && <img src={uni.logo} alt="" className="w-16 h-16 object-contain" />}
                        <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`} className="font-semibold hover:text-blue-600">
                          {uni.university_name}
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUniversity(uni.id)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Location */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <MapPin className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    Location
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.city}, {uni.country}
                    </td>
                  ))}
                </tr>

                {/* World Ranking */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <Award className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    World Ranking
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.ranking ? (
                        <span className="font-bold text-lg" style={{ color: '#0066CC' }}>#{uni.ranking}</span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* QS Ranking */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">QS Ranking</td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.qs_ranking ? `#${uni.qs_ranking}` : <span className="text-slate-400">N/A</span>}
                    </td>
                  ))}
                </tr>

                {/* Student Population */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <Users className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    Student Population
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.student_population ? uni.student_population.toLocaleString() : <span className="text-slate-400">N/A</span>}
                    </td>
                  ))}
                </tr>

                {/* International Students */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <Globe className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    International Students
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.international_students_percent ? `${uni.international_students_percent}%` : <span className="text-slate-400">N/A</span>}
                    </td>
                  ))}
                </tr>

                {/* Acceptance Rate */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">Acceptance Rate</td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.acceptance_rate ? `${uni.acceptance_rate}%` : <span className="text-slate-400">N/A</span>}
                    </td>
                  ))}
                </tr>

                {/* Intakes */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">
                    <Calendar className="w-4 h-4 inline mr-2" style={{ color: '#F37021' }} />
                    Intakes
                  </td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.intakes || 'Jan, Sep'}
                    </td>
                  ))}
                </tr>

                {/* Available Courses */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">Available Courses</td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      <span className="font-semibold text-lg" style={{ color: '#0066CC' }}>
                        {getUniversityCourses(uni.id).length}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">courses</div>
                    </td>
                  ))}
                </tr>

                {/* Entry Requirements */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">Entry Requirements Summary</td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-sm">
                      {uni.entry_requirements_summary ? (
                        <div className="text-left max-w-xs mx-auto">{uni.entry_requirements_summary.substring(0, 150)}...</div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Scholarships */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-white">Scholarships Available</td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      {uni.scholarships_summary ? (
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-6 h-6 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Action */}
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium sticky left-0 bg-slate-50"></td>
                  {selectedUniversities.map(uni => (
                    <td key={uni.id} className="p-4 text-center">
                      <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                        <Button className="w-full" style={{ backgroundColor: '#F37021' }}>
                          View Details
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {selectedIds.length < 4 && (
            <div className="p-6 border-t bg-slate-50">
              <p className="text-center text-slate-600 mb-4">
                Add up to {4 - selectedIds.length} more {selectedIds.length < 3 ? 'universities' : 'university'}
              </p>
              <div className="grid md:grid-cols-4 gap-3">
                {universities.filter(u => !selectedIds.includes(u.id)).slice(0, 8).map(uni => (
                  <button
                    key={uni.id}
                    onClick={() => addUniversity(uni.id)}
                    className="border rounded-lg p-3 hover:border-blue-600 hover:shadow-md transition-all text-left"
                  >
                    <p className="font-semibold text-sm">{uni.university_name}</p>
                    <p className="text-xs text-slate-600">{uni.country}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}