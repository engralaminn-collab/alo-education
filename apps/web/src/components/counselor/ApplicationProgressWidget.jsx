import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from 'lucide-react';

export default function ApplicationProgressWidget({ counselorId }) {
  const { data: studentProfiles = [] } = useQuery({
    queryKey: ['assigned-students', counselorId],
    queryFn: () => base44.entities.StudentProfile.filter({ counselor_id: counselorId }),
    enabled: !!counselorId,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-for-students'],
    queryFn: async () => {
      const allApps = await base44.entities.Application.list();
      const studentIds = studentProfiles.map(s => s.id);
      return allApps.filter(a => studentIds.includes(a.student_id));
    },
    enabled: studentProfiles.length > 0,
  });

  const stats = {
    total: applications.length,
    draft: applications.filter(a => a.status === 'draft').length,
    submitted: applications.filter(a => a.status === 'submitted_to_university').length,
    offers: applications.filter(a => a.status.includes('offer')).length,
    enrolled: applications.filter(a => a.status === 'enrolled').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const successRate = stats.total > 0 
    ? Math.round(((stats.offers + stats.enrolled) / stats.total) * 100)
    : 0;

  const statusBreakdown = [
    { label: 'Draft', value: stats.draft, color: 'bg-slate-400' },
    { label: 'Submitted', value: stats.submitted, color: 'bg-blue-400' },
    { label: 'Offers', value: stats.offers, color: 'bg-green-400' },
    { label: 'Enrolled', value: stats.enrolled, color: 'bg-emerald-600' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-red-400' },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Application Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-slate-600">Total Applications</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{successRate}%</p>
            <p className="text-sm text-slate-600">Success Rate</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Status Breakdown</p>
          {statusBreakdown.map((status) => (
            <div key={status.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">{status.label}</span>
                <span className="text-xs font-bold text-slate-900">{status.value}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`${status.color} h-2 rounded-full transition-all`}
                  style={{ width: `${stats.total > 0 ? (status.value / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Student Count */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Assigned Students</span>
            <Badge className="bg-blue-100 text-blue-800">
              {studentProfiles.length}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}