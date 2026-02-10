import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Download, FileText, TrendingUp, Users, 
  Filter, Calendar, Loader2, BarChart3 
} from 'lucide-react';
import CRMLayout from '@/components/crm/CRMLayout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const [reportType, setReportType] = useState('conversion_analysis');
  const [filters, setFilters] = useState({
    counselor_id: '',
    status: '',
    country: '',
    date_from: '',
    date_to: ''
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors-list'],
    queryFn: () => base44.entities.Counselor.list()
  });

  const generateReport = useMutation({
    mutationFn: async (format) => {
      const response = await base44.functions.invoke('generateCustomReport', {
        report_type: reportType,
        filters: Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
        format,
        date_from: filters.date_from,
        date_to: filters.date_to
      });
      return response.data;
    },
    onSuccess: (data, format) => {
      if (format === 'csv') {
        toast.success('CSV report downloaded');
      } else {
        toast.success('Report generated');
      }
    },
    onError: () => {
      toast.error('Failed to generate report');
    }
  });

  const [reportData, setReportData] = useState(null);

  const handleGenerate = async () => {
    const data = await generateReport.mutateAsync('json');
    setReportData(data);
  };

  const handleDownloadCSV = async () => {
    await generateReport.mutateAsync('csv');
  };

  return (
    <CRMLayout title="Analytics & Reports">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-0 shadow-sm dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Filter className="w-5 h-5 text-education-blue" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium dark:text-white">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="mt-1 dark:bg-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversion_analysis">Conversion Analysis</SelectItem>
                    <SelectItem value="pipeline_overview">Pipeline Overview</SelectItem>
                    <SelectItem value="country_distribution">Country Distribution</SelectItem>
                    <SelectItem value="monthly_trends">Monthly Trends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium dark:text-white">Counselor</label>
                <Select value={filters.counselor_id} onValueChange={(v) => setFilters({...filters, counselor_id: v})}>
                  <SelectTrigger className="mt-1 dark:bg-slate-700">
                    <SelectValue placeholder="All Counselors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Counselors</SelectItem>
                    {counselors.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium dark:text-white">Student Status</label>
                <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                  <SelectTrigger className="mt-1 dark:bg-slate-700">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Status</SelectItem>
                    <SelectItem value="new_lead">New Lead</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium dark:text-white">Date From</label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                  className="mt-1 dark:bg-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium dark:text-white">Date To</label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                  className="mt-1 dark:bg-slate-700"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate} 
                disabled={generateReport.isPending}
                className="bg-education-blue select-none"
              >
                {generateReport.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><BarChart3 className="w-4 h-4 mr-2" /> Generate Report</>
                )}
              </Button>
              <Button 
                onClick={handleDownloadCSV}
                disabled={generateReport.isPending}
                variant="outline"
                className="select-none dark:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Results */}
        {reportData && (
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-white">{reportData.report_name}</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Generated: {new Date(reportData.generated_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              {reportData.summary && (
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 dark:bg-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Students</p>
                    <h3 className="text-2xl font-bold dark:text-white">{reportData.summary.total_students}</h3>
                  </Card>
                  <Card className="p-4 dark:bg-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enrolled</p>
                    <h3 className="text-2xl font-bold text-emerald-600">{reportData.summary.enrolled_students}</h3>
                  </Card>
                  <Card className="p-4 dark:bg-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Conversion Rate</p>
                    <h3 className="text-2xl font-bold text-education-blue">{reportData.summary.conversion_rate}%</h3>
                  </Card>
                </div>
              )}

              {/* Charts */}
              {reportData.by_counselor && (
                <div>
                  <h4 className="font-semibold mb-4 dark:text-white">Performance by Counselor</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.by_counselor}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="counselor_name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_students" fill="#0066CC" name="Total Students" />
                      <Bar dataKey="enrolled" fill="#10b981" name="Enrolled" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {reportData.trends && (
                <div>
                  <h4 className="font-semibold mb-4 dark:text-white">Monthly Trends</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total_students" stroke="#0066CC" name="Total Students" />
                      <Line type="monotone" dataKey="enrolled" stroke="#10b981" name="Enrolled" />
                      <Line type="monotone" dataKey="conversion_rate" stroke="#f59e0b" name="Conversion %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {reportData.pipeline && (
                <div>
                  <h4 className="font-semibold mb-4 dark:text-white">Pipeline Overview</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    {reportData.pipeline.map((stage, i) => (
                      <Card key={i} className="p-4 dark:bg-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stage.stage}</p>
                        <h3 className="text-2xl font-bold dark:text-white">{stage.count}</h3>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {reportData.by_country && (
                <div>
                  <h4 className="font-semibold mb-4 dark:text-white">Top Destinations</h4>
                  <div className="space-y-2">
                    {reportData.by_country.slice(0, 10).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <span className="font-medium dark:text-white">{item.country}</span>
                        <Badge>{item.count} students</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </CRMLayout>
  );
}