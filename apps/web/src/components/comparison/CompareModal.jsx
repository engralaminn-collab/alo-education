import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GraduationCap, MapPin, DollarSign, Calendar, CheckCircle, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CompareModal({ items, type, isOpen, onClose, universities = [] }) {
  if (!items || items.length === 0) return null;

  const getUniversity = (universityId) => {
    return universities.find(u => u.id === universityId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: '#0066CC' }}>
            Compare {type === 'course' ? 'Courses' : 'Universities'}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2" style={{ borderColor: '#0066CC' }}>
                <th className="p-4 text-left font-semibold w-48">Details</th>
                {items.map((item, idx) => (
                  <th key={idx} className="p-4 text-center min-w-64">
                    <div className="space-y-2">
                      {type === 'course' ? (
                        <>
                          <Link to={createPageUrl('CourseDetailsPage') + `?id=${item.id}`}>
                            <h3 className="font-bold text-sm hover:text-[#F37021]" style={{ color: '#0066CC' }}>
                              {item.course_title}
                            </h3>
                          </Link>
                          {getUniversity(item.university_id) && (
                            <p className="text-xs text-slate-600">
                              {getUniversity(item.university_id).university_name}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {item.logo && (
                            <img src={item.logo} alt={item.university_name} className="h-12 w-auto mx-auto object-contain" />
                          )}
                          <Link to={createPageUrl('UniversityDetailsPage') + `?id=${item.id}`}>
                            <h3 className="font-bold text-sm hover:text-[#F37021]" style={{ color: '#0066CC' }}>
                              {item.university_name}
                            </h3>
                          </Link>
                        </>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {type === 'course' ? (
                <>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" style={{ color: '#F37021' }} />
                      Level
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        <Badge style={{ backgroundColor: '#0066CC', color: 'white' }}>
                          {item.level}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4" style={{ color: '#F37021' }} />
                      Tuition Fee
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.tuition_fee_min && item.tuition_fee_max ? (
                          <div>
                            <p className="font-semibold">
                              £{item.tuition_fee_min.toLocaleString()} - £{item.tuition_fee_max.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">{item.currency || 'GBP'}</p>
                          </div>
                        ) : (
                          <p className="text-slate-400">N/A</p>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: '#F37021' }} />
                      Duration
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.duration || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: '#F37021' }} />
                      Intake
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.intake || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      Application Deadline
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        <span className={item.application_deadline ? 'text-red-600 font-semibold' : 'text-slate-400'}>
                          {item.application_deadline || 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">IELTS Requirements</td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.ielts_required ? (
                          <div>
                            <p className="font-semibold">Overall: {item.ielts_overall || 'N/A'}</p>
                            <p className="text-sm text-slate-600">Each band: {item.ielts_min_each || 'N/A'}</p>
                          </div>
                        ) : (
                          <p className="text-slate-400">Not specified</p>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">Entry Requirements</td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {item.entry_requirements || 'N/A'}
                        </p>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Scholarship
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.scholarship_available ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                </>
              ) : (
                <>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#F37021' }} />
                      Location
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.city}, {item.country}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <Award className="w-4 h-4" style={{ color: '#F37021' }} />
                      World Ranking
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.ranking ? (
                          <span className="font-bold text-lg" style={{ color: '#F37021' }}>
                            #{item.ranking}
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">QS Ranking</td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.qs_ranking ? `#${item.qs_ranking}` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: '#F37021' }} />
                      Intakes
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.intakes || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      Application Deadline
                    </td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        <span className={item.application_deadline ? 'text-red-600 font-semibold' : 'text-slate-400'}>
                          {item.application_deadline || 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">Student Population</td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.student_population ? item.student_population.toLocaleString() : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">International Students</td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.international_students_percent ? `${item.international_students_percent}%` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-4 font-semibold">Acceptance Rate</td>
                    {items.map((item, idx) => (
                      <td key={idx} className="p-4 text-center">
                        {item.acceptance_rate ? `${item.acceptance_rate}%` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </>
              )}
              <tr>
                <td className="p-4 font-semibold">Actions</td>
                {items.map((item, idx) => (
                  <td key={idx} className="p-4 text-center">
                    <Link to={createPageUrl(type === 'course' ? 'CourseDetailsPage' : 'UniversityDetailsPage') + `?id=${item.id}`}>
                      <Button className="w-full mb-2" style={{ backgroundColor: '#0066CC' }}>
                        View Details
                      </Button>
                    </Link>
                    {type === 'course' && (
                      <Link to={createPageUrl('ApplicationForm')}>
                        <Button className="w-full" style={{ backgroundColor: '#F37021' }}>
                          Apply Now
                        </Button>
                      </Link>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}