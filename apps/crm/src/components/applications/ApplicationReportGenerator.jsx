import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Download, FileText, Loader2, BarChart3, PieChart, 
  TrendingUp, Users, Building2, CheckCircle 
} from 'lucide-react';
import { format } from 'date-fns';

export default function ApplicationReportGenerator() {
  const [reportType, setReportType] = useState('summary');
  const [studentFilter, setStudentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-report'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-report'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-report'],
    queryFn: () => base44.entities.University.list()
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-report'],
    queryFn: () => base44.entities.Course.list()
  });

  const generateReport = useMutation({
    mutationFn: async () => {
      const universityMap = universities.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
      const courseMap = courses.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
      const studentMap = students.reduce((acc, s) => ({ ...acc, [s.id]: s }), {});

      let filteredApps = applications;
      
      if (studentFilter !== 'all') {
        filteredApps = filteredApps.filter(a => a.student_id === studentFilter);
      }
      
      if (statusFilter !== 'all') {
        filteredApps = filteredApps.filter(a => a.status === statusFilter);
      }

      const enrichedData = filteredApps.map(app => ({
        ...app,
        university_name: universityMap[app.university_id]?.university_name,
        course_title: courseMap[app.course_id]?.course_title,
        student_name: `${studentMap[app.student_id]?.first_name} ${studentMap[app.student_id]?.last_name}`,
        student_email: studentMap[app.student_id]?.email,
      }));

      if (reportType === 'summary') {
        return generateSummaryReport(enrichedData);
      } else if (reportType === 'detailed') {
        return generateDetailedReport(enrichedData);
      } else {
        return generateStudentReport(enrichedData, studentMap[studentFilter]);
      }
    },
    onSuccess: (reportData) => {
      downloadReport(reportData);
      toast.success('Report generated successfully!');
    }
  });

  const generateSummaryReport = (apps) => {
    const statusCounts = {};
    apps.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const universityCounts = {};
    apps.forEach(app => {
      universityCounts[app.university_name] = (universityCounts[app.university_name] || 0) + 1;
    });

    return {
      type: 'summary',
      generated_date: format(new Date(), 'MMMM d, yyyy'),
      total_applications: apps.length,
      status_breakdown: statusCounts,
      university_breakdown: universityCounts,
      acceptance_rate: ((statusCounts.unconditional_offer || 0) + (statusCounts.conditional_offer || 0)) / apps.length * 100,
    };
  };

  const generateDetailedReport = (apps) => {
    return {
      type: 'detailed',
      generated_date: format(new Date(), 'MMMM d, yyyy'),
      applications: apps.map(app => ({
        student: app.student_name,
        email: app.student_email,
        course: app.course_title,
        university: app.university_name,
        status: app.status,
        applied_date: app.applied_date ? format(new Date(app.applied_date), 'MMM d, yyyy') : 'N/A',
        offer_date: app.offer_date ? format(new Date(app.offer_date), 'MMM d, yyyy') : 'N/A',
      }))
    };
  };

  const generateStudentReport = (apps, student) => {
    return {
      type: 'student',
      generated_date: format(new Date(), 'MMMM d, yyyy'),
      student_name: `${student?.first_name} ${student?.last_name}`,
      student_email: student?.email,
      total_applications: apps.length,
      applications: apps.map(app => ({
        course: app.course_title,
        university: app.university_name,
        status: app.status,
        applied_date: app.applied_date ? format(new Date(app.applied_date), 'MMM d, yyyy') : 'N/A',
        intake: app.intake,
        milestones: app.milestones,
      }))
    };
  };

  const downloadReport = (reportData) => {
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['draft', 'documents_pending', 'under_review'].includes(a.status)).length,
    offers: applications.filter(a => ['conditional_offer', 'unconditional_offer'].includes(a.status)).length,
    enrolled: applications.filter(a => a.status === 'enrolled').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-xs text-slate-600">Total Applications</div>
              </div>
              <FileText className="w-8 h-8 text-education-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                <div className="text-xs text-slate-600">In Progress</div>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
                <div className="text-xs text-slate-600">Offers Received</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-education-blue">{stats.enrolled}</div>
                <div className="text-xs text-slate-600">Enrolled</div>
              </div>
              <Users className="w-8 h-8 text-education-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Report Type
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Summary Report
                    </div>
                  </SelectItem>
                  <SelectItem value="detailed">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Detailed Report
                    </div>
                  </SelectItem>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Student Report
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'student' && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Select Student
                </label>
                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Filter by Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="submitted_to_university">Submitted</SelectItem>
                  <SelectItem value="conditional_offer">Conditional Offer</SelectItem>
                  <SelectItem value="unconditional_offer">Unconditional Offer</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateReport.mutate()}
            disabled={generateReport.isPending || (reportType === 'student' && studentFilter === 'all')}
            className="w-full bg-gradient-brand"
            size="lg"
          >
            {generateReport.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" />Generate & Download Report</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-education-blue" />
                  Status Distribution
                </h4>
                <div className="space-y-2">
                  {Object.entries(
                    applications.reduce((acc, app) => {
                      acc[app.status] = (acc[app.status] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 capitalize">{status.replace(/_/g, ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-education-blue" />
                  Top Universities
                </h4>
                <div className="space-y-2">
                  {Object.entries(
                    applications.reduce((acc, app) => {
                      const uni = universities.find(u => u.id === app.university_id);
                      if (uni) {
                        acc[uni.university_name] = (acc[uni.university_name] || 0) + 1;
                      }
                      return acc;
                    }, {})
                  )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([uni, count]) => (
                    <div key={uni} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 truncate">{uni}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}