import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, BarChart3, TrendingUp, Building2, GraduationCap } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function CRMPerformanceReports() {
  const [filters, setFilters] = useState({
    office: 'all',
    counselor: 'all',
    subAgentType: 'all',
    destination: 'all',
    level: 'all',
    year: '2026'
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: counselors = [] } = useQuery({
    queryKey: ['counselors'],
    queryFn: () => base44.entities.Counselor.list()
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-report'],
    queryFn: () => base44.entities.Application.list()
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-report'],
    queryFn: () => base44.entities.StudentProfile.list()
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-report'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-report'],
    queryFn: () => base44.entities.University.list()
  });

  // Check if user is admin/manager
  const isManager = user?.role === 'admin';

  // Filter applications based on role and filters
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Role-based filtering
    if (!isManager) {
      // Counselors can only see their own students' applications
      const myCounselorRecord = counselors.find(c => c.user_id === user?.id);
      const myStudents = students.filter(s => s.counselor_id === myCounselorRecord?.user_id);
      const myStudentIds = myStudents.map(s => s.id);
      filtered = filtered.filter(app => myStudentIds.includes(app.student_id));
    }

    // Apply filters
    if (filters.counselor !== 'all') {
      const counselorStudents = students.filter(s => s.counselor_id === filters.counselor);
      const studentIds = counselorStudents.map(s => s.id);
      filtered = filtered.filter(app => studentIds.includes(app.student_id));
    }

    if (filters.destination !== 'all') {
      filtered = filtered.filter(app => {
        const course = courses.find(c => c.id === app.course_id);
        return course?.country === filters.destination;
      });
    }

    if (filters.level !== 'all') {
      filtered = filtered.filter(app => {
        const course = courses.find(c => c.id === app.course_id);
        return course?.level === filters.level;
      });
    }

    return filtered;
  }, [applications, filters, isManager, user, counselors, students, courses]);

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const stats = {
      uniqueStudents: Array(12).fill(0),
      applicationSent: Array(12).fill(0),
      decisionWaiting: Array(12).fill(0),
      conditionalOffer: Array(12).fill(0),
      unconditionalOffer: Array(12).fill(0),
      depositPaid: Array(12).fill(0),
      visaLetterReqSent: Array(12).fill(0),
      visaLetterReceived: Array(12).fill(0),
      studentJoined: Array(12).fill(0),
      visaReject: Array(12).fill(0),
      notEnrolled: Array(12).fill(0),
      declined: Array(12).fill(0),
      appWithdrawn: Array(12).fill(0),
      appRejection: Array(12).fill(0)
    };

    filteredApplications.forEach(app => {
      if (!app.applied_date) return;
      
      const date = new Date(app.applied_date);
      if (date.getFullYear().toString() !== filters.year) return;
      
      const monthIndex = date.getMonth();

      // Track unique students
      stats.uniqueStudents[monthIndex]++;

      // Application statuses
      if (app.status === 'submitted_to_university' || app.status === 'under_review') {
        stats.applicationSent[monthIndex]++;
        stats.decisionWaiting[monthIndex]++;
      }
      if (app.status === 'conditional_offer') {
        stats.conditionalOffer[monthIndex]++;
        stats.applicationSent[monthIndex]++;
      }
      if (app.status === 'unconditional_offer') {
        stats.unconditionalOffer[monthIndex]++;
        stats.applicationSent[monthIndex]++;
      }
      if (app.milestones?.offer_received?.completed) {
        stats.depositPaid[monthIndex]++;
      }
      if (app.status === 'visa_processing') {
        stats.visaLetterReqSent[monthIndex]++;
      }
      if (app.milestones?.visa_approved?.completed) {
        stats.visaLetterReceived[monthIndex]++;
      }
      if (app.status === 'enrolled') {
        stats.studentJoined[monthIndex]++;
      }
      if (app.visa_status === 'rejected') {
        stats.visaReject[monthIndex]++;
      }
      if (app.status === 'rejected') {
        stats.appRejection[monthIndex]++;
      }
      if (app.status === 'withdrawn') {
        stats.appWithdrawn[monthIndex]++;
        stats.declined[monthIndex]++;
      }
    });

    return stats;
  }, [filteredApplications, filters.year]);

  const exportToExcel = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const data = [
      ['ALO Education - Performance Report'],
      [`Year: ${filters.year}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      ['Categories', ...months, 'Total'],
      ['Unique Student', ...monthlyStats.uniqueStudents, monthlyStats.uniqueStudents.reduce((a, b) => a + b, 0)],
      [],
      ['Application Status'],
      ['Application Sent', ...monthlyStats.applicationSent, monthlyStats.applicationSent.reduce((a, b) => a + b, 0)],
      ['Decision Waiting', ...monthlyStats.decisionWaiting, monthlyStats.decisionWaiting.reduce((a, b) => a + b, 0)],
      ['Conditional Offer', ...monthlyStats.conditionalOffer, monthlyStats.conditionalOffer.reduce((a, b) => a + b, 0)],
      ['Unconditional Offer', ...monthlyStats.unconditionalOffer, monthlyStats.unconditionalOffer.reduce((a, b) => a + b, 0)],
      [],
      ['Visa Process'],
      ['Deposit Paid', ...monthlyStats.depositPaid, monthlyStats.depositPaid.reduce((a, b) => a + b, 0)],
      ['Visa Letter Req Sent', ...monthlyStats.visaLetterReqSent, monthlyStats.visaLetterReqSent.reduce((a, b) => a + b, 0)],
      ['Visa Letter Received', ...monthlyStats.visaLetterReceived, monthlyStats.visaLetterReceived.reduce((a, b) => a + b, 0)],
      ['Student Joined', ...monthlyStats.studentJoined, monthlyStats.studentJoined.reduce((a, b) => a + b, 0)],
      ['Visa Reject', ...monthlyStats.visaReject, monthlyStats.visaReject.reduce((a, b) => a + b, 0)],
      [],
      ['Negative Status'],
      ['Declined', ...monthlyStats.declined, monthlyStats.declined.reduce((a, b) => a + b, 0)],
      ['App Withdrawn', ...monthlyStats.appWithdrawn, monthlyStats.appWithdrawn.reduce((a, b) => a + b, 0)],
      ['App Rejection', ...monthlyStats.appRejection, monthlyStats.appRejection.reduce((a, b) => a + b, 0)]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Performance Report');
    XLSX.writeFile(wb, `ALO_Performance_Report_${filters.year}.xlsx`);
    toast.success('Report exported to Excel');
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <CRMLayout
      currentPage="Performance Reports"
      actions={
        <Button onClick={exportToExcel} variant="outline" className="bg-green-600 text-white hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Download as Excel
        </Button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Office</label>
                <Select value={filters.office} onValueChange={(v) => setFilters({ ...filters, office: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Office" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Offices</SelectItem>
                    <SelectItem value="dhaka">Dhaka</SelectItem>
                    <SelectItem value="chittagong">Chittagong</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isManager && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Counsellor</label>
                  <Select value={filters.counselor} onValueChange={(v) => setFilters({ ...filters, counselor: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Counsellor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Counsellors</SelectItem>
                      {counselors.map(c => (
                        <SelectItem key={c.id} value={c.user_id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Destination</label>
                <Select value={filters.destination} onValueChange={(v) => setFilters({ ...filters, destination: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Destinations</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Level</label>
                <Select value={filters.level} onValueChange={(v) => setFilters({ ...filters, level: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Year</label>
                <Select value={filters.year} onValueChange={(v) => setFilters({ ...filters, year: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="status-summary">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="status-summary">App Status Summary</TabsTrigger>
            <TabsTrigger value="comparison">App Status Comparison</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="business">Business Intelligence</TabsTrigger>
            <TabsTrigger value="destination">Destination</TabsTrigger>
            <TabsTrigger value="university">University</TabsTrigger>
          </TabsList>

          <TabsContent value="status-summary" className="space-y-6 mt-6">
            {/* Unique Students */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unique Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-3 font-semibold">Categories</th>
                        {months.map(m => <th key={m} className="text-center p-3 font-semibold">{m}</th>)}
                        <th className="text-center p-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Unique Student</td>
                        {monthlyStats.uniqueStudents.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.uniqueStudents.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-3 font-semibold">Categories</th>
                        {months.map(m => <th key={m} className="text-center p-3 font-semibold">{m}</th>)}
                        <th className="text-center p-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Application Sent</td>
                        {monthlyStats.applicationSent.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.applicationSent.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Decision Waiting</td>
                        {monthlyStats.decisionWaiting.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.decisionWaiting.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Conditional Offer</td>
                        {monthlyStats.conditionalOffer.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.conditionalOffer.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Unconditional Offer</td>
                        {monthlyStats.unconditionalOffer.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.unconditionalOffer.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Visa Process */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visa Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-3 font-semibold">Categories</th>
                        {months.map(m => <th key={m} className="text-center p-3 font-semibold">{m}</th>)}
                        <th className="text-center p-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Deposit Paid</td>
                        {monthlyStats.depositPaid.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.depositPaid.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Visa Letter Req Sent</td>
                        {monthlyStats.visaLetterReqSent.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.visaLetterReqSent.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Visa Letter Received</td>
                        {monthlyStats.visaLetterReceived.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.visaLetterReceived.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Student Joined</td>
                        {monthlyStats.studentJoined.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-blue-50">
                          {monthlyStats.studentJoined.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Visa Reject</td>
                        {monthlyStats.visaReject.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-red-50">
                          {monthlyStats.visaReject.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Negative Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-700">Negative Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-3 font-semibold">Categories</th>
                        {months.map(m => <th key={m} className="text-center p-3 font-semibold">{m}</th>)}
                        <th className="text-center p-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Declined</td>
                        {monthlyStats.declined.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-red-50">
                          {monthlyStats.declined.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">App Withdrawn</td>
                        {monthlyStats.appWithdrawn.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-red-50">
                          {monthlyStats.appWithdrawn.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">App Rejection</td>
                        {monthlyStats.appRejection.map((count, i) => (
                          <td key={i} className="p-3 text-center">{count || '-'}</td>
                        ))}
                        <td className="p-3 text-center font-bold bg-red-50">
                          {monthlyStats.appRejection.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Comparison charts coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Detailed analysis coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Business intelligence coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destination" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Destination analysis coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="university" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">University analysis coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}