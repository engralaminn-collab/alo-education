import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, TrendingUp, Users, Target, Award } from 'lucide-react';

export default function CRMReportsAnalytics() {
  const { data: students = [] } = useQuery({
    queryKey: ['all-students-reports'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 500),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['all-applications-reports'],
    queryFn: () => base44.entities.Application.list('-created_date', 500),
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-reports'],
    queryFn: () => base44.entities.Counselor.list(),
  });

  // Lead Conversion Analysis
  const leadsByStatus = students.reduce((acc, student) => {
    const status = student.status || 'new_lead';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const conversionRate = students.length > 0 
    ? ((leadsByStatus['enrolled'] || 0) / students.length * 100).toFixed(1)
    : 0;

  // Lead Source Analysis
  const leadsBySource = students.reduce((acc, student) => {
    const source = student.lead_source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Counselor Performance
  const counselorStats = counselors.map(counselor => {
    const counselorStudents = students.filter(s => s.counselor_id === counselor.id);
    const counselorApps = applications.filter(a => 
      counselorStudents.some(s => s.id === a.student_id)
    );
    const enrolled = counselorApps.filter(a => a.status === 'enrolled').length;

    return {
      ...counselor,
      totalStudents: counselorStudents.length,
      applications: counselorApps.length,
      enrolled,
      conversionRate: counselorStudents.length > 0 
        ? (enrolled / counselorStudents.length * 100).toFixed(1)
        : 0
    };
  });

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Lead conversion, counselor performance, and source effectiveness</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Leads</p>
                  <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                    {students.length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Conversion Rate</p>
                  <p className="text-3xl font-bold text-green-600">
                    {conversionRate}%
                  </p>
                </div>
                <Target className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Applications</p>
                  <p className="text-3xl font-bold" style={{ color: '#F37021' }}>
                    {applications.filter(a => !['enrolled', 'rejected', 'withdrawn'].includes(a.status)).length}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Enrolled</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {leadsByStatus['enrolled'] || 0}
                  </p>
                </div>
                <Award className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conversion" className="space-y-6">
          <TabsList>
            <TabsTrigger value="conversion">Lead Conversion</TabsTrigger>
            <TabsTrigger value="sources">Lead Sources</TabsTrigger>
            <TabsTrigger value="counselors">Counselor Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="conversion">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(leadsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-32 text-sm font-medium text-slate-700">
                          {status.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div 
                            className="h-full flex items-center px-3 text-sm font-semibold text-white"
                            style={{ 
                              width: `${(count / students.length * 100)}%`,
                              backgroundColor: '#0066CC'
                            }}
                          >
                            {count}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-slate-600 ml-4">
                        {((count / students.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Lead Source Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(leadsBySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-32 text-sm font-medium text-slate-700">
                          {source}
                        </div>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div 
                            className="h-full flex items-center px-3 text-sm font-semibold text-white"
                            style={{ 
                              width: `${(count / students.length * 100)}%`,
                              backgroundColor: '#F37021'
                            }}
                          >
                            {count}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-slate-600 ml-4">
                        {((count / students.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counselors">
            <Card>
              <CardHeader>
                <CardTitle>Counselor Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {counselorStats.map((counselor) => (
                    <Card key={counselor.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900">{counselor.name}</h4>
                          <div className="text-sm font-medium text-green-600">
                            {counselor.conversionRate}% conversion
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Students</p>
                            <p className="text-lg font-semibold text-slate-900">{counselor.totalStudents}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Applications</p>
                            <p className="text-lg font-semibold text-slate-900">{counselor.applications}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Enrolled</p>
                            <p className="text-lg font-semibold text-emerald-600">{counselor.enrolled}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}