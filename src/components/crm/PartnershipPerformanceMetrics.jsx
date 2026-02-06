import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Award } from 'lucide-react';

export default function PartnershipPerformanceMetrics({ agreements, applications, universities }) {
  // Calculate metrics per university
  const universityMetrics = universities.map(uni => {
    const uniAgreements = agreements.filter(a => a.university_id === uni.id && a.status === 'active');
    const uniApplications = applications.filter(a => a.university_id === uni.id);
    const enrolledApps = uniApplications.filter(a => a.status === 'enrolled');
    const avgCommission = uniAgreements.length > 0 
      ? uniAgreements.reduce((sum, a) => sum + (a.commission_rate || 0), 0) / uniAgreements.length 
      : 0;
    const estimatedRevenue = enrolledApps.length * 15000 * (avgCommission / 100);

    return {
      university: uni,
      activeAgreements: uniAgreements.length,
      totalApplications: uniApplications.length,
      enrolledStudents: enrolledApps.length,
      conversionRate: uniApplications.length > 0 ? (enrolledApps.length / uniApplications.length) * 100 : 0,
      avgCommission,
      estimatedRevenue
    };
  }).filter(m => m.activeAgreements > 0 || m.totalApplications > 0)
    .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue);

  const totalRevenue = universityMetrics.reduce((sum, m) => sum + m.estimatedRevenue, 0);
  const totalEnrolled = universityMetrics.reduce((sum, m) => sum + m.enrolledStudents, 0);
  const avgConversionRate = universityMetrics.length > 0
    ? universityMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / universityMetrics.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Est. Revenue</p>
                <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Enrolled</p>
                <p className="text-3xl font-bold text-blue-600">{totalEnrolled}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{avgConversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Partnerships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {universityMetrics.slice(0, 10).map((metric, index) => (
              <div key={metric.university.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{metric.university.university_name}</h4>
                      <p className="text-sm text-slate-600">{metric.university.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${metric.estimatedRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Est. Revenue</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Applications</p>
                    <p className="font-semibold">{metric.totalApplications}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Enrolled</p>
                    <p className="font-semibold text-green-600">{metric.enrolledStudents}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conversion</p>
                    <p className="font-semibold text-blue-600">{metric.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Commission</p>
                    <p className="font-semibold text-purple-600">{metric.avgCommission.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}

            {universityMetrics.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}