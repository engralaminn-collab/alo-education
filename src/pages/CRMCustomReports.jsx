import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Filter, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import CRMLayout from '@/components/crm/CRMLayout';

export default function CRMCustomReports() {
  const [reportName, setReportName] = useState('');
  const [filters, setFilters] = useState({
    status: [],
    country: [],
    studyLevel: [],
    dateFrom: '',
    dateTo: '',
    minAge: '',
    maxAge: ''
  });
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: applications = [] } = useQuery({
    queryKey: ['report-applications'],
    queryFn: () => base44.entities.Application.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['report-students'],
    queryFn: () => base44.entities.StudentProfile.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['report-courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const statuses = ['lead', 'profile_ready', 'ready_to_apply', 'applied', 'offer', 'cas_issued', 'visa_applied', 'visa_approved', 'enrolled'];
  const countries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'Ireland'];
  const levels = ['Foundation', 'Undergraduate', 'Postgraduate', 'PhD'];

  const generateReport = async () => {
    setGenerating(true);
    try {
      let filteredApps = [...applications];

      // Apply filters
      if (filters.status.length > 0) {
        filteredApps = filteredApps.filter(a => filters.status.includes(a.status));
      }
      if (filters.country.length > 0) {
        filteredApps = filteredApps.filter(a => filters.country.includes(a.destination_country));
      }
      if (filters.studyLevel.length > 0) {
        filteredApps = filteredApps.filter(a => filters.studyLevel.includes(a.study_level));
      }
      if (filters.dateFrom) {
        filteredApps = filteredApps.filter(a => new Date(a.created_date) >= new Date(filters.dateFrom));
      }
      if (filters.dateTo) {
        filteredApps = filteredApps.filter(a => new Date(a.created_date) <= new Date(filters.dateTo));
      }

      // Get student details
      const reportData = filteredApps.map(app => {
        const student = students.find(s => s.id === app.student_id);
        const course = courses.find(c => c.id === app.course_id);
        return {
          studentName: `${student?.first_name || ''} ${student?.last_name || ''}`,
          email: student?.email,
          courseName: course?.course_title,
          destination: app.destination_country,
          status: app.status,
          appliedDate: new Date(app.created_date).toLocaleDateString(),
          counselor: app.assigned_counsellor
        };
      });

      setResults({
        data: reportData,
        summary: {
          totalRecords: reportData.length,
          statusBreakdown: filteredApps.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
          }, {}),
          countryBreakdown: filteredApps.reduce((acc, app) => {
            acc[app.destination_country] = (acc[app.destination_country] || 0) + 1;
            return acc;
          }, {})
        }
      });

      toast.success(`Report generated with ${reportData.length} records`);
    } catch (error) {
      toast.error('Failed to generate report');
    }
    setGenerating(false);
  };

  const exportToCSV = () => {
    if (!results) return;

    const headers = ['Student Name', 'Email', 'Course', 'Destination', 'Status', 'Applied Date', 'Counselor'];
    const rows = results.data.map(r => [
      r.studentName, r.email, r.courseName, r.destination, r.status, r.appliedDate, r.counselor
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName || 'report'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <CRMLayout currentPage="Custom Reports">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Custom Reports</h1>
          <p className="text-slate-600">Generate detailed reports with custom filters</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Filters Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Report Name</Label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., UK Applications Q4"
                />
              </div>

              <div>
                <Label className="mb-3 block">Application Status</Label>
                <div className="space-y-2">
                  {statuses.map(status => (
                    <div key={status} className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.status.includes(status)}
                        onCheckedChange={(checked) => {
                          setFilters({
                            ...filters,
                            status: checked 
                              ? [...filters.status, status]
                              : filters.status.filter(s => s !== status)
                          });
                        }}
                      />
                      <label className="text-sm cursor-pointer">
                        {status.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Destination Country</Label>
                <div className="space-y-2">
                  {countries.map(country => (
                    <div key={country} className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.country.includes(country)}
                        onCheckedChange={(checked) => {
                          setFilters({
                            ...filters,
                            country: checked 
                              ? [...filters.country, country]
                              : filters.country.filter(c => c !== country)
                          });
                        }}
                      />
                      <label className="text-sm cursor-pointer">{country}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Study Level</Label>
                <div className="space-y-2">
                  {levels.map(level => (
                    <div key={level} className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.studyLevel.includes(level)}
                        onCheckedChange={(checked) => {
                          setFilters({
                            ...filters,
                            studyLevel: checked 
                              ? [...filters.studyLevel, level]
                              : filters.studyLevel.filter(l => l !== level)
                          });
                        }}
                      />
                      <label className="text-sm cursor-pointer">{level}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={generateReport}
                disabled={generating}
                className="w-full"
                style={{ backgroundColor: '#F37021' }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {results ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Report Summary</CardTitle>
                      <Button onClick={exportToCSV} variant="outline">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-slate-600">Total Records</p>
                        <p className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                          {results.summary.totalRecords}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-slate-600">Top Status</p>
                        <p className="text-xl font-bold" style={{ color: '#F37021' }}>
                          {Object.entries(results.summary.statusBreakdown)
                            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-slate-600">Top Destination</p>
                        <p className="text-xl font-bold text-green-600">
                          {Object.entries(results.summary.countryBreakdown)
                            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="p-3 text-left text-sm font-semibold">Student</th>
                            <th className="p-3 text-left text-sm font-semibold">Course</th>
                            <th className="p-3 text-left text-sm font-semibold">Destination</th>
                            <th className="p-3 text-left text-sm font-semibold">Status</th>
                            <th className="p-3 text-left text-sm font-semibold">Applied</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.data.slice(0, 50).map((row, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-3">
                                <div>
                                  <p className="font-medium">{row.studentName}</p>
                                  <p className="text-xs text-slate-600">{row.email}</p>
                                </div>
                              </td>
                              <td className="p-3 text-sm">{row.courseName}</td>
                              <td className="p-3 text-sm">{row.destination}</td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {row.status}
                                </span>
                              </td>
                              <td className="p-3 text-sm">{row.appliedDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-20 text-center">
                  <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Report Generated</h3>
                  <p className="text-slate-600">
                    Select filters and click "Generate Report" to see results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}