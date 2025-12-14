import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, TrendingUp, Users, DollarSign, Globe, Award, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UniversityComparisonModal({ universities, onClose, open }) {
  if (!universities || universities.length === 0) return null;

  const comparisonData = [
    { label: 'Country', key: 'country', icon: Globe },
    { label: 'City', key: 'city', icon: MapPin },
    { label: 'World Ranking', key: 'ranking', icon: TrendingUp },
    { label: 'QS Ranking', key: 'qs_ranking', icon: Award },
    { label: 'THE Ranking', key: 'times_ranking', icon: Award },
    { label: 'Student Population', key: 'student_population', icon: Users },
    { label: 'International Students', key: 'international_students_percent', icon: Globe, suffix: '%' },
    { label: 'Acceptance Rate', key: 'acceptance_rate', icon: TrendingUp, suffix: '%' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Compare Universities</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-4 text-left font-semibold text-slate-700 min-w-[200px] sticky left-0 bg-white z-10">
                  Criteria
                </th>
                {universities.map((uni) => (
                  <th key={uni.id} className="p-4 text-center min-w-[200px]">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={uni.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.university_name)}&background=0066CC&color=fff&size=80`}
                        alt={uni.university_name}
                        className="w-16 h-16 object-contain rounded-lg"
                      />
                      <h3 className="font-bold text-sm text-slate-900">{uni.university_name}</h3>
                      <Link to={createPageUrl('UniversityDetailsPage') + `?id=${uni.id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-blue-600" />
                        {item.label}
                      </div>
                    </td>
                    {universities.map((uni) => {
                      const value = uni[item.key];
                      return (
                        <td key={uni.id} className="p-4 text-center">
                          {value !== undefined && value !== null ? (
                            <span className="text-slate-900">
                              {typeof value === 'number' ? value.toLocaleString() : value}
                              {item.suffix || ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    Status
                  </div>
                </td>
                {universities.map((uni) => (
                  <td key={uni.id} className="p-4 text-center">
                    <Badge className={uni.is_featured ? 'bg-emerald-500' : 'bg-slate-500'}>
                      {uni.is_featured ? 'Featured' : 'Standard'}
                    </Badge>
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